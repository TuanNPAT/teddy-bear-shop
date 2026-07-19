package com.example.teddybearshop.service.impl;

import com.example.teddybearshop.common.exception.AppException;
import com.example.teddybearshop.common.exception.ErrorCode;
import com.example.teddybearshop.dto.request.UpdateProfileRequest;
import com.example.teddybearshop.dto.response.UserResponse;
import com.example.teddybearshop.mapper.UserMapper;
import com.example.teddybearshop.model.User;
import com.example.teddybearshop.repository.UserRepository;
import com.example.teddybearshop.service.UserContextService;
import com.example.teddybearshop.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserContextService userContextService;

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

        User updatedUser = userRepository.save(currentUser);
        
        log.info("Updated profile for user: {}", updatedUser.getEmail());

        return userMapper.toResponse(updatedUser);
    }
}