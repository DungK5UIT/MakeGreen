package com.project.MakeGreen.dtos.responses;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoginResponse {
  private String accessToken;
  private String refreshToken;
  private String email;
  private String userId;     // UUID String
  private String[] roles;    // ví dụ ["ADMIN","USER"]
}