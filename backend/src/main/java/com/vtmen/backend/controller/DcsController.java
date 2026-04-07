package com.vtmen.backend.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.vtmen.backend.config.DcsApiProperties;
import com.vtmen.backend.model.OrderModel;
import com.vtmen.backend.service.CampusMapService;
import com.vtmen.backend.service.DcsRemoteLocationsClient;
import com.vtmen.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/dcs")
public class DcsController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private DcsRemoteLocationsClient dcsRemoteLocationsClient;

    @Autowired
    private CampusMapService campusMapService;

    @Autowired
    private DcsApiProperties dcsApiProperties;

    // POST /api/dcs/qr-scanned — Robot quét QR thành công (DCS gọi vào vtmen)
    // Returns action ACCEPT_DEPOSIT or REJECT for DCS to act immediately.
    @PostMapping("/qr-scanned")
    public ResponseEntity<QrScannedResponse> qrScanned(@RequestBody QrScannedRequest body) {
        if (body == null) {
            return ResponseEntity.badRequest().body(QrScannedResponse.reject("Missing body"));
        }
        String orderCode = body.qrContent();
        if (orderCode == null || orderCode.isBlank()) {
            return ResponseEntity.badRequest().body(QrScannedResponse.reject("Missing qr_content"));
        }

        // Pickup flow: shipping + has compartment => tell DCS which compartment to open,
        // then order is updated to delivered and compartment is cleared.
        var pickupResult = orderService.completePickupByQr(orderCode);
        if (pickupResult.isPresent()) {
            return ResponseEntity.ok(QrScannedResponse.pickUpResponse(
                    pickupResult.get().orderCode(),
                    pickupResult.get().compartmentId()
            ));
        }

        return orderService.acceptDepositByQr(orderCode)
                .map(order -> ResponseEntity.ok(QrScannedResponse.accept(order)))
                .orElseGet(() -> ResponseEntity.badRequest().body(QrScannedResponse.reject("Mã QR không hợp lệ hoặc đã bị hủy")));
    }

    // POST /api/dcs/deposit-closed — Đã nạp hàng xong / cửa tủ đóng (DCS gọi vào vtmen).
    // Does not change order status. No compartment yet → set compartment + time, message "Placed successfully".
    // Already has compartment → clear compartment + deposited time, message "Compartment removed".
    @PostMapping("/deposit-closed")
    public ResponseEntity<SimpleResponse> depositClosed(@RequestBody DepositClosedRequest body) {
        if (body == null) {
            return ResponseEntity.badRequest().body(new SimpleResponse(400, "Missing body"));
        }
        String orderCode = body.orderId();
        if (orderCode == null || orderCode.isBlank()) {
            return ResponseEntity.badRequest().body(new SimpleResponse(400, "Missing order_id"));
        }

        try {
            return orderService.applyDepositClosed(orderCode, body.compartmentId(), body.closedAt())
                    .map(msg -> ResponseEntity.ok(new SimpleResponse(200, msg)))
                    .orElseGet(() -> ResponseEntity.status(404).body(
                            new SimpleResponse(404, "Order not found or not eligible for deposit")));
        } catch (ResponseStatusException ex) {
            int code = ex.getStatusCode().value();
            String reason = ex.getReason();
            return ResponseEntity.status(ex.getStatusCode()).body(
                    new SimpleResponse(code, reason != null ? reason : "Bad request"));
        }
    }
     // VtMen: fetch DCS map points, refresh destination cache, update every order's {@code destinationName} +
     // {@code address} when a POI matches.
     // <p>Optional body: {@code { "map_name": "Other map" }} — otherwise uses {@code vtmen.dcs.map-name}.
    @PostMapping("/sync-order-locations-from-dcs")
    public ResponseEntity<OrderLocationSyncResponse> syncOrderLocationsFromDcs(
            @RequestBody(required = false) SyncOrderLocationsRequest body
    ) {
        try {
            String mapOverride = body != null ? body.mapName() : null;
            String mapKey = (mapOverride != null && !mapOverride.isBlank())
                    ? mapOverride.trim()
                    : dcsApiProperties.getMapName();
            var points = dcsRemoteLocationsClient.fetchCampusPoints(mapKey);
            if (points.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        new OrderLocationSyncResponse(0, 0, 0, "DCS returned no points (check map_name / network)"));
            }
            campusMapService.saveOrReplaceFromDcsPoints(mapKey, points);

            if (!mapKey.equals(dcsApiProperties.getMapName())) {
                return ResponseEntity.ok(new OrderLocationSyncResponse(
                        points.size(),
                        0,
                        0,
                        "Saved map to Mongo; registry/order sync skipped (not default vtmen.dcs.map-name)"));
            }

            OrderService.DcsOrderLocationSyncResult r =
                    orderService.syncOrderDestinationsFromDcsPoints(mapKey, points);
            return ResponseEntity.ok(new OrderLocationSyncResponse(
                    r.pointCount(),
                    r.ordersUpdated(),
                    r.ordersUnmatched(),
                    "OK"));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(
                    new OrderLocationSyncResponse(0, 0, 0, ex.getMessage() != null ? ex.getMessage() : "sync failed"));
        }
    }

    public record SyncOrderLocationsRequest(@JsonProperty("map_name") String mapName) {}

    public record OrderLocationSyncResponse(
            int pointCount,
            int ordersUpdated,
            int ordersUnmatched,
            String message
    ) {}

    // POST /api/dcs/arrival-notify — Báo cáo đến (DCS gọi vào vtmen)
    @PostMapping("/arrival-notify")
    public ResponseEntity<SimpleResponse> arrivalReport(@RequestBody ArrivalReportRequest body) {
        if (body == null) {
            return ResponseEntity.badRequest().body(new SimpleResponse(400, "Missing body"));
        }
        String orderCode = body.orderId();
        if (orderCode == null || orderCode.isBlank()) {
            return ResponseEntity.badRequest().body(new SimpleResponse(400, "Missing order_id"));
        }
        return orderService.markArrived(orderCode, body.arrivalAt())
                .map(o -> ResponseEntity.ok(new SimpleResponse(200, "Arrived status updated. Notifying user.")))
                .orElseGet(() -> ResponseEntity.status(404).body(
                        new SimpleResponse(404, "Order not found or not eligible for arrival update")));
    }

    public record QrScannedRequest(
            @JsonProperty("event_id") String eventId,
            @JsonProperty("robot_id") String robotId,
            @JsonProperty("qr_content") String qrContent,
            @JsonProperty("scanned_at") OffsetDateTime scannedAt
    ) {}

    public record DepositClosedRequest(
            @JsonProperty("event_id") String eventId,
            @JsonProperty("robot_id") String robotId,
            @JsonProperty("order_id") String orderId,
            @JsonProperty("compartment_id") Integer compartmentId,
            @JsonProperty("closed_at") OffsetDateTime closedAt
    ) {}

    public record QrScannedResponse(
            int status,
            String action,
            @JsonProperty("order_id") String orderId,
            @JsonProperty("compartment_id") Integer compartmentId,
            String message
    ) {
        static QrScannedResponse accept(OrderModel order) {
            return new QrScannedResponse(
                    200,
                    "ACCEPT_DEPOSIT",
                    order.getOrderCode(),
                    null,
                    "Mã QR hợp lệ, cho phép cất hàng"
            );
        }

        static QrScannedResponse reject(String message) {
            return new QrScannedResponse(
                    400,
                    "REJECT",
                    null,
                    null,
                    message
            );
        }

        static QrScannedResponse pickUpResponse(String orderCode, Integer compartmentId) {
            return new QrScannedResponse(
                200,
                "OPEN_COMPARTMENT",
                orderCode,
                compartmentId,
                "Mã QR hợp lệ, mở tủ để nhận hàng"
        );
        }
    }

    public record ArrivalReportRequest(
        @JsonProperty("event_id") String eventId,
        @JsonProperty("robot_id") String robotId,
        @JsonProperty("order_id") String orderId,
        @JsonProperty("arrival_at") OffsetDateTime arrivalAt
    ) {}

    public record SimpleResponse(int status, String message) {}
}

