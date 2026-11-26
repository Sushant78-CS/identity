package com.identity.backend.student.dto;

import java.time.LocalDateTime;

public record StudentDetailsResponse(
        Long id,
        String studentId,
        String fullName,
        String email,
        String phoneNumber,
        String accountStatus,
        Integer admissionYear,
        String profileImageUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        CurrentEnrollment currentEnrollment
) {
    public record CurrentEnrollment(
            Long enrollmentId,
            String departmentName,
            String courseName,
            Integer academicYear,
            Integer semester,
            Integer admissionYear,
            String status,
            String startDate,
            String endDate
    ) {
    }
}