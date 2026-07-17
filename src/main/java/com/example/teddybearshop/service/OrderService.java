package com.example.teddybearshop.service;

import com.example.teddybearshop.dto.request.OrderRequest;
import com.example.teddybearshop.dto.response.OrderResponse;
import com.example.teddybearshop.enums.OrderStatus;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request);

    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);

    OrderResponse getOrderById(Long orderId);

    OrderResponse getOrderByCode(String orderCode);

    List<OrderResponse> getAllOrders();

    List<OrderResponse> getOrdersByStatus(OrderStatus status);

    void cancelOrder(Long orderId, String reason);
}