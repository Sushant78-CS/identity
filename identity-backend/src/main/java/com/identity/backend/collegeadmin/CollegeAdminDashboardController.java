
package com.identity.backend.collegeadmin;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.collegeadmin.dto.CollegeAdminDashboardResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/college-admin/dashboard")
@RequiredArgsConstructor
public class CollegeAdminDashboardController {

    private final CollegeAdminService collegeAdminService;

    @GetMapping
    public CollegeAdminDashboardResponse getDashboard(
            @AuthenticationPrincipal Jwt jwt
    ) {
        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        return collegeAdminService.getDashboard(authenticatedUser);
    }
}
