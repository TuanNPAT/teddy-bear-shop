package com.example.teddybearshop.mapper;

import com.example.teddybearshop.dto.response.UserResponse;
import com.example.teddybearshop.model.User;

public class UserMapper {
    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId()).fullName(user.getFullName()).email(user.getEmail())
                .role(user.getRole()).status(user.getStatus()).build();
    }
}
