package com.identity.backend.studentimport;

import com.identity.backend.auth.CurrentUserService;
import com.identity.backend.auth.IdentityPrincipal;
import com.identity.backend.studentimport.dto.StudentImportConfirmationResponse;
import com.identity.backend.studentimport.dto.StudentImportPreview;
import com.identity.backend.user.UserRole;

import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@RestController
@RequestMapping("/api/college-admin/student-imports")
@RequiredArgsConstructor
public class StudentImportController {

    private final StudentImportService studentImportService;
    private final CurrentUserService currentUserService;

    @PostMapping(
            value = "/preview",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<StudentImportPreview> previewImport(
            @RequestParam("file") MultipartFile file,
            JwtAuthenticationToken authentication
    ) {
        IdentityPrincipal principal = getCollegeAdmin(authentication);

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please upload an Excel file"
            );
        }

        String fileName = file.getOriginalFilename();

        if (fileName == null
                || !fileName.toLowerCase().endsWith(".xlsx")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only .xlsx files are supported"
            );
        }

        try {
            StudentImportPreview preview =
                    studentImportService.previewImport(
                            file.getInputStream(),
                            fileName,
                            principal.collegeId(),
                            principal.userId()
                    );

            return ResponseEntity.ok(preview);

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unable to read the Excel file",
                    exception
            );
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage(),
                    exception
            );
        }
    }

    @PostMapping("/{batchId}/confirm")
    public ResponseEntity<StudentImportConfirmationResponse> confirmImport(
            @PathVariable @NotNull Long batchId,
            JwtAuthenticationToken authentication
    ) {
        IdentityPrincipal principal = getCollegeAdmin(authentication);

        try {
            StudentImportConfirmationResponse response =
                    studentImportService.confirmImport(
                            batchId,
                            principal.collegeId()
                    );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    exception.getMessage(),
                    exception
            );
        } catch (IllegalStateException exception) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    exception.getMessage(),
                    exception
            );
        }
    }

    private IdentityPrincipal getCollegeAdmin(
            JwtAuthenticationToken authentication
    ) {
        IdentityPrincipal principal =
                currentUserService.getCurrentUser(authentication);

        if (principal.role() != UserRole.COLLEGE_ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only college administrators can manage student imports"
            );
        }

        if (principal.collegeId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Your account is not assigned to a college"
            );
        }

        return principal;
    }
}