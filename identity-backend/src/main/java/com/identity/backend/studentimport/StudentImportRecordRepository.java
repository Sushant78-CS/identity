package com.identity.backend.studentimport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentImportRecordRepository
        extends JpaRepository<StudentImportRecord, Long> {

    List<StudentImportRecord> findAllByBatchIdOrderByRowNumber(
            Long batchId
    );

    List<StudentImportRecord> findAllByBatchIdAndValidTrueAndImportedFalse(
            Long batchId
    );

    long countByBatchIdAndValidTrue(Long batchId);

    long countByBatchIdAndValidFalse(Long batchId);

    boolean existsByBatchIdAndImportedTrue(Long batchId);
}
