package com.project.MakeGreen.supabase;

import com.project.MakeGreen.config.SupabaseConfig;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SupabaseAuthClient {

    private final SupabaseConfig supabaseConfig;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public AuthTokenResponse passwordSignIn(String emailParam, String password) {
        try {
            String url = supabaseConfig.getUrl() + "/auth/v1/token?grant_type=password";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", supabaseConfig.getAnonKey());

            Map<String, String> body = Map.of("email", emailParam, "password", password);
            String jsonBody = mapper.writeValueAsString(body);
            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new BadCredentialsException("Supabase login failed: " + response.getStatusCode() + " - " + response.getBody());
            }

            JsonNode root = mapper.readTree(response.getBody());
            String accessToken = root.path("access_token").asText();
            String refreshToken = root.path("refresh_token").asText();
            JsonNode userNode = root.path("user");
            String userId = userNode.path("id").asText();
            String userEmail = userNode.path("email").asText();

            return new AuthTokenResponse(accessToken, refreshToken, userId, userEmail);
        } catch (Exception e) {
            throw new BadCredentialsException("Supabase Auth error: " + e.getMessage());
        }
    }

    public AuthTokenResponse signUp(String emailParam, String password) {
        try {
            String url = supabaseConfig.getUrl() + "/auth/v1/signup";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", supabaseConfig.getAnonKey());

            Map<String, Object> body = new HashMap<>();
            body.put("email", emailParam);
            body.put("password", password);
            String jsonBody = mapper.writeValueAsString(body);
            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                String errorBody = response.getBody();
                if (errorBody != null && errorBody.contains("User already registered")) {
                    throw new BadCredentialsException("Email đã được sử dụng. Vui lòng dùng email khác hoặc đăng nhập.");
                }
                throw new BadCredentialsException("Supabase signup failed: " + response.getStatusCode() + " - " + errorBody);
            }

            JsonNode root = mapper.readTree(response.getBody());
            String accessToken = null;
            String refreshToken = null;
            if (root.has("access_token")) {
                accessToken = root.path("access_token").asText();
                refreshToken = root.path("refresh_token").asText();
            }
            JsonNode userNode = root.has("user") ? root.path("user") : root;
            String userId = userNode.path("id").asText();
            String userEmail = userNode.path("email").asText();

            if (userId.isEmpty()) {
                throw new BadCredentialsException("Signup failed: No user ID returned. Check Supabase logs.");
            }

            return new AuthTokenResponse(accessToken, refreshToken, userId, userEmail);
        } catch (Exception e) {
            throw new BadCredentialsException("Supabase Auth error: " + e.getMessage());
        }
    }

    public AuthTokenResponse refreshToken(String refreshTokenParam) {
        try {
            String url = supabaseConfig.getUrl() + "/auth/v1/token?grant_type=refresh_token";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", supabaseConfig.getAnonKey());

            Map<String, String> body = Map.of("refresh_token", refreshTokenParam);
            String jsonBody = mapper.writeValueAsString(body);
            HttpEntity<String> request = new HttpEntity<>(jsonBody, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new BadCredentialsException("Supabase refresh failed: " + response.getStatusCode() + " - " + response.getBody());
            }

            JsonNode root = mapper.readTree(response.getBody());
            String accessToken = root.path("access_token").asText();
            String refreshTokenValue = root.path("refresh_token").asText();
            JsonNode userNode = root.path("user");
            String userId = userNode.path("id").asText();
            String userEmail = userNode.path("email").asText();

            return new AuthTokenResponse(accessToken, refreshTokenValue, userId, userEmail);
        } catch (Exception e) {
            throw new BadCredentialsException("Supabase Auth error: " + e.getMessage());
        }
    }

    public void signOut(String accessToken) {
        try {
            String url = supabaseConfig.getUrl() + "/auth/v1/logout";
            HttpHeaders headers = new HttpHeaders();
            headers.set("apikey", supabaseConfig.getAnonKey());
            headers.set("Authorization", "Bearer " + accessToken);
            HttpEntity<String> request = new HttpEntity<>(null, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                throw new BadCredentialsException("Supabase logout failed: " + response.getStatusCode() + " - " + response.getBody());
            }
        } catch (Exception e) {
            throw new BadCredentialsException("Supabase Auth error: " + e.getMessage());
        }
    }

    @Data
    @AllArgsConstructor
    public static class AuthTokenResponse {
        private String accessToken;
        private String refreshToken;
        private String userId;
        private String email;
    }
}