package com.identity.backend.studentimport;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "student_import_records",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_import_batch_row",
                        columnNames = {"batch_id", "row_number"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_import_record_batch",
                        columnList = "batch_id"
                )
        }
)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentImportRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "batch_id", nullable = false)
    private StudentImportBatch batch;

    @Column(name = "row_number", nullable = false)
    private Integer rowNumber;

    @Column(name = "student_id", length = 50)
    private String studentId;

    @Column(name = "full_name", length = 150)
    private String fullName;

    @Column(length = 150)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "department_code", length = 20)
    private String departmentCode;

    @Column(name = "department_name", length = 150)
    private String departmentName;

    @Column(name = "course_name", length = 150)
    private String courseName;

    @Column(name = "duration_years")
    private Integer durationYears;

    @Column(name = "course_code", length = 20)
    private String courseCode;

    private Integer admissionYear;

    private Integer academicYear;

    private Integer semester;

    @Column(nullable = false)
    @Builder.Default
    private Boolean valid = false;

    @Column(length = 2000)
    private String errors;

    @Column(nullable = false)
    @Builder.Default
    private Boolean imported = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
