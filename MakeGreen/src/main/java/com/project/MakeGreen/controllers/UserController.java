package com.project.MakeGreen.controllers;

import com.project.MakeGreen.dtos.responses.UserResponse;
import com.project.MakeGreen.models.NguoiDung;
import com.project.MakeGreen.repositories.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final NguoiDungRepository repo;

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication auth) {
        try {
            UUID userId = UUID.fromString(auth.getName());
            NguoiDung user = repo.findById(userId).orElse(null);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Nếu chưa enabled (chưa xác nhận email), chặn lại
            if (Boolean.FALSE.equals(user.getEnabled())) {
                return ResponseEntity.status(403).body("Tài khoản chưa được kích hoạt");
            }

            String[] roles = user.getVaiTros().stream()
                    .map(v -> v.getMa())
                    .toArray(String[]::new);
            UserResponse response = new UserResponse(
            	    user.getId().toString(),
            	    user.getEmail(),
            	    roles
            	);

            // Debug log
            System.out.printf("User /me: id=%s, hoTen='%s', sdt='%s'%n",
                    userId, user.getHoTen(), user.getSdt());

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            // Nếu auth.getName() không phải UUID hợp lệ
            return ResponseEntity.badRequest().body("Invalid user ID");
        }
    }
}
