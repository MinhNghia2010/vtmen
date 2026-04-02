package com.vtmen.backend.model;

/**
 * One POI stored inside {@link CampusMapModel#points}.
 */
public class CampusMapPointEmbedded {

    private String name;
    private String address;
    private Double lat;
    private Double lng;
    private String status;

    public CampusMapPointEmbedded() {}

    public CampusMapPointEmbedded(String name, String address, Double lat, Double lng, String status) {
        this.name = name;
        this.address = address;
        this.lat = lat;
        this.lng = lng;
        this.status = status;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Double getLat() {
        return lat;
    }

    public void setLat(Double lat) {
        this.lat = lat;
    }

    public Double getLng() {
        return lng;
    }

    public void setLng(Double lng) {
        this.lng = lng;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
