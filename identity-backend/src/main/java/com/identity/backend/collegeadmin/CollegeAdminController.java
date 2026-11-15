package com.identity.backend.collegeadmin;
import com.identity.backend.collegeadmin.dto.CollegeAdminResponse;
import com.identity.backend.collegeadmin.dto.CreateCollegeAdminRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/super-admin/colleges/{collegeId}/admins")
@RequiredArgsConstructor
public class CollegeAdminController {

    private final CollegeAdminService collegeAdminService;

    @PostMapping
    public ResponseEntity<CollegeAdminResponse> createCollegeAdmin(
            @PathVariable Long collegeId,
            @Valid @RequestBody CreateCollegeAdminRequest request
    ) {
        CollegeAdminResponse response =
                collegeAdminService.createCollegeAdmin(collegeId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
