
package com.identity.backend.auth.activation;

import com.identity.backend.student.Student;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "student_activation_tokens",
        indexes = {
                @Index(
                        name = "idx_activation_token_hash",
                        columnList = "token_hash",
                        unique = true
                )
        }
)
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class StudentActivationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "student_id",
            nullable = false,
            unique = true
    )
    private Student student;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime usedAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public void replaceToken(
            String newTokenHash,
            LocalDateTime newExpiry
    ) {
        this.tokenHash = newTokenHash;
        this.expiresAt = newExpiry;
        this.usedAt = null;
    }

    public boolean isUsed() {
        return usedAt != null;
    }
}
