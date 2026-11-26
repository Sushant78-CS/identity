package com.identity.backend.collegeadmin;
import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.college.College;
import com.identity.backend.college.CollegeRepository;
import com.identity.backend.college.CollegeStatus;
import com.identity.backend.collegeadmin.dto.CollegeAdminDashboardResponse;
import com.identity.backend.collegeadmin.dto.CollegeAdminProfileResponse;
import com.identity.backend.collegeadmin.dto.CollegeAdminResponse;
import com.identity.backend.collegeadmin.dto.CreateCollegeAdminRequest;
import com.identity.backend.course.CourseRepository;
import com.identity.backend.department.DepartmentRepository;
import com.identity.backend.student.StudentRepository;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.User;
import com.identity.backend.user.UserRepository;
import com.identity.backend.user.UserRole;
import com.identity.backend.verification.StudentVerificationLogRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CollegeAdminService {

    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final StudentVerificationLogRepository verificationLogRepository;

    @Transactional
    public CollegeAdminResponse createCollegeAdmin(
            Long collegeId,
            CreateCollegeAdminRequest request
    ) {
        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "College not found"
                ));

        if (college.getStatus() != CollegeStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "College must be active before an admin can be assigned"
            );
        }

        String email = request.email().trim().toLowerCase();
        String fullName = request.fullName().trim();

        String phoneNumber = request.phoneNumber() == null
                || request.phoneNumber().isBlank()
                ? null
                : request.phoneNumber().trim();

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists"
            );
        }

        if (phoneNumber != null
                && userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this phone number already exists"
            );
        }

        User admin = User.builder()
                .fullName(fullName)
                .email(email)
                .phoneNumber(phoneNumber)
                .passwordHash(passwordEncoder.encode(
                        request.initialPassword()
                ))
                .role(UserRole.COLLEGE_ADMIN)
                .status(AccountStatus.ACTIVE)
                .college(college)
                .build();

        User savedAdmin = userRepository.save(admin);

        return mapToResponse(savedAdmin);
    }


    @Transactional(readOnly = true)
    public CollegeAdminProfileResponse getProfile(
            AuthenticatedUser authenticatedUser
    ) {
        if (authenticatedUser.role() != UserRole.COLLEGE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only college admins can access this profile"
            );
        }

        User admin = userRepository.findById(authenticatedUser.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "College admin not found"
                ));

        if (admin.getRole() != UserRole.COLLEGE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid college admin account"
            );
        }

        if (admin.getCollege() == null) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "College is not assigned to this admin"
            );
        }

        College college = admin.getCollege();

        CollegeAdminProfileResponse.CollegeInfo collegeInfo =
                new CollegeAdminProfileResponse.CollegeInfo(
                        college.getId(),
                        college.getCode(),
                        college.getName(),
                        college.getAddress(),
                        college.getCity(),
                        college.getState(),
                        college.getCountry(),
                        college.getOfficialEmail(),
                        college.getContactNumber(),
                        college.getWebsiteUrl(),
                        college.getStatus().name()
                );

        return new CollegeAdminProfileResponse(
                admin.getId(),
                admin.getFullName(),
                admin.getEmail(),
                admin.getPhoneNumber(),
                admin.getRole().name(),
                admin.getStatus().name(),
                admin.getCreatedAt(),
                collegeInfo
        );
    }


    @Transactional(readOnly = true)
    public CollegeAdminDashboardResponse getDashboard(
            AuthenticatedUser authenticatedUser
    ) {
        if (authenticatedUser.role() != UserRole.COLLEGE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only college admins can access the dashboard"
            );
        }

        Long collegeId = authenticatedUser.collegeId();

        if (collegeId == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "No college is assigned to this admin"
            );
        }

        User admin = userRepository.findById(authenticatedUser.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "College admin not found"
                ));

        if (admin.getRole() != UserRole.COLLEGE_ADMIN
                || admin.getStatus() != AccountStatus.ACTIVE
                || admin.getCollege() == null
                || !admin.getCollege().getId().equals(collegeId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid or inactive college admin account"
            );
        }

        long totalStudents =
                studentRepository.countByCollegeId(collegeId);

        long activeStudents =
                studentRepository.countByCollegeAndUserStatus(
                        collegeId,
                        AccountStatus.ACTIVE
                );

        long totalStaff =
                userRepository.countByCollegeIdAndRole(
                        collegeId,
                        UserRole.STAFF
                );

        long activeStaff =
                userRepository.countByCollegeIdAndRoleAndStatus(
                        collegeId,
                        UserRole.STAFF,
                        AccountStatus.ACTIVE
                );

        long totalDepartments =
                departmentRepository.countByCollegeId(collegeId);

        List<Long> departmentIds =
                departmentRepository.findAllByCollegeId(collegeId)
                        .stream()
                        .map(department -> department.getId())
                        .toList();

        long totalCourses = departmentIds.isEmpty()
                ? 0
                : courseRepository.countByDepartmentIdIn(departmentIds);

        ZoneId zoneId = ZoneId.of("Asia/Kolkata");

        LocalDate today = LocalDate.now(zoneId);

        Instant startOfDay = today.atStartOfDay(zoneId).toInstant();
        Instant startOfNextDay = today.plusDays(1)
                .atStartOfDay(zoneId)
                .toInstant();

        long todayVerifications =
                verificationLogRepository.countByCollegeAndVerifiedAtRange(
                        collegeId,
                        startOfDay,
                        startOfNextDay
                );

        return new CollegeAdminDashboardResponse(
                totalStudents,
                activeStudents,
                totalStaff,
                activeStaff,
                totalDepartments,
                totalCourses,
                todayVerifications
        );
    }

    private CollegeAdminResponse mapToResponse(User user) {
        return new CollegeAdminResponse(
                user.getId(),
                user.getCollege().getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getRole().name(),
                user.getStatus().name(),
                user.getCreatedAt()
        );
    }
}
