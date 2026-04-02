package com.vtmen.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "maps")
public class CampusMapModel {

    /** Same value DCS uses in {@code map_name} (e.g. "Trường đại học"). */
    @Id
    private String mapName;

    private List<CampusMapPointEmbedded> points = new ArrayList<>();

    private Instant updatedAt;

    public CampusMapModel() {}

    public CampusMapModel(String mapName, List<CampusMapPointEmbedded> points, Instant updatedAt) {
        this.mapName = mapName;
        this.points = points != null ? points : new ArrayList<>();
        this.updatedAt = updatedAt;
    }

    public String getMapName() {
        return mapName;
    }

    public void setMapName(String mapName) {
        this.mapName = mapName;
    }

    public List<CampusMapPointEmbedded> getPoints() {
        return points;
    }

    public void setPoints(List<CampusMapPointEmbedded> points) {
        this.points = points;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
