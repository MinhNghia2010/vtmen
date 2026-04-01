package com.vtmen.backend.service;

import com.vtmen.backend.model.OrderModel;
import com.vtmen.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // Get order by orderCode
    public Optional<OrderModel> getOrderByOrderCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode);
    }

    // Get completed orders
    public List<OrderModel> getCompletedOrders() {
        Query query = new Query();
        query.addCriteria(Criteria.where("status").is("delivered"));
        return mongoTemplate.find(query, OrderModel.class);
    }

    // Get cancelled orders
    public List<OrderModel> getCancelledOrders() {
        Query query = new Query();
        query.addCriteria(Criteria.where("status").is("cancelled"));
        return mongoTemplate.find(query, OrderModel.class);
    }

    // Get shipping orders
    public List<OrderModel> getShippingOrders() {
        Query query = new Query();
        query.addCriteria(Criteria.where("status").is("shipping"));
        return mongoTemplate.find(query, OrderModel.class);
    }

    // Get placed orders
    public List<OrderModel> getPlacedOrders() {
        Query query = new Query();
        query.addCriteria(Criteria.where("status").is("placed"));
        return mongoTemplate.find(query, OrderModel.class);
    }

    // Get active (non-completed, non-cancelled) orders
    public List<OrderModel> getActiveOrders() {
        Query query = new Query();
        query.addCriteria(Criteria.where("status").nin("delivered", "cancelled"));
        return mongoTemplate.find(query, OrderModel.class);
    }
    // Get pending orders
    public List<OrderModel> getPendingOrders() {
        Query query = new Query();
        query.addCriteria(Criteria.where("status").is("pending"));
        return mongoTemplate.find(query, OrderModel.class);
    }

    // Get pending order by orderCode
    public Optional<OrderModel> getPendingOrderByOrderCode(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .filter(order -> "pending".equalsIgnoreCase(order.getStatus()));
    }

    public Optional<OrderModel> updateOrderStatusPendingToPlaced(String orderCode) {
        return orderRepository.findByOrderCode(orderCode)
                .filter(order -> "pending".equalsIgnoreCase(order.getStatus()))
                .map(order -> {
                    order.setStatus("placed");
                    OrderModel saved = orderRepository.save(order);
                    publishActiveOrders();
                    return saved;
                });
    }

    public Optional<OrderModel> acceptDepositByQr(String orderCode) {
        // Accept only if order exists and is not cancelled/delivered.
        // If it's pending, move it to placed to mark it as accepted for deposit.
        return orderRepository.findByOrderCode(orderCode)
                .filter(order -> order.getStatus() == null
                        || (!"cancelled".equalsIgnoreCase(order.getStatus())
                        && !"delivered".equalsIgnoreCase(order.getStatus())))
                .map(order -> {
                    if (order.getStatus() == null || "pending".equalsIgnoreCase(order.getStatus())) {
                        order.setStatus("placed");
                    }
                    OrderModel saved = orderRepository.save(order);
                    publishActiveOrders();
                    return saved;
                });
    }

    /**
     * DCS deposit-closed: never changes order status.
     * If the order has no compartment_id, requires request compartment_id — sets compartment + deposited time, message "Placed successfully".
     * If the order already has a compartment_id, clears compartment_id and deposited time (locker released).
     */
    public Optional<String> applyDepositClosed(String orderCode, Integer requestCompartmentId, OffsetDateTime closedAt) {
        Optional<OrderModel> eligible = orderRepository.findByOrderCode(orderCode)
                .filter(order -> order.getStatus() == null
                        || (!"cancelled".equalsIgnoreCase(order.getStatus())
                        && !"delivered".equalsIgnoreCase(order.getStatus())));

        if (eligible.isEmpty()) {
            return Optional.empty();
        }

        OrderModel order = eligible.get();

        if (order.getCompartmentId() == null) {
            if (requestCompartmentId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing compartment_id");
            }
            order.setCompartmentId(requestCompartmentId);
            if (closedAt != null) {
                order.setDepositedTime(closedAt.toLocalDateTime());
            } else {
                order.setDepositedTime(LocalDateTime.now());
            }
            orderRepository.save(order);
            publishActiveOrders();
            return Optional.of("Placed successfully");
        }

        order.setCompartmentId(null);
        order.setDepositedTime(null);
        orderRepository.save(order);
        publishActiveOrders();
        return Optional.of("Compartment removed");
    }

    public Optional<OrderModel> markArrived(String orderCode, OffsetDateTime arrivalAt) {
        return orderRepository.findByOrderCode(orderCode)
                .filter(order -> order.getStatus() == null
                        || (!"cancelled".equalsIgnoreCase(order.getStatus())
                        && !"delivered".equalsIgnoreCase(order.getStatus())))
                .map(order -> {
                    if (arrivalAt != null) {
                        order.setArrivalTime(arrivalAt.toLocalDateTime());
                    } else {
                        order.setArrivalTime(LocalDateTime.now());
                    }
                    OrderModel saved = orderRepository.save(order);
                    publishActiveOrders();
                    return saved;
                });
    }

    // Complete an order
    public void completeOrder(String id) {
        orderRepository.findByOrderCode(id).ifPresent(order -> {
            order.setStatus("delivered");
            order.setCompletedTime(LocalDateTime.now());
            orderRepository.save(order);
            publishActiveOrders();
        });
    }

    // Search completed/all orders with filters
    public List<OrderModel> searchHistory(String date, String name, String phone, Integer quantity,
            String orderCode) {
        Query query = new Query();
        query.addCriteria(Criteria.where("status").in("delivered", "cancelled"));

        if (date != null && !date.isEmpty()) {
            LocalDate d = LocalDate.parse(date);
            query.addCriteria(Criteria.where("createdTime").gte(d.atStartOfDay()).lt(d.plusDays(1).atStartOfDay()));
        }
        if (name != null && !name.isEmpty()) {
            query.addCriteria(Criteria.where("fullName").regex(name, "i"));
        }
        if (phone != null && !phone.isEmpty()) {
            query.addCriteria(Criteria.where("phone").regex(phone));
        }
        if (quantity != null) {
            query.addCriteria(Criteria.where("quantity").is(quantity));
        }
        if (orderCode != null && !orderCode.isEmpty()) {
            query.addCriteria(Criteria.where("orderCode").regex(orderCode, "i"));
        }

        return mongoTemplate.find(query, OrderModel.class);
    }

    // Create a new order
    public OrderModel createOrder(OrderModel order) {
        if (order.getStatus() == null || order.getStatus().isEmpty()) {
            order.setStatus("pending");
        }
        order.setOrderCode("SK" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 8).toUpperCase());
        OrderModel saved = orderRepository.save(order);
        publishActiveOrders();
        return saved;
    }

    // Update an existing order
    public OrderModel updateOrder(String id, OrderModel updates) {
        return orderRepository.findByOrderCode(id).map(order -> {
            if (updates.getFullName() != null) order.setFullName(updates.getFullName());
            if (updates.getPhone() != null) order.setPhone(updates.getPhone());
            if (updates.getAddress() != null) order.setAddress(updates.getAddress());
            if (updates.getQuantity() != null) order.setQuantity(updates.getQuantity());
            if (updates.getNote() != null) order.setNote(updates.getNote());
            OrderModel saved = orderRepository.save(order);
            publishActiveOrders();
            return saved;
        }).orElse(null);
    }

    // Cancel an order
    public void cancelOrder(String id) {
        orderRepository.findByOrderCode(id).ifPresent(order -> {
            order.setStatus("cancelled");
            orderRepository.save(order);
        });
        publishActiveOrders();
    }

    // Get all orders
    public List<OrderModel> getAllOrders() {
        return orderRepository.findAll();
    }

    private void publishActiveOrders() {
        try {
            List<OrderModel> active = getActiveOrders();
            messagingTemplate.convertAndSend("/topic/orders", active);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

