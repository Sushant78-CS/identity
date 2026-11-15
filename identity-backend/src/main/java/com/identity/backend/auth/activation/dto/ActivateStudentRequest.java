package com.identity.backend.auth.activation.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ActivateStudentRequest(

        @NotBlank(message = "Activation token is required")
        String token,

        @NotBlank(message = "Password is required")
        @Size(min = 8, max = 72,
                message = "Password must contain between 8 and 72 characters")
        String password

) {
}
