package com.example.teddybearshop.dto.response;

import com.example.teddybearshop.enums.ProductCategory;
import com.example.teddybearshop.enums.ProductStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductResponse {

    private Long productId;

    private String productCode;

    private String name;

    private String description;

    private BigDecimal price;

    private ProductCategory category;

    private List<String> imageUrls;

    private ProductStatus status;

    private LocalDateTime createdAt;
}