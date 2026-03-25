package com.vtmen.backend.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.vtmen.backend.model.OrderModel;
import com.vtmen.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;

@RestController
@RequestMapping("/api/dcs")
public class DcsController {

    @Autowired
    private OrderService orderService;

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

        return orderService.acceptDepositByQr(orderCode)
                .map(order -> ResponseEntity.ok(QrScannedResponse.accept(order)))
                .orElseGet(() -> ResponseEntity.badRequest().body(QrScannedResponse.reject("Mã QR không hợp lệ hoặc đã bị hủy")));
    }

    // POST /api/dcs/deposit-closed — Đã nạp hàng xong / cửa tủ đóng (DCS gọi vào vtmen)
    @PostMapping("/deposit-closed")
    public ResponseEntity<SimpleResponse> depositClosed(@RequestBody DepositClosedRequest body) {
        if (body == null) {
            return ResponseEntity.badRequest().body(new SimpleResponse(400, "Missing body"));
        }
        String orderCode = body.orderId();
        if (orderCode == null || orderCode.isBlank()) {
            return ResponseEntity.badRequest().body(new SimpleResponse(400, "Missing order_id"));
        }

        return orderService.markDeposited(orderCode, body.compartmentId(), body.closedAt())
                .map(o -> ResponseEntity.ok(new SimpleResponse(200, "Received successfully")))
                .orElseGet(() -> ResponseEntity.status(404).body(
                        new SimpleResponse(404, "Order not found or not eligible for deposit")));
    }

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

        static QrScannedResponse pickUpResponse(OrderModel order) {
            return new QrScannedResponse(
                200,
                "ACCEPT_DEPOSIT",
                order.getOrderCode(),
                order.getCompartmentId(),
                "Mã QR hợp lệ, cho phép cất hàng"
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

