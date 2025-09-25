package com.project.MakeGreen.dtos.responses;

import lombok.Data;

@Data
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String userId;
    private String email;
    private String phoneNumber; // Thêm trường này
    private String[] roles;
    
    public AuthResponse(String accessToken, String refreshToken, String userId, String email, String phoneNumber, String[] roles) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.userId = userId;
        this.email = email;
        this.phoneNumber = phoneNumber; // Thêm dòng này vào constructor
        this.roles = roles;
    }
}