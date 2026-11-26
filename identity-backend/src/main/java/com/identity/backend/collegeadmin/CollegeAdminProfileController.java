package com.identity.backend.collegeadmin;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.collegeadmin.dto.CollegeAdminProfileResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/college-admin/profile")
@RequiredArgsConstructor
public class CollegeAdminProfileController {

    private final CollegeAdminService collegeAdminService;

    @GetMapping
    public CollegeAdminProfileResponse getProfile(
            @AuthenticationPrincipal Jwt jwt
    ) {
        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        return collegeAdminService.getProfile(authenticatedUser);
    }
}