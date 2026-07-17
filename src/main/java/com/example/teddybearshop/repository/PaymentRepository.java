package com.example.teddybearshop.repository;

import com.example.teddybearshop.model.Payment;
import com.example.teddybearshop.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByTxnRef(String txnRef);

    Optional<Payment> findByOrder_OrderId(Long orderId);

    List<Payment> findByStatus(PaymentStatus status);

    boolean existsByTxnRef(String txnRef);
}