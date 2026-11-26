package com.identity.backend.student.dto;

import java.time.LocalDateTime;

public record StudentListResponse(
        Long id,
        String studentId,
        String fullName,
        String email,
        String phoneNumber,
        Integer admissionYear,
        String accountStatus,
        String profileImageUrl,
        String departmentName,
        String courseName,
        Integer academicYear,
        Integer semester,
        LocalDateTime createdAt
) {
}