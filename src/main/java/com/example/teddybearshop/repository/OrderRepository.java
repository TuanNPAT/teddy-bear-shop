package com.example.teddybearshop.repository;

import com.example.teddybearshop.model.Order;
import com.example.teddybearshop.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByUser_Id(Long userId);

    @Query(value = "SELECT o.* FROM orders o WHERE " +
            "(CAST(:orderCode AS varchar) IS NULL OR o.order_code LIKE '%' || CAST(:orderCode AS varchar) || '%') " +
            "AND (CAST(:status AS varchar) IS NULL OR o.status = CAST(:status AS varchar)) " +
            "AND (CAST(:customerName AS varchar) IS NULL OR o.customer_name LIKE '%' || CAST(:customerName AS varchar) || '%') " +
            "AND (CAST(:customerPhone AS varchar) IS NULL OR o.customer_phone LIKE '%' || CAST(:customerPhone AS varchar) || '%') " +
            "AND (CAST(:fromDate AS timestamp) IS NULL OR o.created_at >= CAST(:fromDate AS timestamp)) " +
            "AND (CAST(:toDate AS timestamp) IS NULL OR o.created_at <= CAST(:toDate AS timestamp))",
            countQuery = "SELECT COUNT(*) FROM orders o WHERE " +
            "(CAST(:orderCode AS varchar) IS NULL OR o.order_code LIKE '%' || CAST(:orderCode AS varchar) || '%') " +
            "AND (CAST(:status AS varchar) IS NULL OR o.status = CAST(:status AS varchar)) " +
            "AND (CAST(:customerName AS varchar) IS NULL OR o.customer_name LIKE '%' || CAST(:customerName AS varchar) || '%') " +
            "AND (CAST(:customerPhone AS varchar) IS NULL OR o.customer_phone LIKE '%' || CAST(:customerPhone AS varchar) || '%') " +
            "AND (CAST(:fromDate AS timestamp) IS NULL OR o.created_at >= CAST(:fromDate AS timestamp)) " +
            "AND (CAST(:toDate AS timestamp) IS NULL OR o.created_at <= CAST(:toDate AS timestamp))",
            nativeQuery = true)
    Page<Order> filterOrders(@Param("orderCode") String orderCode,
                             @Param("status") String status,
                             @Param("customerName") String customerName,
                             @Param("customerPhone") String customerPhone,
                             @Param("fromDate") String fromDate,
                             @Param("toDate") String toDate,
                             Pageable pageable);
}