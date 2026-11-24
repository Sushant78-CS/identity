package com.identity.backend.verification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface StudentVerificationLogRepository
        extends JpaRepository<StudentVerificationLog, Long> {

    long countByStaffUser_Id(Long staffUserId);

    long countByStaffUser_IdAndVerifiedAtGreaterThanEqualAndVerifiedAtLessThan(
            Long staffUserId,
            Instant start,
            Instant end
    );

    List<StudentVerificationLog>
    findAllByStaffUser_IdAndVerifiedAtGreaterThanEqualAndVerifiedAtLessThanOrderByVerifiedAtDesc(
            Long staffUserId,
            Instant start,
            Instant end
    );
}