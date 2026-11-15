package com.identity.backend.collegeadmin;
import com.identity.backend.college.College;
import com.identity.backend.college.CollegeRepository;
import com.identity.backend.college.CollegeStatus;
import com.identity.backend.collegeadmin.dto.CollegeAdminResponse;
import com.identity.backend.collegeadmin.dto.CreateCollegeAdminRequest;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.User;
import com.identity.backend.user.UserRepository;
import com.identity.backend.user.UserRole;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CollegeAdminService {

    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;

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
