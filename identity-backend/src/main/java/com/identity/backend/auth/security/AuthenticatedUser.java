
package com.identity.backend.auth.security;

import com.identity.backend.user.UserRole;

import org.springframework.security.oauth2.jwt.Jwt;

public record AuthenticatedUser(
        Long userId,
        UserRole role,
        Long collegeId
) {

    public static AuthenticatedUser from(Jwt jwt) {

        Long userId = Long.valueOf(jwt.getSubject());

        UserRole role = UserRole.valueOf(
                jwt.getClaimAsString("role")
        );

        Number collegeIdClaim = jwt.getClaim("collegeId");

        Long collegeId = collegeIdClaim != null
                ? collegeIdClaim.longValue()
                : null;

        return new AuthenticatedUser(
                userId,
                role,
                collegeId
        );
    }

    public boolean belongsToCollege(Long requestedCollegeId) {
        return collegeId != null
                && collegeId.equals(requestedCollegeId);
    }

    public boolean isSuperAdmin() {
        return role == UserRole.SUPER_ADMIN;
    }

    public boolean isCollegeAdmin() {
        return role == UserRole.COLLEGE_ADMIN;
    }

    public boolean isStaff() {
        return role == UserRole.STAFF;
    }

    public boolean isStudent() {
        return role == UserRole.STUDENT;
    }
}
