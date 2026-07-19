package com.example.teddybearshop.controller;

import com.example.teddybearshop.common.response.ApiResponse;
import com.example.teddybearshop.dto.request.UpdateProfileRequest;
import com.example.teddybearshop.dto.response.UserResponse;
import com.example.teddybearshop.enums.Role;
import com.example.teddybearshop.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Quản lý người dùng")
public class UserController {

    private final UserService userService;

    // ============= USER PROFILE =============

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

    // ============= ADMIN: Quản lý user =============

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả user (Admin)")
    public ApiResponse<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean status
    ) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ApiResponse.<Page<UserResponse>>builder()
                .result(userService.getAllUsers(pageable, keyword, role, status))
                .build();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy thông tin user theo ID (Admin)")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserById(id))
                .build();
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái user (Admin)")
    public ApiResponse<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @RequestParam Boolean status
    ) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUserStatus(id, status))
                .build();
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Cập nhật role user (Admin)")
    public ApiResponse<UserResponse> updateUserRole(
            @PathVariable Long id,
            @RequestParam Role role
    ) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUserRole(id, role))
                .build();
    }

    @PatchMapping("/{id}/password-reset")
    @Operation(summary = "Reset mật khẩu user (Admin)")
    public ApiResponse<Void> resetUserPassword(@PathVariable Long id) {
        userService.resetUserPassword(id);
        return ApiResponse.<Void>builder()
                .message("Password reset successfully")
                .build();
    }
}