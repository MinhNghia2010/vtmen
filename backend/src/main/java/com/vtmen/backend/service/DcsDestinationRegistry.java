package com.vtmen.backend.service;

import com.vtmen.backend.config.DcsApiProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Component;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * In-memory index of canonical {@code name} → {@code address} for sendtask.
 * Loaded from Mongo via {@link CampusMapService} at startup; refreshed after DCS sync pulls.
 */
@Component
@DependsOn("campusMapService")
public class DcsDestinationRegistry {

    public record Result(String name, String addressText) {}

    private final Map<String, Result> byNormName = new LinkedHashMap<>();

    @Autowired
    private CampusMapService campusMapService;

    @Autowired
    private DcsApiProperties dcsApiProperties;

    @PostConstruct
    public void init() {
        reloadFromMongo();
    }

    /** Reload default configured map from {@link CampusMapService} (Mongo {@code maps}). */
    public synchronized void reloadFromMongo() {
        List<DcsCampusPoint> pts = campusMapService.getDcsPoints(dcsApiProperties.getMapName());
        applyFromRemotePoints(pts);
    }

    public static String nfc(String s) {
        if (s == null) {
            return "";
        }
        return Normalizer.normalize(s.trim(), Normalizer.Form.NFC);
    }

    private void add(String name, String address) {
        byNormName.put(nfc(name), new Result(name, address));
    }

    /**
     * Replace registry from DCS / API points (non-empty list only).
     */
    public synchronized void applyFromRemotePoints(List<DcsCampusPoint> remote) {
        if (remote == null || remote.isEmpty()) {
            return;
        }
        byNormName.clear();
        for (DcsCampusPoint p : remote) {
            add(p.name(), p.address());
        }
    }

    public Optional<Result> resolve(String destinationName, String fallbackName) {
        String nameHint = destinationName != null && !destinationName.isBlank()
                ? destinationName.trim()
                : fallbackName;
        if (nameHint == null || nameHint.isBlank()) {
            return Optional.empty();
        }
        Result r = byNormName.get(nfc(nameHint));
        return Optional.ofNullable(r);
    }
}
