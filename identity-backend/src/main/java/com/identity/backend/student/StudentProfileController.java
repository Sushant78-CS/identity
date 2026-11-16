package com.identity.backend.student;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.student.dto.StudentProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    @GetMapping("/profile")
    public StudentProfileResponse getProfile(
            @AuthenticationPrincipal Jwt jwt
    ) {
        AuthenticatedUser authenticatedUser = AuthenticatedUser.from(jwt);

        return studentProfileService.getProfile(
                authenticatedUser.userId()
        );
    }
}