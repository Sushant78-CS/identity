package com.identity.backend.college.dto;
import java.time.LocalDateTime;

public record CollegeResponse(
        Long id,
        String code,
        String name,
        String address,
        String city,
        String state,
        String country,
        String officialEmail,
        String contactNumber,
        String websiteUrl,
        String status,
        LocalDateTime createdAt
) {}
