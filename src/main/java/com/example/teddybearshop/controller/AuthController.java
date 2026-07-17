package com.example.teddybearshop.controller;

import com.example.teddybearshop.common.response.ApiResponse;
import com.example.teddybearshop.dto.request.LoginRequest;
import com.example.teddybearshop.dto.request.RegisterRequest;
import com.example.teddybearshop.dto.response.AuthResponse;
import com.example.teddybearshop.dto.response.UserResponse;
import com.example.teddybearshop.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ApiResponse<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Register successfully", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Login successfully", authService.login(request));
    }
}
