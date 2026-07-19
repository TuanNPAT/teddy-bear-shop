package com.example.teddybearshop.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    private String phone;
    
    private String address;
}