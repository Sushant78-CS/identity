package com.identity.backend.collegeadmin.dto;
import java.time.LocalDateTime;

public record CollegeAdminResponse(
        Long userId,
        Long collegeId,
        String fullName,
        String email,
        String phoneNumber,
        String role,
        String status,
        LocalDateTime createdAt
) {}
