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

    @Query("SELECT o FROM Order o WHERE " +
            "(:orderCode IS NULL OR o.orderCode LIKE CONCAT('%', :orderCode, '%')) " +
            "AND (:status IS NULL OR o.status = :status) " +
            "AND (:customerName IS NULL OR o.customerName LIKE CONCAT('%', :customerName, '%')) " +
            "AND (:customerPhone IS NULL OR o.customerPhone LIKE CONCAT('%', :customerPhone, '%')) " +
            "AND (:fromDate IS NULL OR o.createdAt >= :fromDate) " +
            "AND (:toDate IS NULL OR o.createdAt <= :toDate)")
    Page<Order> filterOrders(@Param("orderCode") String orderCode,
                             @Param("status") OrderStatus status,
                             @Param("customerName") String customerName,
                             @Param("customerPhone") String customerPhone,
                             @Param("fromDate") LocalDateTime fromDate,
                             @Param("toDate") LocalDateTime toDate,
                             Pageable pageable);
}