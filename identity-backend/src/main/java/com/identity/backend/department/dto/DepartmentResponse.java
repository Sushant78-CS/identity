package com.identity.backend.department.dto;
import java.time.LocalDateTime;

public record DepartmentResponse(
        Long id,
        Long collegeId,
        String code,
        String name,
        String description,
        Boolean active,
        LocalDateTime createdAt
) {}
