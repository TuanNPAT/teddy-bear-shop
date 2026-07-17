package com.example.teddybearshop.controller;

import com.example.teddybearshop.common.response.ApiResponse;
import com.example.teddybearshop.dto.request.LoginRequest;
import com.example.teddybearshop.dto.request.OTPRequest;
import com.example.teddybearshop.dto.request.RegisterRequest;
import com.example.teddybearshop.dto.request.ResetPasswordRequest;
import com.example.teddybearshop.dto.response.AuthResponse;
import com.example.teddybearshop.dto.response.UserResponse;
import com.example.teddybearshop.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Quản lý xác thực người dùng")
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register/send-otp")
    @Operation(summary = "Gửi OTP đăng ký tài khoản")
    public ApiResponse<String> sendOTPForRegister(@Valid @RequestBody OTPRequest request) {
        authService.sendOTPForRegister(request.getEmail());
        return ApiResponse.success("OTP has been sent to your email");
    }

    @PostMapping("/register/verify")
    @Operation(summary = "Xác thực OTP và đăng ký tài khoản")
    public ApiResponse<UserResponse> verifyOTPAndRegister(
            @Valid @RequestBody RegisterRequest request,
            @RequestParam String otp
    ) {
        return ApiResponse.success("Register successfully",
                authService.verifyOTPAndRegister(request, otp));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Login successfully", authService.login(request));
    }

    @PostMapping("/forgot-password/send-otp")
    @Operation(summary = "Gửi OTP đặt lại mật khẩu")
    public ApiResponse<String> sendOTPForForgotPassword(@Valid @RequestBody OTPRequest request) {
        authService.sendOTPForForgotPassword(request.getEmail());
        return ApiResponse.success("OTP has been sent to your email");
    }

    @PostMapping("/forgot-password/reset")
    @Operation(summary = "Đặt lại mật khẩu (không trả token)")
    public ApiResponse<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ApiResponse.success("Password reset successfully");
    }

    @PostMapping("/forgot-password/reset-and-login")
    @Operation(summary = "Đặt lại mật khẩu và trả token đăng nhập luôn")
    public ApiResponse<AuthResponse> resetPasswordAndLogin(@Valid @RequestBody ResetPasswordRequest request) {
        return ApiResponse.success("Password reset successfully",
                authService.resetPasswordAndLogin(request.getEmail(), request.getOtp(), request.getNewPassword()));
    }
}