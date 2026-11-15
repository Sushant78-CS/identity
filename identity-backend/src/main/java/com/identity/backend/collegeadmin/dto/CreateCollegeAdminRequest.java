package com.identity.backend.collegeadmin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateCollegeAdminRequest(

        @NotBlank(message = "Full name is required")
        @Size(max = 150)
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email address")
        @Size(max = 150)
        String email,

        @Pattern(
                regexp = "^$|^[+]?[0-9]{10,15}$",
                message = "Enter a valid phone number"
        )
        String phoneNumber,

        @NotBlank(message = "Initial password is required")
        @Size(min = 12, max = 72,
                message = "Password must contain between 12 and 72 characters")
        String initialPassword

) {}
