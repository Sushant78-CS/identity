package com.identity.backend.studentimport.dto;

import java.util.List;

public record StudentImportPreview(
        Long importBatchId,
        String fileName,
        Integer totalRows,
        Integer validRows,
        Integer invalidRows,
        List<NewDepartmentPreview> newDepartments,
        List<NewCoursePreview> newCourses,
        List<StudentImportRow> rows
) {}