package com.example.teddybearshop.enums;

public enum OrderStatus {
    PENDING,          // Chờ xác nhận (mới tạo, chờ Admin duyệt)
    PAID,             // Đã thanh toán (chỉ dùng cho VNPAY)
    CONFIRMED,        // Đã xác nhận (Admin duyệt đơn)
    SHIPPING,         // Đang giao hàng
    DELIVERED,        // Đã giao hàng thành công
    COMPLETED,        // Đã hoàn thành
    CANCELLED,        // Đã hủy
    DELIVERY_FAILED   // Giao hàng thất bại
}