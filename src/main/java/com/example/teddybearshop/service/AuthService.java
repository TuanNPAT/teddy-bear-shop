package com.example.teddybearshop.service;


import com.example.teddybearshop.dto.request.LoginRequest;
import com.example.teddybearshop.dto.request.RegisterRequest;
import com.example.teddybearshop.dto.response.AuthResponse;
import com.example.teddybearshop.dto.response.UserResponse;

public interface AuthService {
    UserResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
