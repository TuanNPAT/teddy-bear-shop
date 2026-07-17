package com.example.teddybearshop.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request tìm kiếm sản phẩm")
public class ProductSearchRequest {

    private String name;

    private String category;

    @Schema(description = "Giá tối thiểu", example = "0")
    private Double minPrice;

    @Schema(description = "Giá tối đa", example = "5000000000000")
    private Double maxPrice;

    @Schema(description = "Số trang (bắt đầu từ 0)", example = "0", defaultValue = "0")
    @Builder.Default
    private Integer page = 0;

    @Schema(description = "Số lượng bản ghi trên 1 trang", example = "10", defaultValue = "10")
    @Builder.Default
    private Integer size = 10;

    @Schema(description = "Sắp xếp theo field",
            example = "createdAt",
            allowableValues = {"name", "price", "stock", "category", "createdAt", "updatedAt"})
    @Builder.Default
    private String sortBy = "createdAt";

    @Schema(description = "Thứ tự sắp xếp",
            example = "desc",
            allowableValues = {"asc", "desc"})
    @Builder.Default
    private String sortDirection = "desc";
}