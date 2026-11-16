package com.identity.backend.auth.dto;

import com.identity.backend.user.User;

public record RefreshTokenRotation(
        User user,
        Long collegeId,
        String refreshToken
) {
}
