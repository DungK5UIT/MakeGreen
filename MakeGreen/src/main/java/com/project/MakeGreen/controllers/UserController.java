package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.responses.UserResponse;
import com.project.MakeGreen.models.NguoiDung;
import com.project.MakeGreen.repositories.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final NguoiDungRepository repo;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(Authentication auth) {
        String userId = auth.getName();
        var user = repo.findById(UUID.fromString(userId)).orElse(null);
        if (user == null) return ResponseEntity.status(404).body(null);

        String[] roles = user.getVaiTros().stream()
            .map(v -> v.getMa())
            .toArray(String[]::new);

        UserResponse response = new UserResponse(
            user.getId().toString(),
            user.getEmail(),
            roles
        );
        return ResponseEntity.ok(response);
    }
}