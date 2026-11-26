
package com.identity.backend.collegeadmin.dto;

import java.time.LocalDateTime;

public record CollegeAdminProfileResponse(
        Long userId,
        String fullName,
        String email,
        String phoneNumber,
        String role,
        String status,
        LocalDateTime createdAt,
        CollegeInfo college
) {

    public record CollegeInfo(
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
            String status
    ) {}
}
