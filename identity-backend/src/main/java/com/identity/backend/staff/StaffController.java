
package com.identity.backend.staff;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.staff.dto.CreateStaffRequest;
import com.identity.backend.staff.dto.StaffResponse;
import com.identity.backend.staff.dto.UpdateStaffRequest;
import com.identity.backend.staff.dto.UpdateStaffStatusRequest;
import com.identity.backend.user.AccountStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
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

    @GetMapping
    public ResponseEntity<Page<StaffResponse>> getAllStaff(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AccountStatus status
    ) {
        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        Page<StaffResponse> response =
                staffService.getAllStaff(
                        authenticatedUser,
                        page,
                        size,
                        search,
                        status
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{staffId}")
    public ResponseEntity<StaffResponse> getStaffById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long staffId
    ) {
        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        StaffResponse response =
                staffService.getStaffById(
                        authenticatedUser,
                        staffId
                );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{staffId}")
    public ResponseEntity<StaffResponse> updateStaff(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long staffId,
            @Valid @RequestBody UpdateStaffRequest request
    ) {
        AuthenticatedUser authenticatedUser = AuthenticatedUser.from(jwt);

        StaffResponse response = staffService.updateStaff(
                authenticatedUser,
                staffId,
                request
        );

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{staffId}/status")
    public ResponseEntity<StaffResponse> updateStaffStatus(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long staffId,
            @Valid @RequestBody UpdateStaffStatusRequest request
    ) {
        AuthenticatedUser authenticatedUser = AuthenticatedUser.from(jwt);

        StaffResponse response = staffService.updateStaffStatus(
                authenticatedUser,
                staffId,
                request
        );

        return ResponseEntity.ok(response);
    }
}
