package com.example.teddybearshop.service;

import com.example.teddybearshop.dto.request.ProductCreationRequest;
import com.example.teddybearshop.dto.response.ProductResponse;

import java.util.List;

public interface ProductService {

    ProductResponse create(ProductCreationRequest request);

    List<ProductResponse> getAll();

    ProductResponse getById(Long productId);

}