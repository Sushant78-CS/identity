package com.identity.backend.studentimport;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentImportRepository
        extends JpaRepository<StudentImportBatch, Long> {

    List<StudentImportBatch> findAllByCollegeIdOrderByCreatedAtDesc(
            Long collegeId
    );

    Optional<StudentImportBatch> findByIdAndCollegeId(
            Long id,
            Long collegeId
    );


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
                SELECT b
                FROM StudentImportBatch b
                WHERE b.id = :batchId
                  AND b.college.id = :collegeId
            """)
    Optional<StudentImportBatch> findByIdAndCollegeIdForUpdate(
            @Param("batchId") Long batchId,
            @Param("collegeId") Long collegeId
    );

}
