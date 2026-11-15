package com.identity.backend.course;
import com.identity.backend.course.dto.*;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(
        "/api/super-admin/colleges/{collegeId}/departments/{departmentId}/courses"
)
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<CourseResponse> create(
            @PathVariable Long collegeId,
            @PathVariable Long departmentId,
            @Valid @RequestBody CreateCourseRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.create(collegeId, departmentId, request));
    }

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getAll(
            @PathVariable Long collegeId,
            @PathVariable Long departmentId
    ) {
        return ResponseEntity.ok(
                courseService.getAll(collegeId, departmentId)
        );
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseResponse> getById(
            @PathVariable Long collegeId,
            @PathVariable Long departmentId,
            @PathVariable Long courseId
    ) {
        return ResponseEntity.ok(
                courseService.getById(collegeId, departmentId, courseId)
        );
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<CourseResponse> update(
            @PathVariable Long collegeId,
            @PathVariable Long departmentId,
            @PathVariable Long courseId,
            @Valid @RequestBody UpdateCourseRequest request
    ) {
        return ResponseEntity.ok(
                courseService.update(
                        collegeId, departmentId, courseId, request
                )
        );
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deactivate(
            @PathVariable Long collegeId,
            @PathVariable Long departmentId,
            @PathVariable Long courseId
    ) {
        courseService.deactivate(collegeId, departmentId, courseId);
        return ResponseEntity.noContent().build();
    }
}
