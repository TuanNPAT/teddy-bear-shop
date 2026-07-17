package com.example.teddybearshop.service;


import com.example.teddybearshop.dto.request.LoginRequest;
import com.example.teddybearshop.dto.request.RegisterRequest;
import com.example.teddybearshop.dto.response.AuthResponse;
import com.example.teddybearshop.dto.response.UserResponse;

public interface AuthService {
    void sendOTPForRegister(String email);

    UserResponse verifyOTPAndRegister(RegisterRequest request, String otp);

    AuthResponse login(LoginRequest request);

    void sendOTPForForgotPassword(String email);

    void resetPassword(String email, String otp, String newPassword);

    AuthResponse resetPasswordAndLogin(String email, String otp, String newPassword);


}
