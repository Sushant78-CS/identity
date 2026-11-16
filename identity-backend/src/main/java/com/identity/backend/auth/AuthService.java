
package com.identity.backend.auth;

import com.identity.backend.auth.dto.AdminLoginRequest;
import com.identity.backend.auth.dto.LoginResponse;
import com.identity.backend.auth.dto.RefreshTokenRotation;
import com.identity.backend.auth.dto.StudentLoginRequest;
import com.identity.backend.college.College;
import com.identity.backend.college.CollegeRepository;
import com.identity.backend.student.Student;
import com.identity.backend.student.StudentRepository;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.User;
import com.identity.backend.user.UserRepository;
import com.identity.backend.user.UserRole;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public LoginResponse studentLogin(StudentLoginRequest request) {

        College college = collegeRepository
                .findByCode(request.collegeCode().trim())
                .orElseThrow(this::invalidCredentials);

        Student student = studentRepository
                .findByStudentIdAndCollegeId(
                        request.studentId().trim(),
                        college.getId()
                )
                .orElseThrow(this::invalidCredentials);

        User user = student.getUser();

        if (user.getRole() != UserRole.STUDENT) {
            throw invalidCredentials();
        }

        return authenticate(user, request.password(), college.getId());
    }

    @Transactional
    public LoginResponse adminLogin(AdminLoginRequest request) {

        User user = userRepository
                .findByEmail(request.email().trim().toLowerCase())
                .orElseThrow(this::invalidCredentials);

        if (user.getRole() != UserRole.COLLEGE_ADMIN
                && user.getRole() != UserRole.STAFF
                && user.getRole() != UserRole.SUPER_ADMIN) {
            throw invalidCredentials();
        }

        Long collegeId = user.getCollege() != null
                ? user.getCollege().getId()
                : null;

        return authenticate(user, request.password(), collegeId);
    }

    public LoginResponse refresh(String rawRefreshToken) {

        RefreshTokenRotation rotation =
                refreshTokenService.rotateRefreshToken(rawRefreshToken);

        User user = rotation.user();

        String newAccessToken = jwtService.generateToken(
                user,
                rotation.collegeId()
        );

        return new LoginResponse(
                newAccessToken,
                rotation.refreshToken(),
                "Bearer",
                jwtService.getExpirationSeconds(),
                user.getId(),
                user.getFullName(),
                user.getRole(),
                rotation.collegeId()
        );
    }

    public void logout(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
    }

    private LoginResponse authenticate(
            User user,
            String rawPassword,
            Long collegeId
    ) {

        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw invalidCredentials();
        }

        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(
                rawPassword,
                user.getPasswordHash()
        )) {
            throw invalidCredentials();
        }

        String accessToken = jwtService.generateToken(
                user,
                collegeId
        );

        String refreshToken =
                refreshTokenService.createRefreshToken(user);

        return new LoginResponse(
                accessToken,
                refreshToken,
                "Bearer",
                jwtService.getExpirationSeconds(),
                user.getId(),
                user.getFullName(),
                user.getRole(),
                collegeId
        );
    }

    private BadCredentialsException invalidCredentials() {
        return new BadCredentialsException(
                "Invalid login credentials"
        );
    }
}
