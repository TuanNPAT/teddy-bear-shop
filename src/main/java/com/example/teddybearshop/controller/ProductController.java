package com.example.teddybearshop.controller;

import com.example.teddybearshop.common.response.ApiResponse;
import com.example.teddybearshop.dto.request.ProductCreationRequest;
import com.example.teddybearshop.dto.request.ProductSearchRequest;
import com.example.teddybearshop.dto.request.ProductUpdateInfoRequest;
import com.example.teddybearshop.dto.response.ProductPageResponse;
import com.example.teddybearshop.dto.response.ProductResponse;
import com.example.teddybearshop.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Product Management", description = "Quản lý sản phẩm")
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tạo sản phẩm mới")
    public ResponseEntity<ProductResponse> create(
            @Valid @ModelAttribute ProductCreationRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.create(request, request.getFiles()));
    }
    @PutMapping("/{productId}/info")
    @Operation(summary = "Cập nhật thông tin sản phẩm (không ảnh)")
    public ApiResponse<ProductResponse> updateInfo(
            @PathVariable Long productId,
            @Valid @RequestBody ProductUpdateInfoRequest request
    ) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.updateInfo(productId, request))
                .build();
    }

    @DeleteMapping("/{productId}/images")
    @Operation(summary = "Xóa ảnh trong sản phẩm")
    public ApiResponse<ProductResponse> deleteImages(
            @PathVariable Long productId,
            @RequestBody List<String> imageUrls
    ) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.deleteImages(productId, imageUrls))
                .build();
    }

    @PostMapping(value = "/{productId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Thêm ảnh vào sản phẩm")
    public ApiResponse<ProductResponse> addImages(
            @PathVariable Long productId,
            @RequestParam("files") List<MultipartFile> files
    ) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.addImages(productId, files))
                .build();
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách sản phẩm có phân trang và tìm kiếm")
    public ApiResponse<ProductPageResponse> getProducts(
            @ModelAttribute ProductSearchRequest request
    ) {
        return ApiResponse.<ProductPageResponse>builder()
                .result(productService.searchProducts(request))
                .build();
    }

    @GetMapping("/{productId}")
    @Operation(summary = "Lấy chi tiết sản phẩm theo ID")
    public ApiResponse<ProductResponse> getById(@PathVariable Long productId) {
        return ApiResponse.<ProductResponse>builder()
                .result(productService.getById(productId))
                .build();
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Xóa mềm sản phẩm (có thể khôi phục)")
    public ResponseEntity<Void> delete(@PathVariable Long productId) {
        productService.delete(productId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{productId}/restore")
    @Operation(summary = "Khôi phục sản phẩm đã xóa mềm")
    public ApiResponse<ProductResponse> restore(@PathVariable Long productId) {
        productService.restore(productId);
        return ApiResponse.<ProductResponse>builder()
                .result(productService.getById(productId))
                .build();
    }

    @GetMapping("/deleted")
    @Operation(summary = "Lấy danh sách sản phẩm đã xóa mềm")
    public ApiResponse<List<ProductResponse>> getDeletedProducts() {
        return ApiResponse.<List<ProductResponse>>builder()
                .result(productService.getDeletedProducts())
                .build();
    }
}