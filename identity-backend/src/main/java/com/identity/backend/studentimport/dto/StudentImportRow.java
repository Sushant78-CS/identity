package com.identity.backend.studentimport.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentImportRow {

    private Integer rowNumber;

    private String studentId;
    private String fullName;
    private String email;
    private String phoneNumber;

    private String departmentCode;
    private String departmentName;

    private String courseCode;
    private String courseName;
    private Integer durationYears;

    private Integer admissionYear;
    private Integer academicYear;
    private Integer semester;

    @Builder.Default
    private List<String> errors = new ArrayList<>();

    public boolean isValid() {
        return errors == null || errors.isEmpty();
    }
}