package com.identity.backend.staff.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateStaffRequest(

        @NotBlank(message = "Full name is required")
        @Size(max = 150, message = "Full name cannot exceed 150 characters")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email address")
        @Size(max = 150, message = "Email cannot exceed 150 characters")
        String email,

        @Size(max = 20, message = "Phone number cannot exceed 20 characters")
        String phoneNumber,

        @NotBlank(message = "Initial password is required")
        @Size(min = 12, max = 72, message = "Password must be between 12 and 72 characters")
        String initialPassword

) {}