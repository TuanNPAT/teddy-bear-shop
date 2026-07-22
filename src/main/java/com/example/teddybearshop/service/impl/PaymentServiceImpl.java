package com.example.teddybearshop.service.impl;

import com.example.teddybearshop.common.exception.AppException;
import com.example.teddybearshop.common.exception.ErrorCode;
import com.example.teddybearshop.configuration.VNPayConfig;
import com.example.teddybearshop.dto.request.PaymentRequest;
import com.example.teddybearshop.dto.response.PaymentResponse;
import com.example.teddybearshop.dto.response.PaymentResultResponse;
import com.example.teddybearshop.enums.OrderStatus;
import com.example.teddybearshop.enums.PaymentMethod;
import com.example.teddybearshop.enums.PaymentStatus;
import com.example.teddybearshop.model.Order;
import com.example.teddybearshop.model.Payment;
import com.example.teddybearshop.repository.OrderRepository;
import com.example.teddybearshop.repository.PaymentRepository;
import com.example.teddybearshop.service.PaymentService;
import com.example.teddybearshop.util.VNPayUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final VNPayConfig vnPayConfig;
    private final VNPayUtil vnPayUtil;

    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request, HttpServletRequest httpRequest) {
        // 1. Kiểm tra đơn hàng
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // 2. Kiểm tra trạng thái đơn hàng
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_PAID);
        }

        // 3. Kiểm tra phương thức thanh toán
        if (order.getPaymentMethod() != PaymentMethod.VNPAY) {
            throw new AppException(ErrorCode.INVALID_PAYMENT_METHOD);
        }

        // 4. Kiểm tra đã có payment chưa
        Optional<Payment> existingPaymentOpt = paymentRepository.findByOrder_OrderId(order.getOrderId());
        Payment payment;
        if (existingPaymentOpt.isPresent()) {
            payment = existingPaymentOpt.get();
            if (payment.getStatus() == PaymentStatus.SUCCESS) {
                throw new AppException(ErrorCode.PAYMENT_ALREADY_EXISTS);
            }
            // Nếu giao dịch cũ không thành công, đặt lại trạng thái PENDING và reset mã giao dịch VNPay
            payment.setStatus(PaymentStatus.PENDING);
            payment.setTransactionNo(null);
            payment.setPaidAt(null);
            paymentRepository.save(payment);
        } else {
            // 5. Tạo payment record mới
            payment = Payment.builder()
                    .order(order)
                    .amount(order.getTotalAmount())
                    .method(PaymentMethod.VNPAY)
                    .status(PaymentStatus.PENDING)
                    .txnRef(order.getOrderCode())
                    .build();
            paymentRepository.save(payment);
        }

        // 6. Tạo URL thanh toán VNPay
        String ipAddress = vnPayUtil.getIpAddress(httpRequest);
        long amount = order.getTotalAmount().longValue() * 100;
        String amountStr = String.valueOf(amount);

        Map<String, String> params = vnPayUtil.buildPaymentParams(
                vnPayConfig.getTmnCode(),
                order.getOrderCode(),
                amountStr,
                vnPayConfig.getReturnUrl(),  // returnUrl để VNPay redirect về
                ipAddress,
                null
        );

        params.put("vnp_OrderInfo", "Thanh toan don hang: " + order.getOrderCode());

        String paymentUrl = vnPayUtil.createPaymentUrl(
                params,
                vnPayConfig.getPayUrl(),      // Dùng payUrl
                vnPayConfig.getHashSecret()
        );

        log.info("Created VNPay payment for order: {}", order.getOrderCode());

        return PaymentResponse.builder()
                .paymentUrl(paymentUrl)
                .orderCode(order.getOrderCode())
                .orderId(order.getOrderId())
                .paymentId(payment.getPaymentId())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .txnRef(payment.getTxnRef())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public PaymentResultResponse handleVNPayReturn(HttpServletRequest request) {
        Map<String, String> params = new java.util.HashMap<>();
        for (String paramName : request.getParameterMap().keySet()) {
            params.put(paramName, request.getParameter(paramName));
        }

        boolean isValidSignature = vnPayUtil.verifySignature(params, vnPayConfig.getHashSecret());
        if (!isValidSignature) {
            log.error("Invalid VNPay signature");
            throw new AppException(ErrorCode.INVALID_SIGNATURE);
        }

        String orderCode = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");

        log.info("VNPay return: orderCode={}, responseCode={}, transactionNo={}",
                orderCode, responseCode, transactionNo);

        Order order = orderRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        Payment payment = paymentRepository.findByOrder_OrderId(order.getOrderId())
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return PaymentResultResponse.builder()
                    .orderCode(orderCode)
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .message("Payment already processed")
                    .transactionNo(transactionNo)
                    .build();
        }

        String message = vnPayUtil.getResponseCode(responseCode);
        PaymentStatus paymentStatus;

        if ("00".equals(responseCode)) {
            paymentStatus = PaymentStatus.SUCCESS;

            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionNo(transactionNo);
            payment.setPaidAt(LocalDateTime.now());

            order.setStatus(OrderStatus.PAID);

            log.info("Payment SUCCESS for order: {}, transaction: {}", orderCode, transactionNo);

        } else {
            paymentStatus = PaymentStatus.FAILED;

            payment.setStatus(PaymentStatus.FAILED);
            payment.setTransactionNo(transactionNo);

            log.warn("Payment FAILED for order: {}, responseCode: {}, message: {}",
                    orderCode, responseCode, message);
        }

        orderRepository.save(order);
        paymentRepository.save(payment);

        return PaymentResultResponse.builder()
                .orderCode(orderCode)
                .paymentStatus(paymentStatus)
                .message(message)
                .transactionNo(transactionNo)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByOrderId(Long orderId) {
        Payment payment = paymentRepository.findByOrder_OrderId(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_NOT_FOUND));

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .amount(payment.getAmount())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .txnRef(payment.getTxnRef())
                .transactionNo(payment.getTransactionNo())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .orderCode(payment.getOrder().getOrderCode())
                .orderId(payment.getOrder().getOrderId())
                .build();
    }
}