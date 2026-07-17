package com.example.teddybearshop.util;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpCache {
    private final Map<String, String> otpMap = new ConcurrentHashMap<>();
    private final Map<String, Long> expiryMap = new ConcurrentHashMap<>();
    private static final long EXPIRY = 5 * 60 * 1000; // 5 phút
    
    public void put(String email, String otp) {
        otpMap.put(email, otp);
        expiryMap.put(email, System.currentTimeMillis() + EXPIRY);
    }
    
    public String get(String email) {
        Long expiry = expiryMap.get(email);
        if (expiry == null || expiry < System.currentTimeMillis()) {
            otpMap.remove(email);
            expiryMap.remove(email);
            return null;
        }
        return otpMap.get(email);
    }
    
    public void remove(String email) {
        otpMap.remove(email);
        expiryMap.remove(email);
    }
}