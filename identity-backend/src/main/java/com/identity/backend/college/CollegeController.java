package com.identity.backend.college;
import com.identity.backend.college.dto.CollegeResponse;
import com.identity.backend.college.dto.CreateCollegeRequest;

import com.identity.backend.college.dto.UpdateCollegeRequest;
import com.identity.backend.college.dto.UpdateCollegeStatusRequest;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/super-admin/colleges")
public class CollegeController {

    private final CollegeService collegeService;

    public CollegeController(CollegeService collegeService) {
        this.collegeService = collegeService;
    }

    @PostMapping
    public ResponseEntity<CollegeResponse> createCollege(
            @Valid @RequestBody CreateCollegeRequest request
    ) {
        CollegeResponse response = collegeService.createCollege(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<Page<CollegeResponse>> getAllColleges(
            @PageableDefault(
                    size = 10,
                    sort = "createdAt",
                    direction = Sort.Direction.DESC
            ) Pageable pageable
    ) {
        return ResponseEntity.ok(
                collegeService.getAllColleges(pageable)
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<CollegeResponse> getCollegeById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                collegeService.getCollegeById(id)
        );
    }


    @PutMapping("/{id}")
    public ResponseEntity<CollegeResponse> updateCollege(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCollegeRequest request
    ) {
        return ResponseEntity.ok(
                collegeService.updateCollege(id, request)
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollege(
            @PathVariable Long id
    ) {
        collegeService.deleteCollege(id);
        return ResponseEntity.noContent().build();
    }


    @PatchMapping("/{id}/status")
    public ResponseEntity<CollegeResponse> updateCollegeStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCollegeStatusRequest request
    ) {
        return ResponseEntity.ok(
                collegeService.updateCollegeStatus(id, request)
        );
    }
}
