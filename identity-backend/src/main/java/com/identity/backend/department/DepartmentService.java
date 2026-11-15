
package com.identity.backend.department;

import com.identity.backend.college.College;
import com.identity.backend.college.CollegeRepository;
import com.identity.backend.department.dto.*;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final CollegeRepository collegeRepository;

    public DepartmentService(
            DepartmentRepository departmentRepository,
            CollegeRepository collegeRepository
    ) {
        this.departmentRepository = departmentRepository;
        this.collegeRepository = collegeRepository;
    }

    @Transactional
    public DepartmentResponse create(Long collegeId,
                                     CreateDepartmentRequest request) {

        College college = getActiveCollege(collegeId);

        String code = request.code().trim().toUpperCase();
        String name = request.name().trim();

        if (departmentRepository.existsByCodeAndCollegeId(code, collegeId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Department code already exists"
            );
        }

        if (departmentRepository.existsByNameIgnoreCaseAndCollegeId(name, collegeId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Department name already exists"
            );
        }

        Department department = Department.builder()
                .code(code)
                .name(name)
                .description(request.description())
                .college(college)
                .active(true)
                .build();

        return map(departmentRepository.save(department));
    }

    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAll(Long collegeId) {
        getCollege(collegeId);

        return departmentRepository.findAllByCollegeId(collegeId)
                .stream()
                .map(this::map)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentResponse getById(Long collegeId, Long id) {
        return map(getDepartment(collegeId, id));
    }

    @Transactional
    public DepartmentResponse update(
            Long collegeId,
            Long id,
            UpdateDepartmentRequest request
    ) {
        Department department = getDepartment(collegeId, id);

        if (!Boolean.TRUE.equals(department.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Inactive department cannot be updated"
            );
        }

        String name = request.name().trim();

        if (!department.getName().equalsIgnoreCase(name)
                && departmentRepository.existsByNameIgnoreCaseAndCollegeId(name, collegeId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Department name already exists"
            );
        }

        department.setName(name);
        department.setDescription(request.description());

        return map(departmentRepository.save(department));
    }

    @Transactional
    public void deactivate(Long collegeId, Long id) {
        Department department = getDepartment(collegeId, id);

        if (!Boolean.TRUE.equals(department.getActive())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Department is already inactive"
            );
        }

        department.setActive(false);
        departmentRepository.save(department);
    }

    private College getCollege(Long collegeId) {
        return collegeRepository.findById(collegeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "College not found"
                ));
    }

    private College getActiveCollege(Long collegeId) {
        College college = getCollege(collegeId);

        if (college.getStatus() != com.identity.backend.college.CollegeStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "College is not active"
            );
        }

        return college;
    }

    private Department getDepartment(Long collegeId, Long id) {
        return departmentRepository.findByIdAndCollegeId(id, collegeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Department not found in this college"
                ));
    }

    private DepartmentResponse map(Department department) {
        return new DepartmentResponse(
                department.getId(),
                department.getCollege().getId(),
                department.getCode(),
                department.getName(),
                department.getDescription(),
                department.getActive(),
                department.getCreatedAt()
        );
    }
}
