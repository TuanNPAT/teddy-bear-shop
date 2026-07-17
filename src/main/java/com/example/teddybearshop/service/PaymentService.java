package com.example.teddybearshop.service;

import com.example.teddybearshop.dto.request.PaymentRequest;
import com.example.teddybearshop.dto.response.PaymentResponse;
import com.example.teddybearshop.dto.response.PaymentResultResponse;
import jakarta.servlet.http.HttpServletRequest;

public interface PaymentService {

    /**
     * Tạo thanh toán cho đơn hàng
     */
    PaymentResponse createPayment(PaymentRequest request, HttpServletRequest httpRequest);

    /**
     * Xử lý callback từ VNPay
     */
    PaymentResultResponse handleVNPayReturn(HttpServletRequest request);

    /**
     * Lấy thông tin thanh toán theo order ID
     */
    PaymentResponse getPaymentByOrderId(Long orderId);
}