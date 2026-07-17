package com.example.teddybearshop.controller;

import com.example.teddybearshop.common.response.ApiResponse;
import com.example.teddybearshop.dto.request.PaymentRequest;
import com.example.teddybearshop.dto.response.PaymentResponse;
import com.example.teddybearshop.dto.response.PaymentResultResponse;
import com.example.teddybearshop.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "Quản lý thanh toán")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create")
    @Operation(summary = "Tạo thanh toán VNPay")
    public ApiResponse<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentRequest request,
            HttpServletRequest httpRequest
    ) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.createPayment(request, httpRequest))
                .build();
    }

    @GetMapping("/vnpay-return")
    @Operation(summary = "VNPay callback sau khi thanh toán")
    public ApiResponse<PaymentResultResponse> vnpayReturn(HttpServletRequest request) {
        return ApiResponse.<PaymentResultResponse>builder()
                .result(paymentService.handleVNPayReturn(request))
                .build();
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Lấy thông tin thanh toán của đơn hàng")
    public ApiResponse<PaymentResponse> getPaymentByOrderId(@PathVariable Long orderId) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.getPaymentByOrderId(orderId))
                .build();
    }
}