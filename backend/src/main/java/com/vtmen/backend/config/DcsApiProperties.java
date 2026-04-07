package com.vtmen.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "vtmen.dcs")
public class DcsApiProperties {

    private String locationsUrl = "http://223.130.11.193:10101/api/dcs/locations";

    // Request body field for POST locations.
    private String mapName = "Trường đại học";

    // When true, run DCS location fetch and order rewrite once after the app starts.
    private boolean syncOrdersOnStartup = false;

    public String getLocationsUrl() {
        return locationsUrl;
    }

    public void setLocationsUrl(String locationsUrl) {
        this.locationsUrl = locationsUrl;
    }

    public String getMapName() {
        return mapName;
    }

    public void setMapName(String mapName) {
        this.mapName = mapName;
    }

    public boolean isSyncOrdersOnStartup() {
        return syncOrdersOnStartup;
    }

    public void setSyncOrdersOnStartup(boolean syncOrdersOnStartup) {
        this.syncOrdersOnStartup = syncOrdersOnStartup;
    }
}
