package com.identity.backend.verification;

import com.identity.backend.credential.StudentQrCredential;
import com.identity.backend.credential.StudentQrCredentialRepository;
import com.identity.backend.enrollment.EnrollmentStatus;
import com.identity.backend.enrollment.StudentEnrollment;
import com.identity.backend.enrollment.StudentEnrollmentRepository;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.User;
import com.identity.backend.user.UserRepository;
import com.identity.backend.user.UserRole;
import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.verification.dto.DailyVerificationHistoryResponse;
import com.identity.backend.verification.dto.StudentVerificationResponse;
import com.identity.backend.verification.dto.StudentVerificationResponse.StudentInfo;
import com.identity.backend.verification.dto.VerificationHistoryItemResponse;
import com.identity.backend.verification.dto.VerificationHistorySummaryResponse;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.HexFormat;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentVerificationService {

    private final StudentQrCredentialRepository credentialRepository;
    private final StudentEnrollmentRepository enrollmentRepository;
    private final StudentVerificationLogRepository logRepository;
    private final UserRepository userRepository;

    private static final ZoneId BUSINESS_ZONE =
            ZoneId.of("Asia/Kolkata");

    @Transactional
    public StudentVerificationResponse verifyQr(
            String rawToken,
            AuthenticatedUser authenticatedUser
    ) {

        validateStaff(authenticatedUser);

        String tokenHash = hashToken(rawToken);

        StudentQrCredential credential = credentialRepository
                .findByTokenHashForUpdate(tokenHash)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invalid QR credential"
                ));

        if (credential.isConsumed()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "QR credential has already been used"
            );
        }

        if (credential.isExpired()) {
            throw new ResponseStatusException(
                    HttpStatus.GONE,
                    "QR credential has expired"
            );
        }

        var student = credential.getStudent();

        if (student.getUser().getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Student account is not active"
            );
        }

        // College-level isolation.
        if (authenticatedUser.role() != UserRole.SUPER_ADMIN
                && !student.getCollege().getId().equals(
                authenticatedUser.collegeId()
        )) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You cannot verify students from another college"
            );
        }

        Instant verifiedAt = Instant.now();

        // Consume the credential before returning success.
        credential.setConsumedAt(verifiedAt);

        StudentEnrollment enrollment = enrollmentRepository
                .findFirstByStudent_IdAndStatusOrderByCreatedAtDesc(
                        student.getId(),
                        EnrollmentStatus.ACTIVE
                )
                .orElse(null);

        StudentInfo studentInfo = new StudentInfo(
                student.getStudentId(),
                student.getUser().getFullName(),
                student.getProfileImageUrl(),
                student.getCollege().getName(),
                enrollment != null
                        ? enrollment.getDepartment().getName()
                        : null,
                enrollment != null
                        ? enrollment.getCourse().getName()
                        : null
        );

        User staffUser = userRepository.findById(authenticatedUser.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Verifier account not found"
                ));

        StudentVerificationLog verificationLog = StudentVerificationLog.builder()
                .staffUser(staffUser)
                .student(student)
                .college(student.getCollege())
                .verifiedAt(verifiedAt)
                .build();

        logRepository.save(verificationLog);

        return new StudentVerificationResponse(
                true,
                "Student identity verified",
                verifiedAt,
                studentInfo
        );
    }

    @Transactional(readOnly = true)
    public VerificationHistorySummaryResponse getVerificationSummary(
            AuthenticatedUser authenticatedUser
    ) {
        validateStaffHistoryAccess(authenticatedUser);

        LocalDate today = LocalDate.now(BUSINESS_ZONE);

        Instant start = today.atStartOfDay(BUSINESS_ZONE).toInstant();
        Instant end = today.plusDays(1)
                .atStartOfDay(BUSINESS_ZONE)
                .toInstant();

        long total = logRepository.countByStaffUser_Id(
                authenticatedUser.userId()
        );

        long todayCount = logRepository
                .countByStaffUser_IdAndVerifiedAtGreaterThanEqualAndVerifiedAtLessThan(
                        authenticatedUser.userId(),
                        start,
                        end
                );

        return new VerificationHistorySummaryResponse(
                total,
                todayCount,
                today
        );
    }

    @Transactional(readOnly = true)
    public DailyVerificationHistoryResponse getDailyVerificationHistory(
            AuthenticatedUser authenticatedUser,
            LocalDate date
    ) {
        validateStaffHistoryAccess(authenticatedUser);

        Instant start = date.atStartOfDay(BUSINESS_ZONE).toInstant();
        Instant end = date.plusDays(1)
                .atStartOfDay(BUSINESS_ZONE)
                .toInstant();

        List<StudentVerificationLog> logs = logRepository
                .findAllByStaffUser_IdAndVerifiedAtGreaterThanEqualAndVerifiedAtLessThanOrderByVerifiedAtDesc(
                        authenticatedUser.userId(),
                        start,
                        end
                );

        List<VerificationHistoryItemResponse> items = logs.stream()
                .map(log -> new VerificationHistoryItemResponse(
                        log.getId(),
                        log.getStudent().getStudentId(),
                        log.getStudent().getUser().getFullName(),
                        log.getVerifiedAt()
                ))
                .toList();

        return new DailyVerificationHistoryResponse(
                date,
                items.size(),
                items
        );
    }

    private void validateStaff(AuthenticatedUser authenticatedUser) {

        if (authenticatedUser == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        UserRole role = authenticatedUser.role();

        if (role != UserRole.STAFF
                && role != UserRole.COLLEGE_ADMIN
                && role != UserRole.SUPER_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not authorized to verify student identities"
            );
        }

        if (role != UserRole.SUPER_ADMIN
                && authenticatedUser.collegeId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is not associated with a college"
            );
        }
    }

    private void validateStaffHistoryAccess(
            AuthenticatedUser authenticatedUser
    ) {
        if (authenticatedUser == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication required"
            );
        }

        if (authenticatedUser.role() != UserRole.STAFF) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only staff members can access their verification history"
            );
        }
    }

    private String hashToken(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 algorithm unavailable",
                    exception
            );
        }
    }
}