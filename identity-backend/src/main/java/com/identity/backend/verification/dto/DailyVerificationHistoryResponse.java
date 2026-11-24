package com.identity.backend.verification.dto;

import java.time.LocalDate;
import java.util.List;

public record DailyVerificationHistoryResponse(
        LocalDate date,
        long totalVerifications,
        List<VerificationHistoryItemResponse> verifications
) {}