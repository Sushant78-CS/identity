
package com.identity.backend.auth;

import com.identity.backend.auth.dto.AdminLoginRequest;
import com.identity.backend.auth.dto.LoginResponse;
import com.identity.backend.auth.dto.StudentLoginRequest;
import com.identity.backend.auth.security.AuthenticatedUser;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/student/login")
    public ResponseEntity<LoginResponse> studentLogin(
            @Valid @RequestBody StudentLoginRequest request
    ) {
        return ResponseEntity.ok(
                authService.studentLogin(request)
        );
    }

    @PostMapping("/admin/login")
    public ResponseEntity<LoginResponse> adminLogin(
            @Valid @RequestBody AdminLoginRequest request
    ) {
        return ResponseEntity.ok(
                authService.adminLogin(request)
        );
    }

    @GetMapping("/me")
    public ResponseEntity<AuthenticatedUser> getCurrentUser(
            @AuthenticationPrincipal Jwt jwt
    ) {
        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        return ResponseEntity.ok(authenticatedUser);
    }
}
