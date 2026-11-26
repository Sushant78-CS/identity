package com.identity.backend.course;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findAllByDepartmentId(Long departmentId);

    List<Course> findAllByDepartmentIdAndActiveTrue(Long departmentId);

    Optional<Course> findByIdAndDepartmentId(
            Long id,
            Long departmentId
    );

    boolean existsByCodeAndDepartmentId(
            String code,
            Long departmentId
    );

    boolean existsByNameIgnoreCaseAndDepartmentId(
            String name,
            Long departmentId
    );

    List<Course> findAllByDepartmentIdIn(
            Collection<Long> departmentIds
    );

    Optional<Course> findByCodeAndDepartmentId(
            String code,
            Long departmentId
    );

    Optional<Course> findByNameIgnoreCaseAndDepartmentId(
            String name,
            Long departmentId
    );

    long countByDepartmentIdIn(Collection<Long> departmentIds);
}
