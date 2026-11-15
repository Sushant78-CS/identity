package com.identity.backend.department;
import com.identity.backend.department.dto.*;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/super-admin/colleges/{collegeId}/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @PostMapping
    public ResponseEntity<DepartmentResponse> create(
            @PathVariable Long collegeId,
            @Valid @RequestBody CreateDepartmentRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(departmentService.create(collegeId, request));
    }

    @GetMapping
    public ResponseEntity<List<DepartmentResponse>> getAll(
            @PathVariable Long collegeId
    ) {
        return ResponseEntity.ok(departmentService.getAll(collegeId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentResponse> getById(
            @PathVariable Long collegeId,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(departmentService.getById(collegeId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DepartmentResponse> update(
            @PathVariable Long collegeId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateDepartmentRequest request
    ) {
        return ResponseEntity.ok(
                departmentService.update(collegeId, id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(
            @PathVariable Long collegeId,
            @PathVariable Long id
    ) {
        departmentService.deactivate(collegeId, id);
        return ResponseEntity.noContent().build();
    }
}
