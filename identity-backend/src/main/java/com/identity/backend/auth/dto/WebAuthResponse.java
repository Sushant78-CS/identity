package com.identity.backend.auth.dto;
import com.identity.backend.user.UserRole;

public record WebAuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long userId,
        String fullName,
        UserRole role,
        Long collegeId
) {

    public static WebAuthResponse from(LoginResponse response) {
        return new WebAuthResponse(
                response.accessToken(),
                response.tokenType(),
                response.expiresIn(),
                response.userId(),
                response.fullName(),
                response.role(),
                response.collegeId()
        );
    }
}
