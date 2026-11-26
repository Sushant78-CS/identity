package com.identity.backend.verification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            SELECT COUNT(log)
            FROM StudentVerificationLog log
            WHERE log.college.id = :collegeId
            AND log.verifiedAt >= :start
            AND log.verifiedAt < :end
            """)
    long countByCollegeAndVerifiedAtRange(
            @Param("collegeId") Long collegeId,
            @Param("start") Instant start,
            @Param("end") Instant end
    );
}