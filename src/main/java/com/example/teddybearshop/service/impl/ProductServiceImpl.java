package com.example.teddybearshop.service.impl;

import com.example.teddybearshop.common.exception.AppException;
import com.example.teddybearshop.common.exception.ErrorCode;
import com.example.teddybearshop.dto.request.ProductCreationRequest;
import com.example.teddybearshop.dto.request.ProductSearchRequest;
import com.example.teddybearshop.dto.request.ProductUpdateInfoRequest;
import com.example.teddybearshop.dto.response.ProductPageResponse;
import com.example.teddybearshop.dto.response.ProductResponse;
import com.example.teddybearshop.enums.ProductCategory;
import com.example.teddybearshop.enums.ProductStatus;
import com.example.teddybearshop.mapper.ProductMapper;
import com.example.teddybearshop.model.Product;
import com.example.teddybearshop.repository.ProductRepository;
import com.example.teddybearshop.service.MinioService;
import com.example.teddybearshop.service.ProductService;
import com.example.teddybearshop.service.UserContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final MinioService minioService;
    private final UserContextService userContextService;

    @Override
    public ProductResponse create(ProductCreationRequest request, List<MultipartFile> files) {
        List<String> imageUrls = minioService.uploadFiles(files);

        Product product = Product.builder()
                .productCode(generateProductCode())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .category(request.getCategory())
                .stock(request.getStock())
                .imageUrls(imageUrls)
                .status(ProductStatus.ACTIVE)
                .createdBy(userContextService.getCurrentUsername())
                .build();

        productRepository.save(product);

        log.info("Created product with ID: {} by {}",
                product.getProductId(),
                userContextService.getCurrentUsername()
        );

        return productMapper.toResponse(product);
    }

    // 1. Update thông tin sản phẩm (không ảnh)
    @Override
    @Transactional
    public ProductResponse updateInfo(Long productId, ProductUpdateInfoRequest request) {
        Product product = productRepository
                .findByProductIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        productMapper.updateProductInfoFromRequest(request, product);
        product.setUpdatedBy(userContextService.getCurrentUsername());

        productRepository.save(product);

        log.info("Updated info for product ID: {} by {}",
                productId,
                userContextService.getCurrentUsername()
        );

        return productMapper.toResponse(product);
    }

    // 2. Xóa ảnh trong product
    @Override
    @Transactional
    public ProductResponse deleteImages(Long productId, List<String> imageUrls) {
        Product product = productRepository
                .findByProductIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        List<String> currentImages = new ArrayList<>(product.getImageUrls());

        if (imageUrls != null && !imageUrls.isEmpty()) {
            for (String imageUrl : imageUrls) {
                if (imageUrl != null && !imageUrl.isEmpty()) {
                    // Xóa trên MinIO
                    String objectName = minioService.extractObjectNameFromUrl(imageUrl);
                    if (objectName != null) {
                        minioService.deleteFile(objectName);
                    }
                    // Xóa khỏi danh sách
                    currentImages.remove(imageUrl);
                }
            }
        }

        product.setImageUrls(currentImages);
        product.setUpdatedBy(userContextService.getCurrentUsername());

        productRepository.save(product);

        log.info("Deleted {} images from product ID: {} by {}",
                imageUrls != null ? imageUrls.size() : 0,
                productId,
                userContextService.getCurrentUsername()
        );

        return productMapper.toResponse(product);
    }

    // 3. Thêm ảnh vào product
    @Override
    @Transactional
    public ProductResponse addImages(Long productId, List<MultipartFile> files) {
        Product product = productRepository
                .findByProductIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        List<String> currentImages = new ArrayList<>(product.getImageUrls());

        if (files != null && !files.isEmpty()) {
            List<MultipartFile> validFiles = files.stream()
                    .filter(f -> f != null && !f.isEmpty())
                    .collect(Collectors.toList());

            if (!validFiles.isEmpty()) {
                List<String> newImageUrls = minioService.uploadFiles(validFiles);
                currentImages.addAll(newImageUrls);
            }
        }

        product.setImageUrls(currentImages);
        product.setUpdatedBy(userContextService.getCurrentUsername());

        productRepository.save(product);

        log.info("Added {} images to product ID: {} by {}",
                files != null ? files.size() : 0,
                productId,
                userContextService.getCurrentUsername()
        );

        return productMapper.toResponse(product);
    }


    @Override
    @Transactional
    public void delete(Long productId) {
        Product product = productRepository
                .findByProductIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getImageUrls() != null && !product.getImageUrls().isEmpty()) {
            for (String imageUrl : product.getImageUrls()) {
                String objectName = minioService.extractObjectNameFromUrl(imageUrl);
                if (objectName != null) {
                    minioService.deleteFile(objectName);
                }
            }
        }

        product.setDeletedAt(LocalDateTime.now());
        product.setDeletedBy(userContextService.getCurrentUsername());

        log.info("Deleted product with ID: {} by {}",
                productId,
                userContextService.getCurrentUsername()
        );
    }

    @Override
    @Transactional
    public void restore(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        if (product.getDeletedAt() == null) {
            throw new AppException(ErrorCode.PRODUCT_NOT_DELETED);
        }

        product.setDeletedAt(null);
        product.setDeletedBy(null);
        product.setUpdatedBy(userContextService.getCurrentUsername());

        log.info("Restored product with ID: {} by {}",
                productId,
                userContextService.getCurrentUsername()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long productId) {
        Product product = productRepository
                .findByProductIdAndDeletedAtIsNull(productId)
                .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

        return productMapper.toResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> getDeletedProducts() {
        return productRepository.findByDeletedAtIsNotNull()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public ProductPageResponse searchProducts(ProductSearchRequest request) {
        // Xử lý sort
        Sort sort = Sort.by(Sort.Direction.ASC, "createdAt");
        if (request.getSortBy() != null && !request.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(request.getSortDirection())
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            sort = Sort.by(direction, request.getSortBy());
        }

        // Tạo Pageable
        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 10;
        Pageable pageable = PageRequest.of(page, size, sort);

        // Chuyển đổi category từ String sang Enum
        ProductCategory category = null;
        if (request.getCategory() != null && !request.getCategory().isEmpty()) {
            try {
                category = ProductCategory.valueOf(request.getCategory().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Nếu category không hợp lệ, bỏ qua filter
                category = null;
            }
        }

        // Search
        Page<Product> productPage = productRepository.searchProducts(
                request.getName(),
                category,  // Truyền Enum thay vì String
                request.getMinPrice(),
                request.getMaxPrice(),
                pageable
        );

        // Convert to response
        List<ProductResponse> content = productPage.getContent()
                .stream()
                .map(productMapper::toResponse)
                .toList();

        return ProductPageResponse.builder()
                .content(content)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .last(productPage.isLast())
                .first(productPage.isFirst())
                .build();
    }

    private String generateProductCode() {
        return "PRD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}