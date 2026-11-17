package com.identity.backend.staff;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.staff.dto.CreateStaffRequest;
import com.identity.backend.staff.dto.StaffResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/college-admin/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    @PostMapping
    public ResponseEntity<StaffResponse> createStaff(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateStaffRequest request
    ) {
        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        StaffResponse response =
                staffService.createStaff(authenticatedUser, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}