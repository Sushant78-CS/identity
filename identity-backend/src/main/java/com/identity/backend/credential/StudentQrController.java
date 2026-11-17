package com.identity.backend.credential;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.credential.dto.StudentQrResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/qr")
@RequiredArgsConstructor
public class StudentQrController {

    private final StudentQrService studentQrService;

    @PostMapping("/generate")
    public StudentQrResponse generateQr(
            @AuthenticationPrincipal Jwt jwt
    ) {

        AuthenticatedUser user = AuthenticatedUser.from(jwt);

        return studentQrService.generateQr(user.userId());
    }
}