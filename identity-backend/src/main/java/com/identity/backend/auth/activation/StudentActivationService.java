package com.identity.backend.auth.activation;
import com.identity.backend.auth.activation.dto.ActivateStudentRequest;
import com.identity.backend.auth.activation.dto.ActivationResponse;
import com.identity.backend.student.Student;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.User;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
public class StudentActivationService {

    private final StudentActivationRepository activationRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivationEmailOutboxRepository outboxRepository;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Value("${app.frontend.activation-url}")
    private String activationUrl;

    public StudentActivationService(
            StudentActivationRepository activationRepository,
            ActivationEmailOutboxRepository outboxRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.activationRepository = activationRepository;
        this.outboxRepository = outboxRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ActivationResponse activateStudent(
            ActivateStudentRequest request
    ) {

        String tokenHash = hashToken(request.token());

        StudentActivationToken activationToken =
                activationRepository.findByTokenHashForUpdate(tokenHash)
                        .orElseThrow(this::invalidToken);

        if (activationToken.isUsed()
                || activationToken.isExpired()) {
            throw invalidToken();
        }

        Student student = activationToken.getStudent();
        User user = student.getUser();

        if (user.getStatus() != AccountStatus.PENDING_ACTIVATION
                || user.getPasswordHash() != null) {
            throw invalidToken();
        }

        user.setPasswordHash(
                passwordEncoder.encode(request.password())
        );

        user.setStatus(AccountStatus.ACTIVE);

        activationToken.setUsedAt(LocalDateTime.now());

        return new ActivationResponse(
                "Student account activated successfully"
        );
    }


    @Transactional
    public void createActivationForStudent(Student student) {

        User user = student.getUser();

        // Email is optional in the current student import design.
        // Students without an email need an admin-assisted activation flow.
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }

        byte[] randomBytes = new byte[32];
        SECURE_RANDOM.nextBytes(randomBytes);

        String rawToken = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);

        String tokenHash = hashToken(rawToken);

        LocalDateTime expiry = LocalDateTime.now().plus(24, ChronoUnit.HOURS);

        StudentActivationToken activationToken =
                activationRepository.findByStudentId(student.getId())
                        .orElseGet(() -> StudentActivationToken.builder()
                                .student(student)
                                .build());

        activationToken.replaceToken(tokenHash, expiry);

        activationRepository.save(activationToken);

        String link = activationUrl + "?token=" + rawToken;

        String emailBody = """
            Hello %s,

            Your student account has been created.

            Use the following link to activate your Identity account
            and set your password:

            %s

            This link expires in 24 hours.

            If you did not expect this email, please contact your college administrator.
            """.formatted(user.getFullName(), link);

        ActivationEmailOutbox email = ActivationEmailOutbox.builder()
                .recipient(user.getEmail())
                .subject("Activate your Identity student account")
                .body(emailBody)
                .status("PENDING")
                .attempts(0)
                .build();

        outboxRepository.save(email);
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
                    "SHA-256 algorithm is unavailable",
                    exception
            );
        }
    }

    private BadCredentialsException invalidToken() {
        return new BadCredentialsException(
                "Invalid or expired activation token"
        );
    }
}
