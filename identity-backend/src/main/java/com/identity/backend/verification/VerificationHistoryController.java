package com.identity.backend.verification;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.verification.dto.DailyVerificationHistoryResponse;
import com.identity.backend.verification.dto.VerificationHistorySummaryResponse;

import lombok.RequiredArgsConstructor;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/staff/verification-history")
@RequiredArgsConstructor
public class VerificationHistoryController {

    private final StudentVerificationService verificationService;

    private static final ZoneId BUSINESS_ZONE =
            ZoneId.of("Asia/Kolkata");

    @GetMapping("/summary")
    public VerificationHistorySummaryResponse getSummary(
            @AuthenticationPrincipal Jwt jwt
    ) {
        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        return verificationService.getVerificationSummary(
                authenticatedUser
        );
    }

    @GetMapping("/daily")
    public DailyVerificationHistoryResponse getDailyHistory(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        LocalDate requestedDate = date != null
                ? date
                : LocalDate.now(BUSINESS_ZONE);

        return verificationService.getDailyVerificationHistory(
                authenticatedUser,
                requestedDate
        );
    }
}