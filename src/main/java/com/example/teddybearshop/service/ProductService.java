package com.example.teddybearshop.service;

import com.example.teddybearshop.dto.request.ProductCreationRequest;
import com.example.teddybearshop.dto.request.ProductSearchRequest;
import com.example.teddybearshop.dto.request.ProductUpdateRequest;
import com.example.teddybearshop.dto.response.ProductPageResponse;
import com.example.teddybearshop.dto.response.ProductResponse;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ProductService {

    ProductResponse create(ProductCreationRequest request);

    ProductResponse update(Long productId, ProductUpdateRequest request);

    void delete(Long productId);

    ProductResponse getById(Long productId);

    void restore(Long productId);

    List<ProductResponse> getDeletedProducts();

    ProductPageResponse searchProducts(ProductSearchRequest request);
}