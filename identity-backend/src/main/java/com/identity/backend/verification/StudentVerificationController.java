package com.identity.backend.verification;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.verification.dto.StudentVerificationResponse;
import com.identity.backend.verification.dto.VerifyQrRequest;

import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff/qr")
@RequiredArgsConstructor
public class StudentVerificationController {

    private final StudentVerificationService verificationService;

    @PostMapping("/verify")
    public StudentVerificationResponse verifyQr(
            @Valid @RequestBody VerifyQrRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {

        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        return verificationService.verifyQr(
                request.qrToken(),
                authenticatedUser
        );
    }
}