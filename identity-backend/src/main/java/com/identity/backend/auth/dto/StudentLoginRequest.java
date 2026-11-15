package com.identity.backend.auth.dto;
import jakarta.validation.constraints.NotBlank;

public record StudentLoginRequest(

        @NotBlank(message = "Student ID is required")
        String studentId,

        @NotBlank(message = "College code is required")
        String collegeCode,

        @NotBlank(message = "Password is required")
        String password

) {
}
