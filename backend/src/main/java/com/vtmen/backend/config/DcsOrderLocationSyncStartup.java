package com.vtmen.backend.config;

import com.vtmen.backend.service.CampusMapService;
import com.vtmen.backend.service.DcsRemoteLocationsClient;
import com.vtmen.backend.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
 // Optional: after the app is ready, pull DCS locations and align all Mongo orders (see {@code vtmen.dcs.sync-orders-on-startup}).
@Component
@Order(Integer.MAX_VALUE)
public class DcsOrderLocationSyncStartup implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DcsOrderLocationSyncStartup.class);

    @Autowired
    private DcsApiProperties dcsApiProperties;

    @Autowired
    private DcsRemoteLocationsClient dcsRemoteLocationsClient;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CampusMapService campusMapService;

    @Override
    public void run(ApplicationArguments args) {
        if (!dcsApiProperties.isSyncOrdersOnStartup()) {
            return;
        }
        try {
            var points = dcsRemoteLocationsClient.fetchCampusPoints();
            if (points.isEmpty()) {
                log.warn("DCS startup sync: no points returned");
                return;
            }
            campusMapService.saveOrReplaceFromDcsPoints(dcsApiProperties.getMapName(), points);
            var r = orderService.syncOrderDestinationsFromDcsPoints(dcsApiProperties.getMapName(), points);
            log.info("DCS startup sync: points={} updated={} unmatched={}",
                    r.pointCount(), r.ordersUpdated(), r.ordersUnmatched());
        } catch (Exception e) {
            log.warn("DCS startup sync failed: {}", e.getMessage());
        }
    }
}
