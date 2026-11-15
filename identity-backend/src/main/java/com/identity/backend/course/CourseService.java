package com.identity.backend.course;
import com.identity.backend.college.College;
import com.identity.backend.college.CollegeRepository;
import com.identity.backend.college.CollegeStatus;
import com.identity.backend.course.dto.*;
import com.identity.backend.department.Department;
import com.identity.backend.department.DepartmentRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
    private final CollegeRepository collegeRepository;

    public CourseService(
            CourseRepository courseRepository,
            DepartmentRepository departmentRepository,
            CollegeRepository collegeRepository
    ) {
        this.courseRepository = courseRepository;
        this.departmentRepository = departmentRepository;
        this.collegeRepository = collegeRepository;
    }

    @Transactional
    public CourseResponse create(
            Long collegeId,
            Long departmentId,
            CreateCourseRequest request
    ) {
        getActiveCollege(collegeId);
        Department department = getActiveDepartment(collegeId, departmentId);

        String code = request.code().trim().toUpperCase();
        String name = request.name().trim();

        if (courseRepository.existsByCodeAndDepartmentId(code, departmentId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Course code already exists in this department"
            );
        }

        if (courseRepository.existsByNameIgnoreCaseAndDepartmentId(name, departmentId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Course name already exists in this department"
            );
        }

        Course course = Course.builder()
                .code(code)
                .name(name)
                .description(request.description())
                .durationYears(request.durationYears())
                .department(department)
                .active(true)
                .build();

        return map(courseRepository.save(course));
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> getAll(Long collegeId, Long departmentId) {
        getCollege(collegeId);
        getDepartment(collegeId, departmentId);

        return courseRepository.findAllByDepartmentId(departmentId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseResponse getById(
            Long collegeId,
            Long departmentId,
            Long courseId
    ) {
        getDepartment(collegeId, departmentId);
        return map(getCourse(departmentId, courseId));
    }

    @Transactional
    public CourseResponse update(
            Long collegeId,
            Long departmentId,
            Long courseId,
            UpdateCourseRequest request
    ) {
        getActiveCollege(collegeId);
        getActiveDepartment(collegeId, departmentId);

        Course course = getCourse(departmentId, courseId);

        if (!Boolean.TRUE.equals(course.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Inactive course cannot be updated"
            );
        }

        String name = request.name().trim();

        if (!course.getName().equalsIgnoreCase(name)
                && courseRepository.existsByNameIgnoreCaseAndDepartmentId(
                name, departmentId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Course name already exists in this department"
            );
        }

        course.setName(name);
        course.setDescription(request.description());
        course.setDurationYears(request.durationYears());

        return map(courseRepository.save(course));
    }

    @Transactional
    public void deactivate(
            Long collegeId,
            Long departmentId,
            Long courseId
    ) {
        getDepartment(collegeId, departmentId);

        Course course = getCourse(departmentId, courseId);

        if (!Boolean.TRUE.equals(course.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Course is already inactive"
            );
        }

        course.setActive(false);
        courseRepository.save(course);
    }

    private College getCollege(Long collegeId) {
        return collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "College not found"
                ));
    }

    private College getActiveCollege(Long collegeId) {
        College college = getCollege(collegeId);

        if (college.getStatus() != CollegeStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "College is not active"
            );
        }

        return college;
    }

    private Department getDepartment(Long collegeId, Long departmentId) {
        return departmentRepository.findByIdAndCollegeId(
                        departmentId, collegeId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Department not found in this college"
                ));
    }

    private Department getActiveDepartment(
            Long collegeId,
            Long departmentId
    ) {
        Department department = getDepartment(collegeId, departmentId);

        if (!Boolean.TRUE.equals(department.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Department is inactive"
            );
        }

        return department;
    }

    private Course getCourse(Long departmentId, Long courseId) {
        return courseRepository.findByIdAndDepartmentId(
                        courseId, departmentId
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Course not found in this department"
                ));
    }

    private CourseResponse map(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getDepartment().getId(),
                course.getCode(),
                course.getName(),
                course.getDescription(),
                course.getDurationYears(),
                course.getActive(),
                course.getCreatedAt()
        );
    }
}
