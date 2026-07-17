package com.example.teddybearshop.service.impl;

import com.example.teddybearshop.common.exception.AppException;
import com.example.teddybearshop.common.exception.ErrorCode;
import com.example.teddybearshop.dto.request.ProductCreationRequest;
import com.example.teddybearshop.dto.response.ProductResponse;
import com.example.teddybearshop.enums.ProductStatus;
import com.example.teddybearshop.mapper.ProductMapper;
import com.example.teddybearshop.model.Product;
import com.example.teddybearshop.repository.ProductRepository;
import com.example.teddybearshop.service.MinioService;
import com.example.teddybearshop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MinioService minioService;

    @Override
    public ProductResponse create(ProductCreationRequest request) {

        List<String> imageUrls = minioService.uploadFiles(request.getFiles());

        Product product = Product.builder()
                .productCode(generateProductCode())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .imageUrls(imageUrls)
                .status(ProductStatus.ACTIVE)
                .build();

        productRepository.save(product);

        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getAll() {

        return productRepository.findByDeletedAtIsNull()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long productId) {

        Product product = productRepository
                .findByProductIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        return productMapper.toResponse(product);
    }

    private String generateProductCode() {

        return "PRD" + System.currentTimeMillis();
    }
}