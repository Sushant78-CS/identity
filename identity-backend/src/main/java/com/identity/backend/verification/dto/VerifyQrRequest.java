package com.identity.backend.verification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VerifyQrRequest(

        @NotBlank(message = "QR token is required")
        @Size(max = 100)
        String qrToken

) {}