package com.identity.backend.verification.dto;

import java.time.LocalDate;

public record VerificationHistorySummaryResponse(
        long totalVerifications,
        long todayVerifications,
        LocalDate today
) {}