package com.example.teddybearshop.repository;

import com.example.teddybearshop.model.Order;
import com.example.teddybearshop.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByCustomerPhone(String customerPhone);

    boolean existsByOrderCode(String orderCode);
}