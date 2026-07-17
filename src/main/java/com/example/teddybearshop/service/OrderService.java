package com.example.teddybearshop.service;

import com.example.teddybearshop.dto.request.OrderFilterRequest;
import com.example.teddybearshop.dto.request.OrderRequest;
import com.example.teddybearshop.dto.response.OrderResponse;
import com.example.teddybearshop.enums.OrderStatus;
import org.springframework.data.domain.Page;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(OrderRequest request);

    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);

    OrderResponse getOrderById(Long orderId);

    Page<OrderResponse> filterOrders(OrderFilterRequest request);

    List<OrderResponse> getMyOrders();

    List<OrderResponse> getOrdersByStatus(OrderStatus status);

    void cancelOrder(Long orderId, String reason);
}