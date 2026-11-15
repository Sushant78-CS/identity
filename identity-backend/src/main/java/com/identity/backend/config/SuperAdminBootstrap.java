package com.identity.backend.config;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.User;
import com.identity.backend.user.UserRepository;
import com.identity.backend.user.UserRole;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class SuperAdminBootstrap {

    @Bean
    CommandLineRunner createInitialSuperAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.super-admin.email:}")
            String email,
            @Value("${app.bootstrap.super-admin.password:}")
            String password,
            @Value("${app.bootstrap.super-admin.full-name:}")
            String fullName
    ) {
        return args -> createSuperAdmin(
                userRepository,
                passwordEncoder,
                email,
                password,
                fullName
        );
    }

    @Transactional
    public void createSuperAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            String email,
            String password,
            String fullName
    ) {

        if (userRepository.existsByRole(UserRole.SUPER_ADMIN)) {
            return;
        }

        if (email.isBlank() || password.isBlank() || fullName.isBlank()) {
            throw new IllegalStateException(
                    "Initial Super Admin credentials are not configured."
            );
        }

        if (password.length() < 12) {
            throw new IllegalStateException(
                    "Initial Super Admin password must be at least 12 characters."
            );
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalStateException(
                    "The configured Super Admin email already belongs to another user."
            );
        }

        User superAdmin = User.builder()
                .email(email.trim().toLowerCase())
                .fullName(fullName.trim())
                .passwordHash(passwordEncoder.encode(password))
                .role(UserRole.SUPER_ADMIN)
                .status(AccountStatus.ACTIVE)
                .college(null)
                .build();

        userRepository.save(superAdmin);
    }
}
