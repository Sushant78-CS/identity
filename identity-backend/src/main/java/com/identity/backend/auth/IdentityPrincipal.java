package com.identity.backend.auth;

import com.identity.backend.user.UserRole;

public record IdentityPrincipal(
        Long userId,
        Long collegeId,
        UserRole role
) {
}
