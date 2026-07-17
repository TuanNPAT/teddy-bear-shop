package com.example.teddybearshop.dto.request;

import com.example.teddybearshop.enums.ProductCategory;
import com.example.teddybearshop.enums.ProductStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductUpdateRequest {

    private String name;

    private String description;

    @DecimalMin(value = "0.0", message = "Price must be greater than or equal to 0")
    private BigDecimal price;

    private ProductCategory category;

    @Min(value = 0, message = "Stock must be greater than or equal to 0")
    private Integer stock;

    private ProductStatus status;

    // Danh sách URL ảnh cũ muốn giữ lại
    private List<String> keepImageUrls;

    // Danh sách URL ảnh cũ muốn xóa
    private List<String> deleteImageUrls;

    // Danh sách ảnh mới upload
    private List<MultipartFile> newFiles;
}