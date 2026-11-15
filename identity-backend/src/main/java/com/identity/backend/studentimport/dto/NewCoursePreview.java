package com.identity.backend.studentimport.dto;

public record NewCoursePreview(
        String departmentCode,
        String departmentName,
        String courseCode,
        String courseName,
        Integer durationYears
) {}