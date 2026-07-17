package com.example.teddybearshop.controller;

import com.example.teddybearshop.common.response.ApiResponse;
import com.example.teddybearshop.dto.request.ProductCreationRequest;
import com.example.teddybearshop.dto.response.ProductResponse;
import com.example.teddybearshop.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<ProductResponse> create(
            @ModelAttribute @Valid ProductCreationRequest request) {

        return ApiResponse.<ProductResponse>builder()
                .result(productService.create(request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<ProductResponse>> getAll() {

        return ApiResponse.<List<ProductResponse>>builder()
                .result(productService.getAll())
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ProductResponse> getById(@PathVariable Long id) {

        return ApiResponse.<ProductResponse>builder()
                .result(productService.getById(id))
                .build();
    }
}