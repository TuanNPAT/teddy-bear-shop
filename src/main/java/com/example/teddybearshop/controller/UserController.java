package com.example.teddybearshop.controller;

import com.example.teddybearshop.common.response.ApiResponse;
import com.example.teddybearshop.dto.request.UpdateProfileRequest;
import com.example.teddybearshop.dto.response.UserResponse;
import com.example.teddybearshop.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Quản lý người dùng")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Xem thông tin profile của tôi")
    public ApiResponse<UserResponse> getMyProfile() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyProfile())
                .build();
    }

    @PatchMapping("/me")
    @Operation(summary = "Chỉnh sửa profile của tôi")
    public ApiResponse<UserResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateProfile(request))
                .build();
    }
}