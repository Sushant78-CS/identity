package com.identity.backend.student;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.enrollment.EnrollmentStatus;
import com.identity.backend.enrollment.StudentEnrollmentRepository;
import com.identity.backend.student.dto.StudentDetailsResponse;
import com.identity.backend.student.dto.StudentListResponse;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.User;
import com.identity.backend.user.UserRepository;
import com.identity.backend.user.UserRole;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final StudentEnrollmentRepository studentEnrollmentRepository;

    @Transactional(readOnly = true)
    public Page<StudentListResponse> getAllStudents(
            AuthenticatedUser authenticatedUser,
            int page,
            int size,
            String search,
            AccountStatus status
    ) {

        if (authenticatedUser.role() != UserRole.COLLEGE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only college administrators can view students"
            );
        }

        Long collegeId = authenticatedUser.collegeId();

        if (collegeId == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "College not assigned to administrator"
            );
        }

        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid pagination parameters"
            );
        }

        User admin = userRepository.findById(authenticatedUser.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Administrator account not found"
                ));

        if (admin.getRole() != UserRole.COLLEGE_ADMIN
                || admin.getStatus() != AccountStatus.ACTIVE
                || admin.getCollege() == null
                || !admin.getCollege().getId().equals(collegeId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator account is not authorized"
            );
        }

        String normalizedSearch = search == null
                ? ""
                : search.trim();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.unsorted()
        );

        return studentRepository.searchStudents(
                collegeId,
                normalizedSearch,
                status,
                pageable
        );
    }

    @Transactional(readOnly = true)
    public StudentDetailsResponse getStudentById(
            AuthenticatedUser authenticatedUser,
            Long studentId
    ) {
        if (authenticatedUser.role() != UserRole.COLLEGE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only college administrators can view student details"
            );
        }

        Long collegeId = authenticatedUser.collegeId();

        if (collegeId == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "College not assigned to administrator"
            );
        }

        User admin = userRepository.findById(authenticatedUser.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Administrator account not found"
                ));

        if (admin.getRole() != UserRole.COLLEGE_ADMIN
                || admin.getStatus() != AccountStatus.ACTIVE
                || admin.getCollege() == null
                || !admin.getCollege().getId().equals(collegeId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator account is not authorized"
            );
        }

        Student student = studentRepository
                .findByIdAndCollegeId(studentId, collegeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student not found"
                ));

        StudentDetailsResponse.CurrentEnrollment currentEnrollment =
                studentEnrollmentRepository
                        .findFirstByStudent_IdAndStatusOrderByCreatedAtDesc(
                                student.getId(),
                                EnrollmentStatus.ACTIVE
                        )
                        .map(enrollment ->
                                new StudentDetailsResponse.CurrentEnrollment(
                                        enrollment.getId(),
                                        enrollment.getDepartment().getName(),
                                        enrollment.getCourse().getName(),
                                        enrollment.getAcademicYear(),
                                        enrollment.getSemester(),
                                        enrollment.getAdmissionYear(),
                                        enrollment.getStatus().name(),
                                        enrollment.getStartDate() == null
                                                ? null
                                                : enrollment.getStartDate().toString(),
                                        enrollment.getEndDate() == null
                                                ? null
                                                : enrollment.getEndDate().toString()
                                )
                        )
                        .orElse(null);

        return new StudentDetailsResponse(
                student.getId(),
                student.getStudentId(),
                student.getUser().getFullName(),
                student.getUser().getEmail(),
                student.getUser().getPhoneNumber(),
                student.getUser().getStatus().name(),
                student.getAdmissionYear(),
                student.getProfileImageUrl(),
                student.getCreatedAt(),
                student.getUpdatedAt(),
                currentEnrollment
        );
    }
}