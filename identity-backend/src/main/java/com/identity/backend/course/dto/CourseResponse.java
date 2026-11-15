package com.identity.backend.course.dto;
import java.time.LocalDateTime;

public record CourseResponse(
        Long id,
        Long departmentId,
        String code,
        String name,
        String description,
        Integer durationYears,
        Boolean active,
        LocalDateTime createdAt
) {}
