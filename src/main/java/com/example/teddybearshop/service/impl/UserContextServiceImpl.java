package com.example.teddybearshop.service.impl;

import com.example.teddybearshop.model.User;
import com.example.teddybearshop.repository.UserRepository;
import com.example.teddybearshop.service.UserContextService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserContextServiceImpl implements UserContextService {

    private final UserRepository userRepository;

    @Override
    public String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                    && !"anonymousUser".equals(authentication.getPrincipal())) {
                return authentication.getName();
            }
            return "SYSTEM";
        } catch (Exception e) {
            log.error("Failed to get current username", e);
            return "SYSTEM";
        }
    }

    @Override
    public Long getCurrentUserId() {
        try {
            String email = getCurrentUsername();
            if (email == null || "SYSTEM".equals(email)) {
                return null;
            }
            return userRepository.findByEmail(email)
                    .map(User::getId)
                    .orElse(null);
        } catch (Exception e) {
            log.error("Failed to get current user ID", e);
            return null;
        }
    }
}