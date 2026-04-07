package com.vtmen.backend.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.vtmen.backend.config.DcsApiProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Collections;
import java.util.List;

@Service
public class DcsRemoteLocationsClient {

    private static final MediaType JSON_UTF8 =
            new MediaType("application", "json", java.nio.charset.StandardCharsets.UTF_8);

    @Autowired
    private RestClient robotRestClient;

    @Autowired
    private DcsApiProperties dcsApiProperties;
     // POST {@code /api/dcs/locations} using {@link com.vtmen.backend.config.DcsApiProperties#getMapName()}.
    public List<DcsCampusPoint> fetchCampusPoints() {
        return fetchCampusPoints(null);
    }
     // Raw DCS response (same JSON shape as DCS), for {@code GET /api/maps/dcs}.
    public DcsLocationsApiDtos.LocationsEnvelope fetchLocationsEnvelope(String mapName) {
        String resolved = (mapName != null && !mapName.isBlank())
                ? mapName.trim()
                : dcsApiProperties.getMapName();
        var body = new MapNameRequest(resolved);
        var entity = robotRestClient.post()
                .uri(dcsApiProperties.getLocationsUrl())
                .contentType(JSON_UTF8)
                .accept(JSON_UTF8)
                .body(body)
                .retrieve()
                .toEntity(DcsLocationsApiDtos.LocationsEnvelope.class);
        return entity.getBody();
    }
     // POST {@code /api/dcs/locations} with a specific {@code map_name}. DCS may return a different POI set per map.
     // @param mapName DCS map id; if null or blank, uses the configured default ({@code vtmen.dcs.map-name}).
    public List<DcsCampusPoint> fetchCampusPoints(String mapName) {
        try {
            DcsLocationsApiDtos.LocationsEnvelope env = fetchLocationsEnvelope(mapName);
            if (env == null || env.data() == null || env.data().points() == null) {
                return Collections.emptyList();
            }
            return env.data().points().stream()
                    .filter(p -> p.name() != null && !p.name().isBlank()
                            && p.address() != null && !p.address().isBlank())
                    .toList();
        } catch (RestClientException e) {
            throw new IllegalStateException("DCS locations API failed: " + e.getMessage(), e);
        }
    }

    private record MapNameRequest(@JsonProperty("map_name") String mapName) {}
}
