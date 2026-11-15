package com.identity.backend.college.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateCollegeRequest(

        @NotBlank(message = "College name is required")
        @Size(max = 150)
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
