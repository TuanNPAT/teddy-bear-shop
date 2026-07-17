package com.example.teddybearshop.repository;

import com.example.teddybearshop.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    boolean existsByProductCode(String productCode);

    List<Product> findByDeletedAtIsNull();

    Optional<Product> findByProductIdAndDeletedAtIsNull(Long productId);

}