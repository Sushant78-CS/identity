
package com.identity.backend.staff;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.staff.dto.StaffProfileResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/staff/profile")
@RequiredArgsConstructor
public class StaffProfileController {

    private final StaffService staffService;

    @GetMapping
    public StaffProfileResponse getStaffProfile(
            @AuthenticationPrincipal Jwt jwt
    ) {
        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        return staffService.getStaffProfile(authenticatedUser);
    }
}
