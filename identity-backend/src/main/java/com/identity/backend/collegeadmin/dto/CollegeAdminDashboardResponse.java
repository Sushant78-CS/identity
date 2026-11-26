package com.identity.backend.collegeadmin.dto;

public record CollegeAdminDashboardResponse(
        long totalStudents,
        long activeStudents,
        long totalStaff,
        long activeStaff,
        long totalDepartments,
        long totalCourses,
        long todayVerifications
) {
}