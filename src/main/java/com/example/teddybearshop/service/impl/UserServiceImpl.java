package com.example.teddybearshop.service.impl;

import com.example.teddybearshop.common.exception.AppException;
import com.example.teddybearshop.common.exception.ErrorCode;
import com.example.teddybearshop.dto.request.UpdateProfileRequest;
import com.example.teddybearshop.dto.response.UserResponse;
import com.example.teddybearshop.enums.Role;
import com.example.teddybearshop.mapper.UserMapper;
import com.example.teddybearshop.model.User;
import com.example.teddybearshop.repository.UserRepository;
import com.example.teddybearshop.service.UserContextService;
import com.example.teddybearshop.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserContextService userContextService;
    private final PasswordEncoder passwordEncoder;

    // ============= USER PROFILE =============

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMyProfile() {
        User currentUser = userContextService.getCurrentUser();

        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return userMapper.toResponse(currentUser);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request) {
        User currentUser = userContextService.getCurrentUser();
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        currentUser.setFullName(request.getFullName());

        if (request.getPhone() != null) {
            currentUser.setPhone(request.getPhone());
        }

        if (request.getAddress() != null) {
            currentUser.setAddress(request.getAddress());
        }

        User updatedUser = userRepository.save(currentUser);

        log.info("Updated profile for user: {}", updatedUser.getEmail());

        return userMapper.toResponse(updatedUser);
    }

    // ============= ADMIN: Quản lý user =============

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable, String keyword, String role, Boolean status) {
        checkAdminPermission();

        Page<User> users;

        // Nếu có keyword -> tìm kiếm
        if (StringUtils.hasText(keyword)) {
            users = userRepository.searchUsers(keyword, pageable);
        }
        // Nếu có cả role và status
        else if (StringUtils.hasText(role) && status != null) {
            Role roleEnum = Role.valueOf(role.toUpperCase());
            users = userRepository.findByRoleAndStatus(roleEnum, status, pageable);
        }
        // Nếu chỉ có role
        else if (StringUtils.hasText(role)) {
            Role roleEnum = Role.valueOf(role.toUpperCase());
            users = userRepository.findByRole(roleEnum, pageable);
        }
        // Nếu chỉ có status
        else if (status != null) {
            users = userRepository.findByStatus(status, pageable);
        }
        // Không có filter
        else {
            users = userRepository.findAll(pageable);
        }

        return users.map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        checkAdminPermission();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUserStatus(Long id, Boolean status) {
        checkAdminPermission();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Không cho phép thay đổi status của chính mình
        User currentUser = userContextService.getCurrentUser();
        if (currentUser.getId().equals(id)) {
            throw new AppException(ErrorCode.CANNOT_UPDATE_SELF_STATUS);
        }

        // Không cho phép khóa admin
        if (user.getRole() == Role.ADMIN && !status) {
            throw new AppException(ErrorCode.CANNOT_BAN_ADMIN);
        }

        user.setStatus(status);

        User updatedUser = userRepository.save(user);
        log.info("Admin updated user status: {} -> {} for user {}",
                user.getEmail(), status, currentUser.getEmail());

        return userMapper.toResponse(updatedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long id, Role role) {
        checkAdminPermission();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Không cho phép thay đổi role của chính mình
        User currentUser = userContextService.getCurrentUser();
        if (currentUser.getId().equals(id)) {
            throw new AppException(ErrorCode.CANNOT_UPDATE_SELF_ROLE);
        }

        // Không cho phép thay đổi role của admin cuối cùng
        if (user.getRole() == Role.ADMIN && countAdmins() <= 1) {
            throw new AppException(ErrorCode.CANNOT_REMOVE_LAST_ADMIN);
        }

        user.setRole(role);

        User updatedUser = userRepository.save(user);
        log.info("Admin updated user role: {} -> {} for user {}",
                user.getEmail(), role, currentUser.getEmail());

        return userMapper.toResponse(updatedUser);
    }

    @Override
    @Transactional
    public void resetUserPassword(Long id) {
        checkAdminPermission();

        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // Tạo mật khẩu mặc định
        String defaultPassword = "Password@123";
        user.setPassword(passwordEncoder.encode(defaultPassword));

        userRepository.save(user);
        log.info("Admin reset password for user: {}", user.getEmail());
    }

    // ============= PRIVATE METHODS =============

    private void checkAdminPermission() {
        User currentUser = userContextService.getCurrentUser();
        if (currentUser == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        if (currentUser.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private long countAdmins() {
        return userRepository.countByRole(Role.ADMIN);
    }
}