package com.identity.backend.staff.dto;

import java.time.LocalDateTime;

public record StaffResponse(
        Long id,
        Long collegeId,
        String fullName,
        String email,
        String phoneNumber,
        String role,
        String status,
        LocalDateTime createdAt
) {}