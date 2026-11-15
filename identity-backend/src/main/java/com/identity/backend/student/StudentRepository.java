package com.identity.backend.student;
import org.springframework.data.jpa.repository.JpaRepository;
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
}
