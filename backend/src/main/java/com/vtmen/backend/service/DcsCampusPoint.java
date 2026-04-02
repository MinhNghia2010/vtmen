package com.vtmen.backend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** One POI from DCS {@code /api/dcs/locations} {@code data.points[]}. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record DcsCampusPoint(
        String name,
        String address,
        Coordinates coordinates,
        String status
) {
    public DcsCampusPoint(String name, String address) {
        this(name, address, null, null);
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Coordinates(Double lng, Double lat) {}
}
