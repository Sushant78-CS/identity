package com.identity.backend.credential;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentQrCredentialRepository
        extends JpaRepository<StudentQrCredential, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT credential
            FROM StudentQrCredential credential
            JOIN FETCH credential.student student
            JOIN FETCH student.user
            JOIN FETCH student.college
            WHERE credential.tokenHash = :tokenHash
            """)
    Optional<StudentQrCredential> findByTokenHashForUpdate(
            @Param("tokenHash") String tokenHash
    );
}