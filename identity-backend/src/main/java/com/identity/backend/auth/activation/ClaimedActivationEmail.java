package com.identity.backend.auth.activation;

public record ClaimedActivationEmail(
        Long emailId,
        String claimToken
) {}
