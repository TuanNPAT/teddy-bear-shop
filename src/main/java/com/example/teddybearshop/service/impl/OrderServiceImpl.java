package com.example.teddybearshop.service.impl;

import com.example.teddybearshop.common.exception.AppException;
import com.example.teddybearshop.common.exception.ErrorCode;
import com.example.teddybearshop.dto.request.OrderFilterRequest;
import com.example.teddybearshop.dto.request.OrderRequest;
import com.example.teddybearshop.dto.response.OrderResponse;
import com.example.teddybearshop.enums.OrderStatus;
import com.example.teddybearshop.mapper.OrderMapper;
import com.example.teddybearshop.model.Order;
import com.example.teddybearshop.model.OrderDetail;
import com.example.teddybearshop.model.Product;
import com.example.teddybearshop.repository.OrderRepository;
import com.example.teddybearshop.repository.ProductRepository;
import com.example.teddybearshop.service.OrderService;
import com.example.teddybearshop.service.UserContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;
    private final UserContextService userContextService;

    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        // 1. Tạo order
        Order order = Order.builder()
                .orderCode(generateOrderCode())
                .customerName(request.getCustomerName())
                .customerPhone(request.getCustomerPhone())
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .status(OrderStatus.PENDING)
                .note(request.getNote())
                .createdBy(userContextService.getCurrentUsername())
                .build();

        // 2. Tính tổng tiền và tạo order details
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderDetail> orderDetails = new ArrayList<>();
        List<Product> productsToUpdate = new ArrayList<>();

        for (OrderRequest.OrderItemRequest item : request.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));

            // Kiểm tra stock
            if (product.getStock() < item.getQuantity()) {
                throw new AppException(ErrorCode.PRODUCT_INSUFFICIENT_STOCK);
            }

            // Tính subtotal
            BigDecimal price = product.getPrice();
            BigDecimal subtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));

            // Tạo order detail
            OrderDetail detail = OrderDetail.builder()
                    .order(order)
                    .productId(product.getProductId())
                    .productName(product.getName())
                    .quantity(item.getQuantity())
                    .price(price)
                    .subtotal(subtotal)
                    .build();

            orderDetails.add(detail);

            // Cập nhật stock (để sau saveAll)
            product.setStock(product.getStock() - item.getQuantity());
            productsToUpdate.add(product);

            totalAmount = totalAmount.add(subtotal);
        }

        // 3. Set total amount và order details
        order.setTotalAmount(totalAmount);
        order.setOrderDetails(orderDetails);

        // 4. Lưu order và update stock
        Order savedOrder = orderRepository.save(order);
        productRepository.saveAll(productsToUpdate);  // 1 lần gọi DB

        log.info("Created order: {} by {}", savedOrder.getOrderCode(), savedOrder.getCreatedBy());

        return orderMapper.toResponse(savedOrder);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (status == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            List<Product> productsToUpdate = new ArrayList<>();
            for (OrderDetail detail : order.getOrderDetails()) {
                Product product = productRepository.findById(detail.getProductId())
                        .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
                product.setStock(product.getStock() + detail.getQuantity());
                productsToUpdate.add(product);
            }
            productRepository.saveAll(productsToUpdate);
        }

        order.setStatus(status);
        order.setUpdatedBy(userContextService.getCurrentUsername());

        Order updatedOrder = orderRepository.save(order);
        log.info("Updated order {} status to {}", order.getOrderCode(), status);

        return orderMapper.toResponse(updatedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrderResponse> filterOrders(OrderFilterRequest request) {
        // Xử lý sort
        Sort sort = Sort.by(Sort.Direction.ASC, "createdAt");
        if (request.getSortBy() != null && !request.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(request.getSortDirection())
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            sort = Sort.by(direction, request.getSortBy());
        }

        int page = request.getPage() != null ? request.getPage() : 0;
        int size = request.getSize() != null ? request.getSize() : 10;
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Order> orderPage = orderRepository.filterOrders(
                request.getOrderCode(),
                request.getStatus(),
                request.getCustomerName(),
                request.getCustomerPhone(),
                request.getFromDate(),
                request.getToDate(),
                pageable
        );

        return orderPage.map(orderMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders() {
        Long userId = userContextService.getCurrentUserId();

        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return orderRepository.findByUser_Id(userId)
                .stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status)
                .stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void cancelOrder(Long orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        if (order.getStatus() == OrderStatus.COMPLETED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_CANCELLED);
        }

        // Trả lại stock
        List<Product> productsToUpdate = new ArrayList<>();
        for (OrderDetail detail : order.getOrderDetails()) {
            Product product = productRepository.findById(detail.getProductId())
                    .orElseThrow(() -> new AppException(ErrorCode.PRODUCT_NOT_FOUND));
            product.setStock(product.getStock() + detail.getQuantity());
            productsToUpdate.add(product);
        }
        productRepository.saveAll(productsToUpdate);

        order.setStatus(OrderStatus.CANCELLED);
        order.setUpdatedBy(userContextService.getCurrentUsername());
        // Nếu có field cancelReason thì set ở đây
        // order.setCancelReason(reason);

        orderRepository.save(order);
        log.info("Cancelled order {} by {}", order.getOrderCode(), userContextService.getCurrentUsername());
    }

    private String generateOrderCode() {
        return "ORD" + System.currentTimeMillis();
    }
}