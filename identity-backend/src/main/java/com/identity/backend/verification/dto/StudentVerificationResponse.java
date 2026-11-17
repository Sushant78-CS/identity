package com.identity.backend.verification.dto;

import java.time.Instant;

public record StudentVerificationResponse(
        boolean valid,
        String message,
        Instant verifiedAt,
        StudentInfo student
) {

    public record StudentInfo(
            String studentId,
            String fullName,
            String profileImageUrl,
            String collegeName,
            String department,
            String course
    ) {}
}