package com.example.teddybearshop.dto.request;

import com.example.teddybearshop.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderFilterRequest {
    private String orderCode;
    private OrderStatus status;
    private String customerName;
    private String customerPhone;
    private String customerEmail;
    private LocalDateTime fromDate;
    private LocalDateTime toDate;
    private String sortBy;
    private String sortDirection;

    @Builder.Default
    private Integer page = 0;

    @Builder.Default
    private Integer size = 10;
}