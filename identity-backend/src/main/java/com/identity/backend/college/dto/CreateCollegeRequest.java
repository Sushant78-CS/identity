package com.identity.backend.college.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCollegeRequest(

        @NotBlank(message = "College code is required")
        @Size(max = 20, message = "College code cannot exceed 20 characters")
        @Pattern(
                regexp = "^[A-Za-z0-9_-]+$",
                message = "College code can contain only letters, numbers, underscores and hyphens"
        )
        String code,

        @NotBlank(message = "College name is required")
        @Size(max = 150, message = "College name cannot exceed 150 characters")
        String name,

        @Size(max = 255)
        String address,

        @Size(max = 100)
        String city,

        @Size(max = 100)
        String state,

        @Size(max = 100)
        String country,

        @Email(message = "Enter a valid official email")
        @Size(max = 150)
        String officialEmail,

        @Size(max = 20)
        String contactNumber,

        @Size(max = 255)
        String websiteUrl
) {}
