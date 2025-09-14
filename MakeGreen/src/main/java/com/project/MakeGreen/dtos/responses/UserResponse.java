package com.project.MakeGreen.dtos.responses;

import lombok.Data;

@Data
public class UserResponse {
    private String id;
    private String email;
    private String[] roles;

    public UserResponse(String id, String email, String[] roles) {
        this.id = id;
        this.email = email;
        this.roles = roles;
    }
}