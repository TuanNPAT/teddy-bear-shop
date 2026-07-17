package com.example.teddybearshop.dto.response;

import com.example.teddybearshop.enums.PaymentMethod;
import com.example.teddybearshop.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private String paymentUrl;
    private String orderCode;
    private Long orderId;

    // Hoặc nếu muốn đầy đủ hơn:
    private Long paymentId;
    private BigDecimal amount;
    private PaymentMethod method;
    private PaymentStatus status;
    private String txnRef;
    private String transactionNo;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
}