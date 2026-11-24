package com.identity.backend.staff.dto;

import java.time.LocalDateTime;

public record StaffProfileResponse(
        Long userId,
        String fullName,
        String email,
        String phoneNumber,
        String role,
        String status,
        CollegeInfo college,
        LocalDateTime createdAt
) {
    public record CollegeInfo(
            Long id,
            String code,
            String name
    ) {}
}