package com.identity.backend.auth;
import com.identity.backend.student.Student;
import com.identity.backend.student.StudentRepository;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.User;
import com.identity.backend.user.UserRepository;
import com.identity.backend.user.UserRole;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    public CurrentUserService(
            UserRepository userRepository,
            StudentRepository studentRepository
    ) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
    }

    @Transactional(readOnly = true)
    public IdentityPrincipal getCurrentUser(
            JwtAuthenticationToken authentication
    ) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationCredentialsNotFoundException(
                    "User is not authenticated"
            );
        }

        Long userId;

        try {
            userId = Long.valueOf(
                    authentication.getToken().getSubject()
            );
        } catch (NumberFormatException exception) {
            throw new AuthenticationCredentialsNotFoundException(
                    "Invalid authentication subject"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new AuthenticationCredentialsNotFoundException(
                                "User account not found"
                        )
                );

        if (user.getStatus() != AccountStatus.ACTIVE) {
            throw new AuthenticationCredentialsNotFoundException(
                    "User account is not active"
            );
        }

        Long collegeId;

        if (user.getRole() == UserRole.STUDENT) {

            Student student = studentRepository.findByUserId(userId)
                    .orElseThrow(() ->
                            new AuthenticationCredentialsNotFoundException(
                                    "Student profile not found"
                            )
                    );

            collegeId = student.getCollege().getId();

        } else {

            collegeId = user.getCollege() != null
                    ? user.getCollege().getId()
                    : null;
        }

        return new IdentityPrincipal(
                user.getId(),
                collegeId,
                user.getRole()
        );
    }
}
