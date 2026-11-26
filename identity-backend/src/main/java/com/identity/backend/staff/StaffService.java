package com.identity.backend.staff;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.college.College;
import com.identity.backend.college.CollegeRepository;
import com.identity.backend.college.CollegeStatus;
import com.identity.backend.staff.dto.*;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.User;
import com.identity.backend.user.UserRepository;
import com.identity.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    @Transactional(readOnly = true)
    public StaffProfileResponse getStaffProfile(
            AuthenticatedUser authenticatedUser
    ) {
        if (authenticatedUser.role() != UserRole.STAFF) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only staff members can access this profile"
            );
        }

        User staff = userRepository.findById(authenticatedUser.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Staff account not found"
                ));

        if (staff.getRole() != UserRole.STAFF) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid staff account"
            );
        }

        StaffProfileResponse.CollegeInfo collegeInfo = null;

        if (staff.getCollege() != null) {
            collegeInfo = new StaffProfileResponse.CollegeInfo(
                    staff.getCollege().getId(),
                    staff.getCollege().getCode(),
                    staff.getCollege().getName()
            );
        }

        return new StaffProfileResponse(
                staff.getId(),
                staff.getFullName(),
                staff.getEmail(),
                staff.getPhoneNumber(),
                staff.getRole().name(),
                staff.getStatus().name(),
                collegeInfo,
                staff.getCreatedAt()
        );
    }


    @Transactional(readOnly = true)
    public Page<StaffResponse> getAllStaff(
            AuthenticatedUser authenticatedUser,
            int page,
            int size,
            String search,
            AccountStatus status
    ) {
        if (authenticatedUser.role() != UserRole.COLLEGE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only college administrators can view staff"
            );
        }

        Long collegeId = authenticatedUser.collegeId();

        if (collegeId == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is not associated with a college"
            );
        }

        if (page < 0 || size < 1 || size > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Page must be non-negative and size must be between 1 and 100"
            );
        }

        User admin = userRepository.findById(authenticatedUser.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "College admin not found"
                ));

        if (admin.getRole() != UserRole.COLLEGE_ADMIN
                || admin.getStatus() != AccountStatus.ACTIVE
                || admin.getCollege() == null
                || !admin.getCollege().getId().equals(collegeId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid or inactive college admin account"
            );
        }

        String normalizedSearch =
                search == null || search.isBlank()
                        ? null
                        : search.trim();

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return userRepository.searchStaff(
                        collegeId,
                        UserRole.STAFF,
                        status,
                        normalizedSearch,
                        pageable
                )
                .map(this::mapToResponse);
    }


    @Transactional(readOnly = true)
    public StaffResponse getStaffById(
            AuthenticatedUser authenticatedUser,
            Long staffId
    ) {
        if (authenticatedUser.role() != UserRole.COLLEGE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only college administrators can view staff details"
            );
        }

        Long collegeId = authenticatedUser.collegeId();

        if (collegeId == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is not associated with a college"
            );
        }

        User admin = userRepository.findById(authenticatedUser.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "College admin not found"
                ));

        if (admin.getRole() != UserRole.COLLEGE_ADMIN
                || admin.getStatus() != AccountStatus.ACTIVE
                || admin.getCollege() == null
                || !admin.getCollege().getId().equals(collegeId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Invalid or inactive college admin account"
            );
        }

        User staff = userRepository
                .findByIdAndCollegeIdAndRole(
                        staffId,
                        collegeId,
                        UserRole.STAFF
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Staff member not found"
                ));

        return mapToResponse(staff);
    }

    @Transactional
    public StaffResponse updateStaff(
            AuthenticatedUser authenticatedUser,
            Long staffId,
            UpdateStaffRequest request
    ) {
        if (authenticatedUser.role() != UserRole.COLLEGE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only college administrators can update staff"
            );
        }

        Long collegeId = authenticatedUser.collegeId();

        if (collegeId == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "College not assigned to administrator"
            );
        }

        // Verify the administrator account
        User admin = userRepository.findById(authenticatedUser.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Administrator account not found"
                ));

        if (admin.getRole() != UserRole.COLLEGE_ADMIN
                || admin.getStatus() != AccountStatus.ACTIVE
                || admin.getCollege() == null
                || !admin.getCollege().getId().equals(collegeId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator account is not authorized"
            );
        }

        // Find staff within the administrator's college
        User staff = userRepository
                .findByIdAndCollegeIdAndRole(
                        staffId,
                        collegeId,
                        UserRole.STAFF
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Staff member not found"
                ));

        String fullName = request.fullName().trim();
        String email = request.email().trim().toLowerCase();

        String phoneNumber = request.phoneNumber() == null
                || request.phoneNumber().isBlank()
                ? null
                : request.phoneNumber().trim();

        // Check email uniqueness
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(
                email,
                staffId
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists"
            );
        }

        // Check phone uniqueness
        if (phoneNumber != null
                && userRepository.existsByPhoneNumberAndIdNot(
                phoneNumber,
                staffId
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this phone number already exists"
            );
        }

        staff.setFullName(fullName);
        staff.setEmail(email);
        staff.setPhoneNumber(phoneNumber);

        User updatedStaff = userRepository.save(staff);

        return mapToResponse(updatedStaff);
    }

    @Transactional
    public StaffResponse updateStaffStatus(
            AuthenticatedUser authenticatedUser,
            Long staffId,
            UpdateStaffStatusRequest request
    ) {
        if (authenticatedUser.role() != UserRole.COLLEGE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only college administrators can update staff status"
            );
        }

        Long collegeId = authenticatedUser.collegeId();

        if (collegeId == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "College not assigned to administrator"
            );
        }

        // Verify administrator account
        User admin = userRepository.findById(authenticatedUser.userId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Administrator account not found"
                ));

        if (admin.getRole() != UserRole.COLLEGE_ADMIN
                || admin.getStatus() != AccountStatus.ACTIVE
                || admin.getCollege() == null
                || !admin.getCollege().getId().equals(collegeId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator account is not authorized"
            );
        }

        // Find staff belonging to the administrator's college
        User staff = userRepository
                .findByIdAndCollegeIdAndRole(
                        staffId,
                        collegeId,
                        UserRole.STAFF
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Staff member not found"
                ));

        AccountStatus newStatus = request.status();

        // Only ACTIVE and SUSPENDED are allowed
        if (newStatus != AccountStatus.ACTIVE
                && newStatus != AccountStatus.SUSPENDED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only ACTIVE and SUSPENDED statuses are allowed"
            );
        }

        staff.setStatus(newStatus);

        User updatedStaff = userRepository.save(staff);

        return mapToResponse(updatedStaff);
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