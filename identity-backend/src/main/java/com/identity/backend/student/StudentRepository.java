package com.identity.backend.student;
import com.identity.backend.student.dto.StudentListResponse;
import com.identity.backend.user.AccountStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentIdAndCollegeId(
            String studentId,
            Long collegeId
    );

    Optional<Student> findByUserId(Long userId);

    List<Student> findAllByCollegeId(Long collegeId);

    boolean existsByStudentIdAndCollegeId(
            String studentId,
            Long collegeId
    );

    boolean existsByUserId(Long userId);

    long countByCollegeId(Long collegeId);

    @Query("""
        SELECT COUNT(s)
        FROM Student s
        WHERE s.college.id = :collegeId
        AND s.user.status = :status
        """)
    long countByCollegeAndUserStatus(
            @Param("collegeId") Long collegeId,
            @Param("status") AccountStatus status
    );

    @Query(
            value = """
        SELECT new com.identity.backend.student.dto.StudentListResponse(
            s.id,
            s.studentId,
            s.user.fullName,
            s.user.email,
            s.user.phoneNumber,
            s.admissionYear,
            CAST(s.user.status AS string),
            s.profileImageUrl,
            d.name,
            c.name,
            e.academicYear,
            e.semester,
            s.createdAt
        )
        FROM Student s
        LEFT JOIN StudentEnrollment e
            ON e.student.id = s.id
            AND e.status = com.identity.backend.enrollment.EnrollmentStatus.ACTIVE
        LEFT JOIN e.department d
        LEFT JOIN e.course c
        WHERE s.college.id = :collegeId
          AND (:status IS NULL OR s.user.status = :status)
          AND (
              :search = ''
              OR LOWER(s.studentId) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(s.user.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(s.user.email) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(COALESCE(s.user.phoneNumber, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
          )
        ORDER BY s.createdAt DESC
        """,
            countQuery = """
        SELECT COUNT(s)
        FROM Student s
        WHERE s.college.id = :collegeId
          AND (:status IS NULL OR s.user.status = :status)
          AND (
              :search = ''
              OR LOWER(s.studentId) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(s.user.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(s.user.email) LIKE LOWER(CONCAT('%', :search, '%'))
              OR LOWER(COALESCE(s.user.phoneNumber, ''))
                    LIKE LOWER(CONCAT('%', :search, '%'))
          )
        """
    )
    Page<StudentListResponse> searchStudents(
            @Param("collegeId") Long collegeId,
            @Param("search") String search,
            @Param("status") AccountStatus status,
            Pageable pageable
    );

    Optional<Student> findByIdAndCollegeId(
            Long id,
            Long collegeId
    );
}
