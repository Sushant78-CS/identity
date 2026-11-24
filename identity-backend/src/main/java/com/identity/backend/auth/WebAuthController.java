package com.identity.backend.auth;
import com.identity.backend.auth.dto.AdminLoginRequest;
import com.identity.backend.auth.dto.LoginResponse;
import com.identity.backend.auth.dto.StudentLoginRequest;
import com.identity.backend.auth.dto.WebAuthResponse;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth/web")
@RequiredArgsConstructor
public class WebAuthController {

    private static final String REFRESH_COOKIE = "refreshToken";

    private final AuthService authService;

    @Value("${app.security.refresh-token.expiration-seconds:604800}")
    private long refreshTokenExpirationSeconds;

    @Value("${app.security.cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${app.security.cookie.same-site:Lax}")
    private String sameSite;

    @Value("${app.security.web.allowed-origin}")
    private String allowedOrigin;

    @PostMapping("/admin/login")
    public ResponseEntity<WebAuthResponse> adminLogin(
            @Valid @RequestBody AdminLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        validateOrigin(httpRequest);

        LoginResponse loginResponse = authService.adminLogin(request);

        return createLoginResponse(loginResponse);
    }

    @PostMapping("/student/login")
    public ResponseEntity<WebAuthResponse> studentLogin(
            @Valid @RequestBody StudentLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        validateOrigin(httpRequest);

        LoginResponse loginResponse = authService.studentLogin(request);

        return createLoginResponse(loginResponse);
    }

    @PostMapping("/refresh")
    public ResponseEntity<WebAuthResponse> refresh(
            @CookieValue(
                    name = REFRESH_COOKIE,
                    required = false
            ) String refreshToken,
            HttpServletRequest httpRequest
    ) {
        validateOrigin(httpRequest);

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Refresh token is missing"
            );
        }

        LoginResponse loginResponse = authService.refresh(refreshToken);

        return createLoginResponse(loginResponse);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(
                    name = REFRESH_COOKIE,
                    required = false
            ) String refreshToken,
            HttpServletRequest httpRequest
    ) {
        validateOrigin(httpRequest);

        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }

        return ResponseEntity.noContent()
                .header(
                        HttpHeaders.SET_COOKIE,
                        buildRefreshCookie("", Duration.ZERO).toString()
                )
                .build();
    }

    private ResponseEntity<WebAuthResponse> createLoginResponse(
            LoginResponse loginResponse
    ) {
        ResponseCookie cookie = buildRefreshCookie(
                loginResponse.refreshToken(),
                Duration.ofSeconds(refreshTokenExpirationSeconds)
        );

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(WebAuthResponse.from(loginResponse));
    }

    private ResponseCookie buildRefreshCookie(
            String value,
            Duration maxAge
    ) {
        return ResponseCookie.from(REFRESH_COOKIE, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite(sameSite)
                .path("/api/auth/web")
                .maxAge(maxAge)
                .build();
    }

    private void validateOrigin(HttpServletRequest request) {
        String origin = request.getHeader("Origin");

        if (origin == null || !allowedOrigin.equals(origin)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid request origin"
            );
        }
    }
}
