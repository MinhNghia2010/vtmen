package com.vtmen.backend.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.vtmen.backend.config.RobotTaskProperties;
import com.vtmen.backend.model.OrderModel;
import com.vtmen.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
public class RobotDispatchService {

    // Explicit UTF-8 so DCS receives correct Vietnamese in destination.name (avoid server defaulting to Latin-1).
    private static final MediaType APPLICATION_JSON_UTF8 =
            new MediaType("application", "json", StandardCharsets.UTF_8);

    @Autowired
    private RestClient robotRestClient;

    @Autowired
    private RobotTaskProperties robotTaskProperties;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    @Autowired
    private DcsDestinationRegistry dcsDestinationRegistry;
     // POST sendtask to DCS; on SUCCESS marks order {@code shipping}.
     // <p>
     // The JSON sent to DCS is built from the saved order: {@code order_id} = {@link OrderModel#getOrderCode()},
     // {@code compartment_id} from the order, {@code destination.address_text} from {@link OrderModel#getAddress()},
     // {@code destination.name} from {@link OrderModel#getDestinationName()} if set, else config default.
     // Optional {@link DispatchRobotRequest} only overrides {@code robot_id} and destination fields when provided.
    public DispatchRobotResult dispatchPlacedOrder(String orderCode, DispatchRobotRequest request) {
        DispatchRobotRequest req = request != null ? request : new DispatchRobotRequest(null, null);

        OrderModel order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

        if (!"placed".equalsIgnoreCase(order.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Order must be placed to dispatch robot (current: " + order.getStatus() + ")");
        }
        if (order.getCompartmentId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "compartment_id is required — assign via POST /api/dcs/deposit-closed first");
        }

        String robotId = (req.robotId() != null && !req.robotId().isBlank())
                ? req.robotId().trim()
                : robotTaskProperties.getDefaultRobotId();

        SendTaskVtMenRequest.DestinationPayload dest = buildDestination(order, req);

        SendTaskVtMenRequest body = new SendTaskVtMenRequest(
                order.getOrderCode(),
                robotId,
                order.getCompartmentId(),
                dest
        );

        SendTaskVtMenResponse robotBody;
        try {
            ResponseEntity<SendTaskVtMenResponse> entity = robotRestClient.post()
                    .uri(robotTaskProperties.getSendTaskUrl())
                    .contentType(APPLICATION_JSON_UTF8)
                    .accept(APPLICATION_JSON_UTF8)
                    .body(body)
                    .retrieve()
                    .toEntity(SendTaskVtMenResponse.class);

            if (!entity.getStatusCode().is2xxSuccessful()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Robot API returned HTTP " + entity.getStatusCode().value());
            }
            robotBody = entity.getBody();
        } catch (RestClientResponseException e) {
            String hint = e.getResponseBodyAsString();
            if (hint != null && hint.length() > 200) {
                hint = hint.substring(0, 200) + "...";
            }
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Robot API error: HTTP " + e.getStatusCode().value()
                            + (hint != null && !hint.isBlank() ? " — " + hint : ""));
        } catch (RestClientException e) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Robot API unreachable: " + e.getMessage());
        }

        if (robotBody == null || robotBody.status() == null
                || !"SUCCESS".equalsIgnoreCase(robotBody.status())) {
            String msg = robotBody != null && robotBody.message() != null
                    ? robotBody.message()
                    : "Robot did not return SUCCESS";
            throw new ResponseStatusException(HttpStatus.CONFLICT, msg);
        }

        OrderModel updated = orderService.markOrderShipping(orderCode)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT,
                        "Could not move order to shipping"));

        return new DispatchRobotResult(
                updated,
                robotBody.status(),
                robotBody.message(),
                robotBody.estimatedTimeOfArrival()
        );
    }

    private SendTaskVtMenRequest.DestinationPayload buildDestination(OrderModel order, DispatchRobotRequest req) {
        String fallbackName = robotTaskProperties.getDefaultDestinationName();
        String name = fallbackName;
        if (order.getDestinationName() != null && !order.getDestinationName().isBlank()) {
            name = order.getDestinationName().trim();
        }
        String addressText = order.getAddress() != null ? order.getAddress().trim() : "";

        Optional<DcsDestinationRegistry.Result> canon = dcsDestinationRegistry.resolve(
                order.getDestinationName(), fallbackName);
        if (canon.isPresent()) {
            name = canon.get().name();
            addressText = canon.get().addressText();
        }

        if (req.destination() != null) {
            if (req.destination().name() != null && !req.destination().name().isBlank()) {
                name = req.destination().name().trim();
            }
            if (req.destination().addressText() != null && !req.destination().addressText().isBlank()) {
                addressText = req.destination().addressText().trim();
            }
        }

        return new SendTaskVtMenRequest.DestinationPayload(
                DcsDestinationRegistry.nfc(name),
                DcsDestinationRegistry.nfc(addressText));
    }

    // --- Request to vtmen backend (optional body from dashboard) ---

    public record DispatchRobotRequest(
            @JsonProperty("robot_id") String robotId,
            @JsonProperty("destination") DestinationOverride destination
    ) {
        public record DestinationOverride(
                String name,
                @JsonProperty("address_text") String addressText
        ) {}
    }

    public record DispatchRobotResult(
            OrderModel order,
            @JsonProperty("robot_status") String robotStatus,
            String message,
            @JsonProperty("estimated_time_of_arrival") Integer estimatedTimeOfArrival
    ) {}

    // --- Payload / response for external DCS ---

    private record SendTaskVtMenRequest(
            @JsonProperty("order_id") String orderId,
            @JsonProperty("robot_id") String robotId,
            @JsonProperty("compartment_id") int compartmentId,
            @JsonProperty("destination") DestinationPayload destination
    ) {
        private record DestinationPayload(
                String name,
                @JsonProperty("address_text") String addressText
        ) {}
    }

    private record SendTaskVtMenResponse(
            String status,
            String message,
            @JsonProperty("estimated_time_of_arrival") Integer estimatedTimeOfArrival
    ) {}
}
