package com.identity.backend.enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentEnrollmentRepository
        extends JpaRepository<StudentEnrollment, Long> {

    List<StudentEnrollment> findAllByStudentId(Long studentId);

    Optional<StudentEnrollment> findByIdAndStudentId(
            Long id,
            Long studentId
    );

    List<StudentEnrollment> findAllByCollegeId(Long collegeId);

    List<StudentEnrollment> findAllByStudentIdAndStatus(
            Long studentId,
            EnrollmentStatus status
    );

    Optional<StudentEnrollment> findFirstByStudentIdAndStatus(
            Long studentId,
            EnrollmentStatus status
    );

    boolean existsByStudentIdAndAcademicYearAndSemester(
            Long studentId,
            Integer academicYear,
            Integer semester
    );
}
