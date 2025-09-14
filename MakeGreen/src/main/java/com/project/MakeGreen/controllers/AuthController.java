package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.requests.SignupRequest;
import com.project.MakeGreen.dtos.responses.AuthResponse;
import com.project.MakeGreen.services.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService auth;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            AuthResponse response = auth.loginWithEmailPassword(req.getEmail(), req.getPassword());
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest req) {
        try {
            AuthResponse response = auth.signup(req);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Unexpected error: " + e.getMessage()));
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String rt = body.get("refreshToken");
        if (rt == null || rt.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "refreshToken required"));
        }
        try {
            AuthResponse response = auth.refresh(rt);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> body) {
        String userId = body.get("userId");
        String accessToken = body.get("accessToken");
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "userId required"));
        }
        if (accessToken == null || accessToken.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "accessToken required"));
        }
        try {
            auth.logout(userId, accessToken);
            return ResponseEntity.ok().body(Map.of("message", "Đăng xuất thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Đăng xuất thất bại: " + e.getMessage()));
        }
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        
        @NotBlank
        private String password;
    }
}