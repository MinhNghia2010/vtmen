package com.vtmen.backend.service;

import com.vtmen.backend.bootstrap.CampusMapSeedCatalog;
import com.vtmen.backend.config.DcsApiProperties;
import com.vtmen.backend.model.CampusMapModel;
import com.vtmen.backend.model.CampusMapPointEmbedded;
import com.vtmen.backend.repository.CampusMapRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CampusMapService {

    private static final Logger log = LoggerFactory.getLogger(CampusMapService.class);

    @Autowired
    private CampusMapRepository campusMapRepository;

    @Autowired
    private DcsApiProperties dcsApiProperties;

    @Autowired
    private DcsRemoteLocationsClient dcsRemoteLocationsClient;

    /**
     * If {@code maps} has no usable POIs: seed from {@link CampusMapSeedCatalog}, then try DCS for
     * {@code vtmen.dcs.map-name}. Safe to run on every startup (idempotent).
     */
    public void seedMapsIfDatabaseEmpty() {
        for (String mapKey : CampusMapSeedCatalog.knownSeedMapKeys()) {
            seedCatalogMapIfNeeded(mapKey);
        }
        String defaultKey = dcsApiProperties.getMapName();
        if (needsPoints(defaultKey)) {
            try {
                List<DcsCampusPoint> fromDcs = dcsRemoteLocationsClient.fetchCampusPoints(defaultKey);
                if (fromDcs != null && !fromDcs.isEmpty()) {
                    saveOrReplaceFromDcsPoints(defaultKey, fromDcs);
                    log.info("Seeded map \"{}\" from DCS ({} points)", defaultKey, fromDcs.size());
                }
            } catch (IllegalStateException ex) {
                log.warn("Could not seed map \"{}\" from DCS: {}", defaultKey, ex.getMessage());
            }
        }
    }

    private boolean needsPoints(String mapKey) {
        if (mapKey == null || mapKey.isBlank()) {
            return true;
        }
        return campusMapRepository.findById(mapKey.trim())
                .map(doc -> toDcsCampusPoints(doc).isEmpty())
                .orElse(true);
    }

    private void seedCatalogMapIfNeeded(String key) {
        if (key == null || key.isBlank()) {
            return;
        }
        String trimmed = key.trim();
        Optional<CampusMapModel> existing = campusMapRepository.findById(trimmed);
        if (existing.isEmpty()) {
            CampusMapSeedCatalog.embeddedPointsForMap(trimmed).ifPresent(points -> {
                campusMapRepository.save(new CampusMapModel(
                        trimmed,
                        new ArrayList<>(points),
                        Instant.now()));
                log.info("Inserted catalog seed for map \"{}\" ({} points)", trimmed, points.size());
            });
            return;
        }
        CampusMapModel doc = existing.get();
        if (toDcsCampusPoints(doc).isEmpty()) {
            CampusMapSeedCatalog.embeddedPointsForMap(trimmed).ifPresent(points -> {
                doc.setPoints(new ArrayList<>(points));
                doc.setUpdatedAt(Instant.now());
                campusMapRepository.save(doc);
                log.info("Refilled empty map \"{}\" from catalog ({} points)", trimmed, points.size());
            });
        }
    }

    public List<DcsCampusPoint> getDcsPoints(String mapName) {
        String key = mapName != null && !mapName.isBlank() ? mapName.trim() : dcsApiProperties.getMapName();
        return campusMapRepository.findById(key)
                .map(CampusMapService::toDcsCampusPoints)
                .orElse(List.of());
    }

    public List<String> listMapNames() {
        return campusMapRepository.findAll().stream()
                .map(CampusMapModel::getMapName)
                .sorted()
                .collect(Collectors.toList());
    }

    /** Replace one map with points from DCS (or any source). */
    public void saveOrReplaceFromDcsPoints(String mapName, List<DcsCampusPoint> points) {
        if (mapName == null || mapName.isBlank() || points == null || points.isEmpty()) {
            return;
        }
        List<CampusMapPointEmbedded> embedded = points.stream()
                .map(p -> new CampusMapPointEmbedded(
                        p.name(),
                        p.address(),
                        p.coordinates() != null ? p.coordinates().lat() : null,
                        p.coordinates() != null ? p.coordinates().lng() : null,
                        p.status()))
                .toList();
        campusMapRepository.save(new CampusMapModel(mapName.trim(), embedded, Instant.now()));
    }

    static List<DcsCampusPoint> toDcsCampusPoints(CampusMapModel doc) {
        if (doc.getPoints() == null) {
            return List.of();
        }
        return doc.getPoints().stream()
                .filter(p -> p.getName() != null && !p.getName().isBlank()
                        && p.getAddress() != null && !p.getAddress().isBlank())
                .map(p -> new DcsCampusPoint(
                        p.getName(),
                        p.getAddress(),
                        p.getLat() != null && p.getLng() != null
                                ? new DcsCampusPoint.Coordinates(p.getLng(), p.getLat())
                                : null,
                        p.getStatus()))
                .toList();
    }
}
