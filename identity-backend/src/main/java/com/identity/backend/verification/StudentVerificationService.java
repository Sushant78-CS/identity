package com.identity.backend.verification;

import com.identity.backend.credential.StudentQrCredential;
import com.identity.backend.credential.StudentQrCredentialRepository;
import com.identity.backend.enrollment.EnrollmentStatus;
import com.identity.backend.enrollment.StudentEnrollment;
import com.identity.backend.enrollment.StudentEnrollmentRepository;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.UserRole;
import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.verification.dto.StudentVerificationResponse;
import com.identity.backend.verification.dto.StudentVerificationResponse.StudentInfo;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor
public class StudentVerificationService {

    private final StudentQrCredentialRepository credentialRepository;
    private final StudentEnrollmentRepository enrollmentRepository;

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

        return new StudentVerificationResponse(
                true,
                "Student identity verified",
                verifiedAt,
                studentInfo
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