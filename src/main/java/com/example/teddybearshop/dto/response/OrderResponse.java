package com.example.teddybearshop.dto.response;

import com.example.teddybearshop.enums.OrderStatus;
import com.example.teddybearshop.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    private Long orderId;
    private String orderCode;
    private String customerName;
    private String customerPhone;
    private String shippingAddress;
    private BigDecimal totalAmount;
    private OrderStatus status;
    private PaymentMethod paymentMethod;
    private String note;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private List<OrderDetailResponse> orderDetails;
    private PaymentResponse payment;
    private String cancelReason;

}