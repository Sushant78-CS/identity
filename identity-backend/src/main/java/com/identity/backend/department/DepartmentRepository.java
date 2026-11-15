package com.identity.backend.department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository
        extends JpaRepository<Department, Long> {

    List<Department> findAllByCollegeId(Long collegeId);

    List<Department> findAllByCollegeIdAndActiveTrue(Long collegeId);

    Optional<Department> findByIdAndCollegeId(
            Long id,
            Long collegeId
    );

    boolean existsByCodeAndCollegeId(
            String code,
            Long collegeId
    );

    boolean existsByNameIgnoreCaseAndCollegeId(
            String name,
            Long collegeId
    );

    Optional<Department> findByCodeAndCollegeId(
            String code,
            Long collegeId
    );

    Optional<Department> findByNameIgnoreCaseAndCollegeId(
            String name,
            Long collegeId
    );
}
