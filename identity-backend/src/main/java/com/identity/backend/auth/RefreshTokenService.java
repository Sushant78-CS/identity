package com.identity.backend.auth;

import com.identity.backend.auth.dto.RefreshTokenRotation;
import com.identity.backend.student.Student;
import com.identity.backend.student.StudentRepository;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.User;
import com.identity.backend.user.UserRole;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

import java.time.Instant;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final StudentRepository studentRepository;

    @Value("${app.security.refresh-token.expiration-seconds:604800}")
    private long refreshTokenExpirationSeconds;

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public String createRefreshToken(User user) {

        String rawToken = generateRawToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .tokenHash(hashToken(rawToken))
                .expiresAt(
                        Instant.now().plusSeconds(
                                refreshTokenExpirationSeconds
                        )
                )
                .build();

        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    @Transactional
    public RefreshTokenRotation rotateRefreshToken(String rawToken) {

        if (rawToken == null || rawToken.isBlank()) {
            throw invalidRefreshToken();
        }

        String tokenHash = hashToken(rawToken);

        RefreshToken oldToken = refreshTokenRepository
                .findByTokenHashForUpdate(tokenHash)
                .orElseThrow(this::invalidRefreshToken);

        if (oldToken.isRevoked() || oldToken.isExpired()) {
            throw invalidRefreshToken();
        }

        User user = oldToken.getUser();

        if (user.getStatus() != AccountStatus.ACTIVE) {
            oldToken.setRevokedAt(Instant.now());
            throw invalidRefreshToken();
        }

        // Revoke the old token.
        oldToken.setRevokedAt(Instant.now());

        // Resolve college ID correctly for each role.
        Long collegeId = resolveCollegeId(user);

        // Generate a completely new refresh token.
        String newRefreshToken = createRefreshToken(user);

        return new RefreshTokenRotation(
                user,
                collegeId,
                newRefreshToken
        );
    }

    @Transactional
    public void revokeRefreshToken(String rawToken) {

        if (rawToken == null || rawToken.isBlank()) {
            return;
        }

        String tokenHash = hashToken(rawToken);

        refreshTokenRepository
                .findByTokenHashForUpdate(tokenHash)
                .ifPresent(token -> {
                    if (!token.isRevoked()) {
                        token.setRevokedAt(Instant.now());
                    }
                });
    }

    private Long resolveCollegeId(User user) {

        if (user.getRole() == UserRole.STUDENT) {

            Student student = studentRepository
                    .findByUserId(user.getId())
                    .orElseThrow(this::invalidRefreshToken);

            return student.getCollege().getId();
        }

        return user.getCollege() != null
                ? user.getCollege().getId()
                : null;
    }

    private String generateRawToken() {

        byte[] randomBytes = new byte[64];

        secureRandom.nextBytes(randomBytes);

        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(randomBytes);
    }

    private String hashToken(String token) {

        try {
            MessageDigest digest =
                    MessageDigest.getInstance("SHA-256");

            byte[] hash = digest.digest(
                    token.getBytes(java.nio.charset.StandardCharsets.UTF_8)
            );

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(hash);

        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException(
                    "SHA-256 algorithm is unavailable",
                    exception
            );
        }
    }

    private BadCredentialsException invalidRefreshToken() {
        return new BadCredentialsException(
                "Invalid or expired refresh token"
        );
    }
}