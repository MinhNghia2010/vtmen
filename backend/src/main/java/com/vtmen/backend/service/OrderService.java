package com.vtmen.backend.service;

import com.vtmen.backend.model.OrderModel;
import com.vtmen.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

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
    }

    // Search completed/all orders with filters
    public List<OrderModel> searchHistory(String date, String name, String phone, Integer quantity,
            String orderCode) {
        Query query = new Query();
        query.addCriteria(Criteria.where("status").is("delivered"));

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
        return orderRepository.save(order);
    }

    // Get all orders
    public List<OrderModel> getAllOrders() {
        return orderRepository.findAll();
    }
}
