package com.example.teddybearshop.mapper;

import com.example.teddybearshop.dto.response.OrderDetailResponse;
import com.example.teddybearshop.dto.response.OrderResponse;
import com.example.teddybearshop.dto.response.PaymentResponse;
import com.example.teddybearshop.model.Order;
import com.example.teddybearshop.model.OrderDetail;
import com.example.teddybearshop.model.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface OrderMapper {

    @Mapping(source = "orderDetails", target = "orderDetails")
    @Mapping(source = "payment", target = "payment")
    OrderResponse toResponse(Order order);

    OrderDetailResponse toOrderDetailResponse(OrderDetail orderDetail);

    PaymentResponse toPaymentResponse(Payment payment);
}