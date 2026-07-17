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
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.secret}")
    private String signerKey;

    @Value("${jwt.expiration-ms}")
    private long validDuration;

    @Override
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.USER_EXISTED);
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.CUSTOMER)
                .status(true)
                .build();

        return UserMapper.toResponse(userRepository.save(user));
    }

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
