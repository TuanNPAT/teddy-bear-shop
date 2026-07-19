package com.example.teddybearshop.service.impl;

import com.example.teddybearshop.common.exception.AppException;
import com.example.teddybearshop.common.exception.ErrorCode;
import com.example.teddybearshop.dto.request.LoginRequest;
import com.example.teddybearshop.dto.request.RegisterRequest;
import com.example.teddybearshop.dto.response.AuthResponse;
import com.example.teddybearshop.dto.response.UserResponse;
import com.example.teddybearshop.enums.Role;
import com.example.teddybearshop.mapper.UserMapper;
import com.example.teddybearshop.model.User;
import com.example.teddybearshop.repository.UserRepository;
import com.example.teddybearshop.service.AuthService;
import com.example.teddybearshop.util.OtpCache;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final OtpCache otpCache;
    private final UserMapper userMapper;

    @Value("${jwt.secret}")
    private String signerKey;

    @Value("${jwt.expiration-ms}")
    private long validDuration;

    // ==================== ĐĂNG KÝ ====================

    @Override
    public void sendOTPForRegister(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        String otp = generateOTP();
        otpCache.put(email, otp);

        sendEmail(email, "Mã OTP đăng ký tài khoản",
                "Mã OTP của bạn là: " + otp + "\nOTP có hiệu lực trong 5 phút.");
    }

    @Override
    public UserResponse verifyOTPAndRegister(RegisterRequest request, String otp) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        verifyOTP(request.getEmail(), otp);

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .status(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered: {}", savedUser.getEmail());

        return userMapper.toResponse(savedUser);
    }

    // ==================== LOGIN ====================

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        return AuthResponse.builder()
                .token(generateToken(user))
                .tokenType("Bearer")
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // ==================== QUÊN MẬT KHẨU ====================

    @Override
    public void sendOTPForForgotPassword(String email) {
        // Kiểm tra user tồn tại
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        String otp = generateOTP();
        otpCache.put(email, otp);

        sendEmail(email, "Mã OTP đặt lại mật khẩu",
                "Mã OTP của bạn là: " + otp + "\nOTP có hiệu lực trong 5 phút.");

        log.info("OTP for forgot password sent to: {}", email);
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        // 1. Kiểm tra user tồn tại
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        // 2. Kiểm tra OTP
        verifyOTP(email, otp);

        // 3. Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password reset successfully for: {}", email);
    }

    @Override
    public AuthResponse resetPasswordAndLogin(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        verifyOTP(email, otp);

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password reset successfully for: {}", email);

        String token = generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    // ==================== UTILITY METHODS ====================

    private void verifyOTP(String email, String otp) {
        String cachedOtp = otpCache.get(email);
        if (cachedOtp == null) {
            throw new AppException(ErrorCode.OTP_EXPIRED);
        }
        if (!otp.equals(cachedOtp)) {
            throw new AppException(ErrorCode.INVALID_OTP);
        }
        otpCache.remove(email);
    }

    private String generateOTP() {
        return String.format("%06d", new Random().nextInt(999999));
    }

    private void sendEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
            throw new AppException(ErrorCode.EMAIL_SEND_FAILED);
        }
    }

    private String generateToken(User user) {
        try {
            JWSHeader header = new JWSHeader(JWSAlgorithm.HS256);

            JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
                    .subject(user.getEmail())
                    .issuer("teddy-bear-shop")
                    .issueTime(new Date())
                    .expirationTime(Date.from(Instant.now().plusSeconds(validDuration)))
                    .claim("scope", user.getRole().name())
                    .build();

            SignedJWT signedJWT = new SignedJWT(header, claimsSet);
            signedJWT.sign(new MACSigner(signerKey.getBytes()));

            return signedJWT.serialize();
        } catch (JOSEException e) {
            log.error("Generate JWT failed", e);
            throw new RuntimeException(e);
        }
    }
}