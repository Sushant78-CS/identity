package com.identity.backend.verification.dto;

import java.time.Instant;

public record VerificationHistoryItemResponse(
        Long id,
        String studentId,
        String studentName,
        Instant verifiedAt
) {}