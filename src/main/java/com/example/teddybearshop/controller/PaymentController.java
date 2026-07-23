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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.servlet.view.RedirectView;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "Quản lý thanh toán")
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${frontend.url}")
    private String frontendUrl;

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
    public RedirectView vnpayReturn(HttpServletRequest request) {
        PaymentResultResponse result = paymentService.handleVNPayReturn(request);

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/payment/vnpay-return")
                .queryParam("orderCode", result.getOrderCode() != null ? result.getOrderCode() : "")
                .queryParam("paymentStatus", result.getPaymentStatus() != null ? result.getPaymentStatus().name() : "")
                .queryParam("message", result.getMessage() != null ? result.getMessage() : "")
                .queryParam("transactionNo", result.getTransactionNo() != null ? result.getTransactionNo() : "")
                .toUriString();

        return new RedirectView(redirectUrl);
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Lấy thông tin thanh toán của đơn hàng")
    public ApiResponse<PaymentResponse> getPaymentByOrderId(@PathVariable Long orderId) {
        return ApiResponse.<PaymentResponse>builder()
                .result(paymentService.getPaymentByOrderId(orderId))
                .build();
    }
}