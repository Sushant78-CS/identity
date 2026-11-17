package com.identity.backend.credential;

import com.identity.backend.credential.dto.StudentQrResponse;
import com.identity.backend.student.Student;
import com.identity.backend.student.StudentRepository;

import com.identity.backend.user.AccountStatus;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class StudentQrService {

    private final StudentRepository studentRepository;
    private final StudentQrCredentialRepository credentialRepository;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.security.qr.expiration-seconds:60}")
    private long expirationSeconds;

    @Transactional
    public StudentQrResponse generateQr(Long userId) {

        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student profile not found"
                ));

        if (student.getUser().getStatus() != AccountStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is not active"
            );
        }

        String rawToken = generateToken();

        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plusSeconds(expirationSeconds);

        StudentQrCredential credential = StudentQrCredential.builder()
                .student(student)
                .tokenHash(hashToken(rawToken))
                .expiresAt(expiresAt)
                .build();

        credentialRepository.save(credential);

        return new StudentQrResponse(
                rawToken,
                issuedAt,
                expiresAt,
                expirationSeconds
        );
    }

    private String generateToken() {

        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private String hashToken(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(StandardCharsets.UTF_8)
            );

            return java.util.HexFormat.of().formatHex(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 algorithm unavailable",
                    exception
            );
        }
    }
}