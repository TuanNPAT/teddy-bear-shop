package com.example.teddybearshop.service;

import com.example.teddybearshop.dto.request.UpdateProfileRequest;
import com.example.teddybearshop.dto.response.UserResponse;
import com.example.teddybearshop.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserService {

    // User profile
    UserResponse getMyProfile();
    UserResponse updateProfile(UpdateProfileRequest request);

    // Admin management
    Page<UserResponse> getAllUsers(Pageable pageable, String keyword, String role, Boolean status);
    UserResponse getUserById(Long id);
    UserResponse updateUserStatus(Long id, Boolean status);
    UserResponse updateUserRole(Long id, Role role);
    void resetUserPassword(Long id);
}