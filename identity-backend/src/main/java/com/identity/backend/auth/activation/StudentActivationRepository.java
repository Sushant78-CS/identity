package com.identity.backend.auth.activation;
import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentActivationRepository
        extends JpaRepository<StudentActivationToken, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT t
        FROM StudentActivationToken t
        WHERE t.tokenHash = :tokenHash
    """)
    Optional<StudentActivationToken> findByTokenHashForUpdate(
            @Param("tokenHash") String tokenHash
    );

    Optional<StudentActivationToken> findByStudentId(Long studentId);

    boolean existsByStudentId(Long studentId);
}
