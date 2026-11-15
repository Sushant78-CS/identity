package com.identity.backend.auth.activation;
import com.identity.backend.auth.activation.dto.ActivateStudentRequest;
import com.identity.backend.auth.activation.dto.ActivationResponse;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/student")
public class StudentActivationController {

    private final StudentActivationService activationService;

    public StudentActivationController(
            StudentActivationService activationService
    ) {
        this.activationService = activationService;
    }

    @PostMapping("/activate")
    public ResponseEntity<ActivationResponse> activateStudent(
            @Valid @RequestBody ActivateStudentRequest request
    ) {

        return ResponseEntity.ok(
                activationService.activateStudent(request)
        );
    }
}
