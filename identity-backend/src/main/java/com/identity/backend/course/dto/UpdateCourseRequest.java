package com.identity.backend.course.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UpdateCourseRequest(

        @NotBlank(message = "Course name is required")
        @Size(max = 150)
        String name,

        @Size(max = 500)
        String description,

        @NotNull(message = "Course duration is required")
        @Positive(message = "Course duration must be positive")
        Integer durationYears

) {}
