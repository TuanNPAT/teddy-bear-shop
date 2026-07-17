package com.example.teddybearshop.dto.response;

import com.example.teddybearshop.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResultResponse {
    private String orderCode;
    private PaymentStatus paymentStatus;
    private String message;
    private String transactionNo;
}