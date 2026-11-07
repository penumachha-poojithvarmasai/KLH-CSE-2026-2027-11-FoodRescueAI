package com.courierproof.authservice.controller;

import com.courierproof.authservice.dto.LoginRequest;
import com.courierproof.authservice.dto.LoginResponse;
import com.courierproof.authservice.dto.RegisterRequest;
import com.courierproof.authservice.dto.UserResponse;
import com.courierproof.authservice.service.AuthService;
import com.courierproof.authservice.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
// CORS managed centrally by Gateway
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        UserResponse userResponse = authService.getUserByEmail(email);
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable Long id,
            Authentication authentication) {

        String currentUserEmail = authentication.getName();
        UserResponse currentUser = authService.getUserByEmail(currentUserEmail);

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isSameUser = currentUser.getId().equals(id);

        if (!isAdmin && !isSameUser) {
            return ResponseEntity.status(403).build();
        }

        UserResponse userResponse = authService.getUserById(id);
        return ResponseEntity.ok(userResponse);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }
}
