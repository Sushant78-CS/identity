package com.identity.backend.college.dto;
import com.identity.backend.college.CollegeStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateCollegeStatusRequest(

        @NotNull(message = "College status is required")
        CollegeStatus status

) {}
