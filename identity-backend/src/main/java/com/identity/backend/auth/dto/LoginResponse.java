package com.identity.backend.auth.dto;
import com.identity.backend.user.UserRole;

public record LoginResponse(

        String accessToken,
        String tokenType,
        long expiresIn,
        Long userId,
        String fullName,
        UserRole role,
        Long collegeId

) {
}
