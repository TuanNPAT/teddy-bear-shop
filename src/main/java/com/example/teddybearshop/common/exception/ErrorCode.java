package com.example.teddybearshop.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION(9999, "Uncategorized error", HttpStatus.INTERNAL_SERVER_ERROR),
    INVALID_REQUEST(1001, "Invalid request", HttpStatus.BAD_REQUEST),
    UNAUTHENTICATED(1002, "Unauthenticated", HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1003, "You do not have permission", HttpStatus.FORBIDDEN),

    USER_EXISTED(2001, "User already exists", HttpStatus.BAD_REQUEST),
    USER_NOT_FOUND(2002, "User not found", HttpStatus.NOT_FOUND),
    INVALID_PASSWORD(2003, "Invalid password", HttpStatus.UNAUTHORIZED),

    PRODUCT_CODE_EXISTS(2101, "Product code already exists", HttpStatus.CONFLICT),
    PRODUCT_OUT_OF_STOCK(2102, "Product is out of stock", HttpStatus.BAD_REQUEST),
    PRODUCT_INSUFFICIENT_STOCK(2103, "Insufficient product stock", HttpStatus.BAD_REQUEST),
    PRODUCT_INACTIVE(2104, "Product is inactive", HttpStatus.BAD_REQUEST),
    PRODUCT_DELETED(2105, "Product has been deleted", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_DELETED(2106,"Product not deleted",HttpStatus.BAD_REQUEST),

    CATEGORY_EXISTED(3001, "Category already exists", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(3002, "Category not found", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND(4001, "Product not found", HttpStatus.NOT_FOUND),

    UPLOAD_FILE_FAILED(5000, "Upload file failed", HttpStatus.NOT_FOUND),
    DELETE_FILE_FAILED(5001,"Deleted file failed", HttpStatus.BAD_REQUEST),

    ORDER_NOT_FOUND(6100, "Order not found", HttpStatus.NOT_FOUND),
    ORDER_CANNOT_BE_PAID(6101, "Order cannot be paid", HttpStatus.BAD_REQUEST),
    ORDER_CANNOT_BE_CANCELLED(6102, "Order cannot be cancelled", HttpStatus.BAD_REQUEST),
    ORDER_ALREADY_PAID(6103, "Order already paid", HttpStatus.BAD_REQUEST),
    PAYMENT_NOT_FOUND(6104, "Payment not found", HttpStatus.NOT_FOUND),
    PAYMENT_ALREADY_EXISTS(6105, "Payment already exists", HttpStatus.BAD_REQUEST),
    INVALID_PAYMENT_METHOD(6106, "Invalid payment method", HttpStatus.BAD_REQUEST),
    INVALID_SIGNATURE(6107, "Invalid signature", HttpStatus.BAD_REQUEST);;

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
