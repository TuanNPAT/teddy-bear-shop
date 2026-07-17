package com.example.teddybearshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailResponse {

    private Long orderDetailId;
    private Long productId;
    private String productName;
    private Integer quantity;
    private BigDecimal price;
}