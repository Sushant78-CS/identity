package com.identity.backend.credential.dto;

import java.time.Instant;

public record StudentQrResponse(
        String qrValue,
        Instant issuedAt,
        Instant expiresAt,
        long expiresInSeconds
) {}