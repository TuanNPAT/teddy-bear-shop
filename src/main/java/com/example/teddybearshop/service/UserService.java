package com.example.teddybearshop.service;

import com.example.teddybearshop.dto.request.UpdateProfileRequest;
import com.example.teddybearshop.dto.response.UserResponse;

public interface UserService {
    UserResponse getMyProfile();
    UserResponse updateProfile(UpdateProfileRequest request);
}