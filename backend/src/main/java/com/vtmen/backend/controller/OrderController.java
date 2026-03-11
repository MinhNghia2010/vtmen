package com.vtmen.backend.controller;

import com.vtmen.backend.model.OrderModel;
import com.vtmen.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // GET /api/orders/active — Active orders (non-delivered, non-cancelled)
    @GetMapping("/active")
    public List<OrderModel> getActiveOrders() {
        return orderService.getActiveOrders();
    }

    // GET /api/orders/history — Search delivered orders
    @GetMapping("/history")
    public List<OrderModel> searchHistory(
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phone,
            @RequestParam(required = false) Integer quantity,
            @RequestParam(required = false) String orderCode) {
        return orderService.searchHistory(date, name, phone, quantity, orderCode);
    }

    // GET /api/orders — All orders
    @GetMapping
    public List<OrderModel> getAllOrders() {
        return orderService.getAllOrders();
    }

    // POST /api/orders/create — Create a new order
    @PostMapping("/create")
    public OrderModel createOrder(@RequestBody OrderModel order) {
        return orderService.createOrder(order);
    }

    // POST /api/orders/{id}/complete — Mark order as delivered
    @PostMapping("/{id}/complete")
    public void completeOrder(@PathVariable String id) {
        orderService.completeOrder(id);
    }

    // PUT /api/orders/{id} — Update an existing order
    @PutMapping("/{id}")
    public OrderModel updateOrder(@PathVariable String id, @RequestBody OrderModel updates) {
        return orderService.updateOrder(id, updates);
    }

    // POST /api/orders/{id}/cancel — Cancel an order
    @PostMapping("/{id}/cancel")
    public void cancelOrder(@PathVariable String id) {
        orderService.cancelOrder(id);
    }
}
