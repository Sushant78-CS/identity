package com.identity.backend.staff;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.staff.dto.StaffProfileResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffProfileController {

    private final StaffService staffService;

    @GetMapping("/profile")
    public ResponseEntity<StaffProfileResponse> getStaffProfile(
            @AuthenticationPrincipal Jwt jwt
    ) {
        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        return ResponseEntity.ok(
                staffService.getStaffProfile(authenticatedUser)
        );
    }
}