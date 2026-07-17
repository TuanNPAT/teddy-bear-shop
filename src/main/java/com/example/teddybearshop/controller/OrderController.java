package com.example.teddybearshop.controller;

import com.example.teddybearshop.common.response.ApiResponse;
import com.example.teddybearshop.dto.request.OrderRequest;
import com.example.teddybearshop.dto.response.OrderResponse;
import com.example.teddybearshop.enums.OrderStatus;
import com.example.teddybearshop.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "Quản lý đơn hàng")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Operation(summary = "Tạo đơn hàng mới")
    public ApiResponse<OrderResponse> createOrder(@Valid @RequestBody OrderRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.createOrder(request))
                .build();
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Lấy chi tiết đơn hàng theo ID")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getOrderById(orderId))
                .build();
    }

    @GetMapping("/code/{orderCode}")
    @Operation(summary = "Lấy chi tiết đơn hàng theo mã")
    public ApiResponse<OrderResponse> getOrderByCode(@PathVariable String orderCode) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.getOrderByCode(orderCode))
                .build();
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả đơn hàng")
    public ApiResponse<List<OrderResponse>> getAllOrders() {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.getAllOrders())
                .build();
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Lấy danh sách đơn hàng theo trạng thái")
    public ApiResponse<List<OrderResponse>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ApiResponse.<List<OrderResponse>>builder()
                .result(orderService.getOrdersByStatus(status))
                .build();
    }

    @PatchMapping("/{orderId}/status")
    @Operation(summary = "Cập nhật trạng thái đơn hàng")
    public ApiResponse<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        return ApiResponse.<OrderResponse>builder()
                .result(orderService.updateOrderStatus(orderId, status))
                .build();
    }

    @PatchMapping("/{orderId}/cancel")
    @Operation(summary = "Hủy đơn hàng")
    public ApiResponse<Void> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) String reason
    ) {
        orderService.cancelOrder(orderId, reason);
        return ApiResponse.<Void>builder()
                .message("Order cancelled successfully")
                .build();
    }
}