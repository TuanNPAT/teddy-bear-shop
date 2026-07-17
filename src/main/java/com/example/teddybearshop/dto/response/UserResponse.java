package com.example.teddybearshop.dto.response;

import com.example.teddybearshop.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private Boolean status;
}
