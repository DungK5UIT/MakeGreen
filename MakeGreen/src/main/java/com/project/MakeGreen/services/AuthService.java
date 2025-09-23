package com.project.MakeGreen.services;

import com.project.MakeGreen.dtos.responses.AuthResponse;
import com.project.MakeGreen.models.NguoiDung;
import com.project.MakeGreen.models.VaiTro;
import com.project.MakeGreen.repositories.NguoiDungRepository;
import com.project.MakeGreen.repositories.VaiTroRepository;
import com.project.MakeGreen.supabase.SupabaseAuthClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SupabaseAuthClient supabaseAuthClient;
    private final NguoiDungRepository nguoiDungRepository;
    private final VaiTroRepository vaiTroRepository;

    public AuthResponse loginWithEmailPassword(String email, String password) {
        var tokens = supabaseAuthClient.passwordSignIn(email, password);
        NguoiDung user = nguoiDungRepository.findById(UUID.fromString(tokens.getUserId()))
            .orElseGet(() -> {
                NguoiDung newUser = new NguoiDung();
                newUser.setId(UUID.fromString(tokens.getUserId()));
                newUser.setEmail(tokens.getEmail());
                newUser.setTrangThai("ACTIVE");
                newUser.setEnabled(true);
                VaiTro userRole = vaiTroRepository.findByMa("USER")
                    .orElseGet(() -> {
                        VaiTro newRole = new VaiTro();
                        newRole.setMa("USER");
                        newRole.setTen("Người dùng");
                        return vaiTroRepository.save(newRole);
                    });
                newUser.setVaiTros(new HashSet<>(Set.of(userRole)));
                return nguoiDungRepository.save(newUser);
            });

        if (!"ACTIVE".equals(user.getTrangThai())) {
            user.setTrangThai("ACTIVE");
            nguoiDungRepository.save(user);
        }

        String[] roles = user.getVaiTros().stream()
            .map(VaiTro::getMa)
            .toArray(String[]::new);

        return new AuthResponse(
            tokens.getAccessToken(),
            tokens.getRefreshToken(),
            tokens.getUserId(),
            tokens.getEmail(),
            roles
        );
    }

    public AuthResponse signup(com.project.MakeGreen.dtos.requests.SignupRequest req) {
        if (nguoiDungRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new BadCredentialsException("Email đã được sử dụng. Vui lòng dùng email khác hoặc đăng nhập.");
        }

        // Chỉ gửi email và password tới Supabase
        var tokens = supabaseAuthClient.signUp(req.getEmail(), req.getPassword());
        NguoiDung user = nguoiDungRepository.findById(UUID.fromString(tokens.getUserId()))
            .orElseGet(() -> {
                NguoiDung newUser = new NguoiDung();
                newUser.setId(UUID.fromString(tokens.getUserId()));
                newUser.setEmail(tokens.getEmail());
                newUser.setHoTen(req.getFullName());
                newUser.setTrangThai("ACTIVE");
                newUser.setEnabled(true);
                VaiTro userRole = vaiTroRepository.findByMa("USER")
                    .orElseGet(() -> {
                        VaiTro newRole = new VaiTro();
                        newRole.setMa("USER");
                        newRole.setTen("Người dùng");
                        return vaiTroRepository.save(newRole);
                    });
                newUser.setVaiTros(new HashSet<>(Set.of(userRole)));
                return nguoiDungRepository.save(newUser);
            });

        String[] roles = user.getVaiTros().stream()
            .map(VaiTro::getMa)
            .toArray(String[]::new);

        return new AuthResponse(
            tokens.getAccessToken(),
            tokens.getRefreshToken(),
            tokens.getUserId(),
            tokens.getEmail(),
            roles
        );
    }

    public AuthResponse refresh(String refreshToken) {
        var tokens = supabaseAuthClient.refreshToken(refreshToken);
        NguoiDung user = nguoiDungRepository.findById(UUID.fromString(tokens.getUserId()))
            .orElseThrow(() -> new RuntimeException("User not found"));

        if (!"ACTIVE".equals(user.getTrangThai())) {
            user.setTrangThai("ACTIVE");
            nguoiDungRepository.save(user);
        }

        String[] roles = user.getVaiTros().stream()
            .map(VaiTro::getMa)
            .toArray(String[]::new);

        return new AuthResponse(
            tokens.getAccessToken(),
            tokens.getRefreshToken(),
            tokens.getUserId(),
            tokens.getEmail(),
            roles
        );
    }

    public void logout(String userId, String accessToken) {
        NguoiDung user = nguoiDungRepository.findById(UUID.fromString(userId))
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setTrangThai("INACTIVE");
        nguoiDungRepository.save(user);
        supabaseAuthClient.signOut(accessToken);
    }
}