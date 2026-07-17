package com.example.teddybearshop.service;

import com.example.teddybearshop.dto.request.ProductCreationRequest;
import com.example.teddybearshop.dto.request.ProductSearchRequest;
import com.example.teddybearshop.dto.request.ProductUpdateInfoRequest;
import com.example.teddybearshop.dto.response.ProductPageResponse;
import com.example.teddybearshop.dto.response.ProductResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductService {

    ProductResponse create(ProductCreationRequest request, List<MultipartFile> files);

    ProductResponse updateInfo(Long productId, ProductUpdateInfoRequest request);

    ProductResponse deleteImages(Long productId, List<String> imageUrls);

    ProductResponse addImages(Long productId, List<MultipartFile> files);
    void delete(Long productId);

    ProductResponse getById(Long productId);

    void restore(Long productId);

    List<ProductResponse> getDeletedProducts();

    ProductPageResponse searchProducts(ProductSearchRequest request);
}