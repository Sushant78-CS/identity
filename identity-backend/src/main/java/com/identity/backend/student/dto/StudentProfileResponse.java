package com.identity.backend.student.dto;

public record StudentProfileResponse(
        Long userId,
        String fullName,
        String email,
        String phoneNumber,
        String role,
        String accountStatus,
        String studentId,
        Integer admissionYear,
        CollegeInfo college,
        EnrollmentInfo enrollment
) {

    public record CollegeInfo(
            Long id,
            String code,
            String name
    ) {}

    public record EnrollmentInfo(
            Integer academicYear,
            Integer semester,
            String department,
            String course,
            String status
    ) {}
}