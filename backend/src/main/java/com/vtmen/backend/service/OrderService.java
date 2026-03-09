package com.vtmen.backend.service;

import com.vtmen.backend.model.OrderModel;
import com.vtmen.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${notify.backend.url}")
    private String notifyBackendUrl;

    // Get active (non-completed, non-cancelled) orders
    public List<OrderModel> getActiveOrders() {
        Query query = new Query();
        query.addCriteria(Criteria.where("status").nin("delivered", "cancelled"));
        return mongoTemplate.find(query, OrderModel.class);
    }

    // Complete an order
    public void completeOrder(String id) {
        orderRepository.findById(id).ifPresent(order -> {
            order.setStatus("delivered");
            order.setCompletedTime(LocalDateTime.now());
            orderRepository.save(order);
        });
        redisTemplate.convertAndSend("order_topic", "REFRESH");
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
        // Generate order code like SK + 8 digits
        order.setOrderCode("SK" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 8).toUpperCase());
        OrderModel saved = orderRepository.save(order);
        redisTemplate.convertAndSend("order_topic", "REFRESH");
        // Notify the other backend (localhost:8081) so it can alert its clients
        try {
            restTemplate.postForEntity(notifyBackendUrl, saved, String.class);
            System.out.println("[Notify] Sent order to " + notifyBackendUrl);
        } catch (Exception e) {
            System.err.println("[Notify] Could not reach " + notifyBackendUrl + ": " + e.getMessage());
        }
        return saved;
    }

    // Get all orders
    public List<OrderModel> getAllOrders() {
        return orderRepository.findAll();
    }
}
