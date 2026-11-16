package com.identity.backend.student;

import com.identity.backend.enrollment.EnrollmentStatus;
import com.identity.backend.enrollment.StudentEnrollment;
import com.identity.backend.enrollment.StudentEnrollmentRepository;
import com.identity.backend.student.dto.StudentProfileResponse;
import com.identity.backend.student.dto.StudentProfileResponse.CollegeInfo;
import com.identity.backend.student.dto.StudentProfileResponse.EnrollmentInfo;
import com.identity.backend.user.User;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class StudentProfileService {

    private final StudentRepository studentRepository;
    private final StudentEnrollmentRepository enrollmentRepository;

    @Transactional(readOnly = true)
    public StudentProfileResponse getProfile(Long userId) {

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student profile not found"
                ));

        User user = student.getUser();

        CollegeInfo collegeInfo = new CollegeInfo(
                student.getCollege().getId(),
                student.getCollege().getCode(),
                student.getCollege().getName()
        );

        EnrollmentInfo enrollmentInfo = enrollmentRepository
                .findFirstByStudent_IdAndStatusOrderByCreatedAtDesc(
                        student.getId(),
                        EnrollmentStatus.ACTIVE
                )
                .map(this::mapEnrollment)
                .orElse(null);

        return new StudentProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getStatus().name(),
                student.getStudentId(),
                student.getAdmissionYear(),
                collegeInfo,
                enrollmentInfo
        );
    }

    private EnrollmentInfo mapEnrollment(
            StudentEnrollment enrollment
    ) {
        return new EnrollmentInfo(
                enrollment.getAcademicYear(),
                enrollment.getSemester(),
                enrollment.getDepartment().getName(),
                enrollment.getCourse().getName(),
                enrollment.getStatus().name()
        );
    }
}