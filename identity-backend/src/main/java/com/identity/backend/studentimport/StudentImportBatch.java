package com.identity.backend.studentimport;
import com.identity.backend.college.College;
import com.identity.backend.user.User;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "student_import_batches",
        indexes = {
                @Index(
                        name = "idx_import_batch_college",
                        columnList = "college_id"
                )
        }
)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentImportBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private Integer totalRows;

    @Column(nullable = false)
    @Builder.Default
    private Integer validRows = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer invalidRows = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer importedRows = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    @Builder.Default
    private ImportStatus status = ImportStatus.UPLOADED;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
