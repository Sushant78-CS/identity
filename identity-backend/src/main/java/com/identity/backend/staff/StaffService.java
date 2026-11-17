package com.identity.backend.staff;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.college.College;
import com.identity.backend.college.CollegeRepository;
import com.identity.backend.college.CollegeStatus;
import com.identity.backend.staff.dto.CreateStaffRequest;
import com.identity.backend.staff.dto.StaffResponse;
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
public class StaffService {

    private final UserRepository userRepository;
    private final CollegeRepository collegeRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StaffResponse createStaff(
            AuthenticatedUser authenticatedUser,
            CreateStaffRequest request
    ) {
        if (authenticatedUser.role() != UserRole.COLLEGE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only college administrators can create staff accounts"
            );
        }

        Long collegeId = authenticatedUser.collegeId();

        if (collegeId == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is not associated with a college"
            );
        }

        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "College not found"
                ));

        if (college.getStatus() != CollegeStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "College must be active to create staff accounts"
            );
        }

        String fullName = request.fullName().trim();
        String email = request.email().trim().toLowerCase();

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

        User staff = User.builder()
                .fullName(fullName)
                .email(email)
                .phoneNumber(phoneNumber)
                .passwordHash(passwordEncoder.encode(
                        request.initialPassword()
                ))
                .role(UserRole.STAFF)
                .status(AccountStatus.ACTIVE)
                .college(college)
                .build();

        User savedStaff = userRepository.save(staff);

        return mapToResponse(savedStaff);
    }

    private StaffResponse mapToResponse(User user) {
        return new StaffResponse(
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