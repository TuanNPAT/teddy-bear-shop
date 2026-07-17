package com.example.teddybearshop.dto.response;

import com.example.teddybearshop.enums.Role;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private String email;
    private Role role;
}
