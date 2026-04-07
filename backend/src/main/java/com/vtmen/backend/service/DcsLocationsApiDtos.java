package com.vtmen.backend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

// Wire format for DCS POST {@code /api/dcs/locations} (and our GET proxy {@code /api/maps/dcs}).
public final class DcsLocationsApiDtos {
    private DcsLocationsApiDtos() {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LocationsEnvelope(
            Integer status,
            String message,
            LocationsData data
    ) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LocationsData(
            @JsonProperty("total_items") Integer totalItems,
            List<DcsCampusPoint> points
    ) {}
}
