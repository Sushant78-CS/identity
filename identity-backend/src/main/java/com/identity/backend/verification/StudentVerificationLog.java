package com.identity.backend.verification;

import com.identity.backend.college.College;
import com.identity.backend.student.Student;
import com.identity.backend.user.User;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(
        name = "student_verification_logs",
        indexes = {
                @Index(
                        name = "idx_verification_staff_time",
                        columnList = "staff_user_id, verified_at"
                ),
                @Index(
                        name = "idx_verification_college_time",
                        columnList = "college_id, verified_at"
                )
        }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentVerificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_user_id", nullable = false)
    private User staffUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @Column(name = "verified_at", nullable = false)
    private Instant verifiedAt;
}