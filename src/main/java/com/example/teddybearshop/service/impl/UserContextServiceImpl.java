package com.example.teddybearshop.service.impl;

import com.example.teddybearshop.service.UserContextService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class UserContextServiceImpl implements UserContextService {

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
}