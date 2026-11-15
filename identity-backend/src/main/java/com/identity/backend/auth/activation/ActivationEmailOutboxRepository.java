package com.identity.backend.auth.activation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ActivationEmailOutboxRepository
        extends JpaRepository<ActivationEmailOutbox, Long> {

    @Query(value = """
    SELECT *
    FROM activation_email_outbox
    WHERE status = 'PENDING'
      AND (next_attempt_at IS NULL OR next_attempt_at <= :now)
    ORDER BY created_at ASC
    LIMIT 50
    FOR UPDATE SKIP LOCKED
    """, nativeQuery = true)
    List<ActivationEmailOutbox> claimPendingEmails(
            @Param("now") LocalDateTime now
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ActivationEmailOutbox> findByIdAndClaimToken(
            Long id,
            String claimToken
    );

    @Modifying
    @Query(value = """
        UPDATE activation_email_outbox
        SET attempts = attempts + 1,
            status = CASE
                WHEN attempts + 1 >= 5 THEN 'FAILED'
                ELSE 'PENDING'
            END,
            claimed_at = NULL,
            claim_token = NULL,
            next_attempt_at = CASE
                WHEN attempts + 1 >= 5 THEN NULL
                ELSE CURRENT_TIMESTAMP
                     + (POWER(2, attempts) * INTERVAL '1 minute')
            END,
            last_error = 'Previous processing attempt was interrupted'
        WHERE status = 'PROCESSING'
          AND claimed_at < :cutoff
        """, nativeQuery = true)
    int recoverStaleProcessingEmails(
            @Param("cutoff") LocalDateTime cutoff
    );
}
