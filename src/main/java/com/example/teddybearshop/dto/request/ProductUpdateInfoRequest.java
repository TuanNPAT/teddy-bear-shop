package com.example.teddybearshop.dto.request;

import com.example.teddybearshop.enums.ProductCategory;
import com.example.teddybearshop.enums.ProductStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateInfoRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private ProductCategory category;
    private Integer stock;
    private ProductStatus status;
}