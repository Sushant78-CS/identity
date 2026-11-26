package com.identity.backend.student;

import com.identity.backend.auth.security.AuthenticatedUser;
import com.identity.backend.student.dto.StudentDetailsResponse;
import com.identity.backend.student.dto.StudentListResponse;
import com.identity.backend.user.AccountStatus;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/college-admin/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<Page<StudentListResponse>> getAllStudents(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AccountStatus status
    ) {

        AuthenticatedUser authenticatedUser =
                AuthenticatedUser.from(jwt);

        Page<StudentListResponse> response =
                studentService.getAllStudents(
                        authenticatedUser,
                        page,
                        size,
                        search,
                        status
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<StudentDetailsResponse> getStudentById(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable Long studentId
    ) {
        AuthenticatedUser authenticatedUser = AuthenticatedUser.from(jwt);

        StudentDetailsResponse response =
                studentService.getStudentById(
                        authenticatedUser,
                        studentId
                );

        return ResponseEntity.ok(response);
    }
}