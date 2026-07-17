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

    CATEGORY_EXISTED(3001, "Category already exists", HttpStatus.BAD_REQUEST),
    CATEGORY_NOT_FOUND(3002, "Category not found", HttpStatus.NOT_FOUND),
    PRODUCT_NOT_FOUND(4001, "Product not found", HttpStatus.NOT_FOUND),

    UPLOAD_FILE_FAILED(5000, "Upload file failed", HttpStatus.NOT_FOUND);

    private final int code;
    private final String message;
    private final HttpStatus httpStatus;

    ErrorCode(int code, String message, HttpStatus httpStatus) {
        this.code = code;
        this.message = message;
        this.httpStatus = httpStatus;
    }
}
