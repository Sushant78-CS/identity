
package com.identity.backend.studentimport;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.identity.backend.auth.activation.StudentActivationService;
import com.identity.backend.college.College;
import com.identity.backend.college.CollegeRepository;
import com.identity.backend.college.CollegeStatus;
import com.identity.backend.course.Course;
import com.identity.backend.course.CourseRepository;
import com.identity.backend.department.Department;
import com.identity.backend.department.DepartmentRepository;
import com.identity.backend.enrollment.EnrollmentStatus;
import com.identity.backend.enrollment.StudentEnrollment;
import com.identity.backend.enrollment.StudentEnrollmentRepository;
import com.identity.backend.student.Student;
import com.identity.backend.student.StudentRepository;
import com.identity.backend.studentimport.dto.*;
import com.identity.backend.studentimport.parser.ExcelParser;
import com.identity.backend.user.AccountStatus;
import com.identity.backend.user.User;
import com.identity.backend.user.UserRepository;
import com.identity.backend.user.UserRole;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentImportService {

    private final ExcelParser excelParser;

    private final CollegeRepository collegeRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final StudentEnrollmentRepository enrollmentRepository;

    private final StudentImportRepository importRepository;
    private final StudentImportRecordRepository recordRepository;

    private final StudentActivationService studentActivationService;
    private final ObjectMapper objectMapper;

    // =========================================================
    // 1. PREVIEW IMPORT
    // =========================================================

    @Transactional
    public StudentImportPreview previewImport(
            InputStream inputStream,
            String fileName,
            Long collegeId,
            Long uploadedById
    ) throws IOException {

        List<StudentImportRow> rows = excelParser.parse(inputStream);

        College college = collegeRepository.findById(collegeId)
                .orElseThrow(() ->
                        new IllegalArgumentException("College not found"));

        if (college.getStatus() != CollegeStatus.ACTIVE) {
            throw new IllegalStateException(
                    "College must be active to import students"
            );
        }

        User uploadedBy = userRepository.findById(uploadedById)
                .orElseThrow(() ->
                        new IllegalArgumentException("Uploader not found"));

        if (uploadedBy.getRole() != UserRole.COLLEGE_ADMIN
                || uploadedBy.getCollege() == null
                || !uploadedBy.getCollege().getId().equals(collegeId)) {

            throw new IllegalArgumentException(
                    "Uploader is not an administrator of this college"
            );
        }

        Set<String> existingStudentIds = studentRepository
                .findAllByCollegeId(collegeId)
                .stream()
                .map(Student::getStudentId)
                .filter(Objects::nonNull)
                .map(this::normalize)
                .collect(Collectors.toSet());

        Map<String, Department> existingDepartments =
                departmentRepository
                        .findAllByCollegeIdAndActiveTrue(collegeId)
                        .stream()
                        .collect(Collectors.toMap(
                                d -> normalize(d.getCode()),
                                Function.identity(),
                                (first, second) -> first
                        ));

        List<Long> departmentIds = existingDepartments.values()
                .stream()
                .map(Department::getId)
                .toList();

        Map<String, Course> existingCourses = departmentIds.isEmpty()
                ? new HashMap<>()
                : courseRepository.findAllByDepartmentIdIn(departmentIds)
                .stream()
                .filter(c -> Boolean.TRUE.equals(c.getActive()))
                .collect(Collectors.toMap(
                        c -> courseKey(
                                c.getDepartment().getId(),
                                c.getCode()
                        ),
                        Function.identity(),
                        (first, second) -> first
                ));

        Set<String> uploadedStudentIds = new HashSet<>();
        Set<String> uploadedEmails = new HashSet<>();
        Set<String> uploadedPhones = new HashSet<>();

        // Track new departments and courses to detect inconsistent
        // definitions within the same Excel file.
        Map<String, String> proposedDepartments = new HashMap<>();
        Map<String, ProposedCourse> proposedCourses = new HashMap<>();

        for (StudentImportRow row : rows) {

            if (row.getErrors() == null) {
                row.setErrors(new ArrayList<>());
            }

            row.setStudentId(normalize(row.getStudentId()));
            row.setEmail(normalizeEmail(row.getEmail()));
            row.setPhoneNumber(normalizePhone(row.getPhoneNumber()));

            row.setDepartmentCode(normalize(row.getDepartmentCode()));
            row.setDepartmentName(normalizeName(row.getDepartmentName()));

            row.setCourseCode(normalize(row.getCourseCode()));
            row.setCourseName(normalizeName(row.getCourseName()));

            validateStudentDetails(
                    row,
                    existingStudentIds,
                    uploadedStudentIds,
                    uploadedEmails,
                    uploadedPhones
            );

            validateDepartmentAndCourse(
                    row,
                    collegeId,
                    existingDepartments,
                    existingCourses,
                    proposedDepartments,
                    proposedCourses
            );

            validateAcademicDetails(
                    row,
                    row.getDurationYears()
            );
        }

        List<StudentImportRow> validRows = rows.stream()
                .filter(StudentImportRow::isValid)
                .toList();

        int validCount = validRows.size();
        int invalidCount = rows.size() - validCount;

        // Only show proposed entities actually referenced by valid rows.
        Set<String> validDepartmentCodes = validRows.stream()
                .map(StudentImportRow::getDepartmentCode)
                .collect(Collectors.toSet());

        List<NewDepartmentPreview> newDepartments =
                validDepartmentCodes.stream()
                        .filter(code -> !existingDepartments.containsKey(code))
                        .filter(proposedDepartments::containsKey)
                        .sorted()
                        .map(code -> new NewDepartmentPreview(
                                code,
                                proposedDepartments.get(code)
                        ))
                        .toList();

        Set<String> validCourseKeys = validRows.stream()
                .map(row -> courseKey(
                        row.getDepartmentCode(),
                        row.getCourseCode()
                ))
                .collect(Collectors.toSet());

        List<NewCoursePreview> newCourses =
                validCourseKeys.stream()
                        .filter(proposedCourses::containsKey)
                        .filter(key -> {
                            ProposedCourse p = proposedCourses.get(key);
                            Department existing =
                                    existingDepartments.get(p.departmentCode());
                            if (existing == null) {
                                return true;
                            }
                            return !existingCourses.containsKey(
                                    courseKey(existing.getId(), p.courseCode())
                            );
                        })
                        .sorted()
                        .map(key -> {
                            ProposedCourse p = proposedCourses.get(key);
                            return new NewCoursePreview(
                                    p.departmentCode(),
                                    p.departmentName(),
                                    p.courseCode(),
                                    p.courseName(),
                                    p.durationYears()
                            );
                        })
                        .toList();

        StudentImportBatch batch = StudentImportBatch.builder()
                .college(college)
                .uploadedBy(uploadedBy)
                .fileName(fileName)
                .totalRows(rows.size())
                .validRows(validCount)
                .invalidRows(invalidCount)
                .importedRows(0)
                .status(ImportStatus.READY_FOR_CONFIRMATION)
                .build();

        StudentImportBatch savedBatch = importRepository.save(batch);

        List<StudentImportRecord> records = rows.stream()
                .map(row -> toImportRecord(savedBatch, row))
                .toList();

        recordRepository.saveAll(records);

        return new StudentImportPreview(
                savedBatch.getId(),
                fileName,
                rows.size(),
                validCount,
                invalidCount,
                newDepartments,
                newCourses,
                rows
        );
    }

    // =========================================================
    // 2. VALIDATE STUDENT DETAILS
    // =========================================================

    private void validateStudentDetails(
            StudentImportRow row,
            Set<String> existingStudentIds,
            Set<String> uploadedStudentIds,
            Set<String> uploadedEmails,
            Set<String> uploadedPhones
    ) {

        String studentId = row.getStudentId();

        if (studentId == null) {
            row.getErrors().add("Student ID is required");
        } else {
            if (!uploadedStudentIds.add(studentId)) {
                row.getErrors().add(
                        "Duplicate student ID in uploaded file"
                );
            }

            if (existingStudentIds.contains(studentId)) {
                row.getErrors().add(
                        "Student ID already exists in this college"
                );
            }
        }

        String email = row.getEmail();

        if (email != null) {
            if (!uploadedEmails.add(email)) {
                row.getErrors().add(
                        "Duplicate email in uploaded file"
                );
            }

            if (userRepository.existsByEmailIgnoreCase(email)) {
                row.getErrors().add(
                        "Email is already registered"
                );
            }
        }

        String phone = row.getPhoneNumber();

        if (phone != null) {
            if (!uploadedPhones.add(phone)) {
                row.getErrors().add(
                        "Duplicate phone number in uploaded file"
                );
            }

            if (userRepository.existsByPhoneNumber(phone)) {
                row.getErrors().add(
                        "Phone number is already registered"
                );
            }
        }
    }

    // =========================================================
    // 3. VALIDATE / DETECT DEPARTMENTS AND COURSES
    // =========================================================

    private void validateDepartmentAndCourse(
            StudentImportRow row,
            Long collegeId,
            Map<String, Department> existingDepartments,
            Map<String, Course> existingCourses,
            Map<String, String> proposedDepartments,
            Map<String, ProposedCourse> proposedCourses
    ) {

        String departmentCode = row.getDepartmentCode();
        String departmentName = row.getDepartmentName();

        String courseCode = row.getCourseCode();
        String courseName = row.getCourseName();

        if (departmentCode == null || departmentName == null
                || courseCode == null || courseName == null) {
            return;
        }

        Department department = existingDepartments.get(departmentCode);

        if (department != null) {

            if (!sameName(department.getName(), departmentName)) {
                row.getErrors().add(
                        "Department code already exists with a different name"
                );
                return;
            }

        } else {

            // Detect inactive departments with the same code.
            Optional<Department> inactiveOrExisting =
                    departmentRepository.findByCodeAndCollegeId(
                            departmentCode,
                            collegeId
                    );

            if (inactiveOrExisting.isPresent()) {
                row.getErrors().add(
                        "Department code already exists but the department is inactive"
                );
                return;
            }

            Optional<Department> sameName =
                    departmentRepository.findByNameIgnoreCaseAndCollegeId(
                            departmentName,
                            collegeId
                    );

            if (sameName.isPresent()) {
                row.getErrors().add(
                        "Department name already exists with another code"
                );
                return;
            }

            String previousName = proposedDepartments.putIfAbsent(
                    departmentCode,
                    departmentName
            );

            if (previousName != null
                    && !sameName(previousName, departmentName)) {

                row.getErrors().add(
                        "Same department code has different names in the Excel file"
                );
                return;
            }
        }

        String courseKey;

        if (department != null) {
            courseKey = courseKey(department.getId(), courseCode);

            Course existingCourse = existingCourses.get(courseKey);

            if (existingCourse != null) {

                if (!sameName(existingCourse.getName(), courseName)) {
                    row.getErrors().add(
                            "Course code already exists with a different name"
                    );
                    return;
                }

                if (!Objects.equals(
                        existingCourse.getDurationYears(),
                        row.getDurationYears()
                )) {
                    row.getErrors().add(
                            "Course duration does not match the existing course"
                    );
                    return;
                }

                return;
            }

            Optional<Course> existingByCode =
                    courseRepository.findByCodeAndDepartmentId(
                            courseCode,
                            department.getId()
                    );

            if (existingByCode.isPresent()) {
                row.getErrors().add(
                        "Course code already exists but the course is inactive"
                );
                return;
            }

            Optional<Course> existingByName =
                    courseRepository.findByNameIgnoreCaseAndDepartmentId(
                            courseName,
                            department.getId()
                    );

            if (existingByName.isPresent()) {
                row.getErrors().add(
                        "Course name already exists with another code"
                );
                return;
            }

        } else {
            courseKey = courseKey(departmentCode, courseCode);
        }

        ProposedCourse proposed = new ProposedCourse(
                departmentCode,
                departmentName,
                courseCode,
                courseName,
                row.getDurationYears()
        );

        ProposedCourse previous = proposedCourses.putIfAbsent(
                courseKey,
                proposed
        );

        if (previous != null && !previous.equals(proposed)) {
            row.getErrors().add(
                    "Same course code has inconsistent name or duration in the Excel file"
            );
        }
    }

    // =========================================================
    // 4. VALIDATE ACADEMIC DETAILS
    // =========================================================

    private void validateAcademicDetails(
            StudentImportRow row,
            Integer duration
    ) {

        Integer academicYear = row.getAcademicYear();
        Integer semester = row.getSemester();
        Integer admissionYear = row.getAdmissionYear();

        if (duration == null || duration < 1 || duration > 10) {
            return;
        }

        if (academicYear != null
                && (academicYear < 1 || academicYear > duration)) {
            row.getErrors().add(
                    "Academic year is outside the course duration"
            );
        }

        if (semester != null
                && (semester < 1 || semester > duration * 2)) {
            row.getErrors().add(
                    "Semester is outside the course duration"
            );
        }

        if (academicYear != null && semester != null
                && academicYear >= 1 && semester >= 1
                && semester != academicYear * 2 - 1
                && semester != academicYear * 2) {

            row.getErrors().add(
                    "Semester does not match the academic year"
            );
        }

        int currentYear = Year.now().getValue();

        if (admissionYear != null
                && (admissionYear < 1900
                || admissionYear > currentYear + 1)) {
            row.getErrors().add("Invalid admission year");
        }
    }

    // =========================================================
    // 5. CONFIRM IMPORT
    // =========================================================

    @Transactional
    public StudentImportConfirmationResponse confirmImport(
            Long batchId,
            Long collegeId
    ) {

        StudentImportBatch batch = importRepository
                .findByIdAndCollegeIdForUpdate(batchId, collegeId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Import batch not found"));

        if (batch.getStatus() == ImportStatus.COMPLETED
                || batch.getStatus() == ImportStatus.COMPLETED_WITH_ERRORS) {

            return new StudentImportConfirmationResponse(
                    batch.getId(),
                    batch.getImportedRows(),
                    batch.getInvalidRows(),
                    batch.getStatus().name(),
                    "This import batch has already been processed"
            );
        }

        if (batch.getStatus() != ImportStatus.READY_FOR_CONFIRMATION) {
            throw new IllegalStateException(
                    "Import batch is not ready for confirmation"
            );
        }

        College college = batch.getCollege();

        if (college.getStatus() != CollegeStatus.ACTIVE) {
            throw new IllegalStateException(
                    "College is not active"
            );
        }

        batch.setStatus(ImportStatus.PROCESSING);

        List<StudentImportRecord> records =
                recordRepository
                        .findAllByBatchIdAndValidTrueAndImportedFalse(
                                batch.getId()
                        );

        // Create or reuse departments and courses before students.
        Map<String, Department> departments =
                resolveDepartments(records, college);

        Map<String, Course> courses =
                resolveCourses(records, departments);

        int importedCount = 0;

        for (StudentImportRecord record : records) {

            String studentId = normalize(record.getStudentId());

            if (studentRepository.existsByStudentIdAndCollegeId(
                    studentId,
                    collegeId
            )) {
                throw new IllegalStateException(
                        "Student ID already exists at Excel row "
                                + record.getRowNumber()
                );
            }

            Department department = departments.get(
                    normalize(record.getDepartmentCode())
            );

            if (department == null) {
                throw new IllegalStateException(
                        "Unable to resolve department at Excel row "
                                + record.getRowNumber()
                );
            }

            Course course = courses.get(
                    courseKey(
                            department.getId(),
                            record.getCourseCode()
                    )
            );

            if (course == null) {
                throw new IllegalStateException(
                        "Unable to resolve course at Excel row "
                                + record.getRowNumber()
                );
            }

            // Create student user.
            User user = User.builder()
                    .fullName(record.getFullName().trim())
                    .email(normalizeEmail(record.getEmail()))
                    .phoneNumber(normalizePhone(record.getPhoneNumber()))
                    .passwordHash(null)
                    .role(UserRole.STUDENT)
                    .status(AccountStatus.PENDING_ACTIVATION)
                    .college(null)
                    .build();

            user = userRepository.save(user);

            // Create student profile.
            Student student = Student.builder()
                    .studentId(studentId)
                    .user(user)
                    .college(college)
                    .admissionYear(record.getAdmissionYear())
                    .build();

            student = studentRepository.save(student);

            // Create enrollment.
            StudentEnrollment enrollment = StudentEnrollment.builder()
                    .student(student)
                    .college(college)
                    .department(department)
                    .course(course)
                    .admissionYear(record.getAdmissionYear())
                    .academicYear(record.getAcademicYear())
                    .semester(record.getSemester())
                    .startDate(LocalDate.now())
                    .status(EnrollmentStatus.ACTIVE)
                    .build();

            enrollmentRepository.save(enrollment);

            // Existing activation service handles token and email outbox.
            studentActivationService.createActivationForStudent(student);

            record.setImported(true);
            importedCount++;
        }

        recordRepository.saveAll(records);

        int invalidCount = Math.toIntExact(
                recordRepository.countByBatchIdAndValidFalse(batch.getId())
        );

        batch.setImportedRows(importedCount);
        batch.setInvalidRows(invalidCount);

        boolean hasErrors = invalidCount > 0
                || importedCount < batch.getValidRows();

        batch.setStatus(
                hasErrors
                        ? ImportStatus.COMPLETED_WITH_ERRORS
                        : ImportStatus.COMPLETED
        );

        batch.setCompletedAt(LocalDateTime.now());

        importRepository.save(batch);

        return new StudentImportConfirmationResponse(
                batch.getId(),
                importedCount,
                invalidCount,
                batch.getStatus().name(),
                "Student import completed successfully"
        );
    }

    // =========================================================
    // 6. RESOLVE DEPARTMENTS
    // =========================================================

    private Map<String, Department> resolveDepartments(
            List<StudentImportRecord> records,
            College college
    ) {

        Map<String, Department> result = new HashMap<>();

        Map<String, String> requiredDepartments = records.stream()
                .collect(Collectors.toMap(
                        r -> normalize(r.getDepartmentCode()),
                        r -> normalizeName(r.getDepartmentName()),
                        (first, second) -> first
                ));

        for (Map.Entry<String, String> entry :
                requiredDepartments.entrySet()) {

            String code = entry.getKey();
            String name = entry.getValue();

            Department department = departmentRepository
                    .findByCodeAndCollegeId(code, college.getId())
                    .orElse(null);

            if (department != null) {

                if (!Boolean.TRUE.equals(department.getActive())) {
                    throw new IllegalStateException(
                            "Department is inactive: " + code
                    );
                }

                if (!sameName(department.getName(), name)) {
                    throw new IllegalStateException(
                            "Department name changed after preview: " + code
                    );
                }

            } else {

                if (departmentRepository
                        .existsByNameIgnoreCaseAndCollegeId(
                                name,
                                college.getId()
                        )) {
                    throw new IllegalStateException(
                            "Department name already exists: " + name
                    );
                }

                department = Department.builder()
                        .code(code)
                        .name(name)
                        .college(college)
                        .active(true)
                        .build();

                department = departmentRepository.save(department);
            }

            result.put(code, department);
        }

        return result;
    }

    // =========================================================
    // 7. RESOLVE COURSES
    // =========================================================

    private Map<String, Course> resolveCourses(
            List<StudentImportRecord> records,
            Map<String, Department> departments
    ) {

        Map<String, Course> result = new HashMap<>();

        for (StudentImportRecord record : records) {

            String departmentCode = normalize(record.getDepartmentCode());
            String courseCode = normalize(record.getCourseCode());

            Department department = departments.get(departmentCode);

            String key = courseKey(department.getId(), courseCode);

            if (result.containsKey(key)) {
                continue;
            }

            String courseName = normalizeName(record.getCourseName());
            Integer duration = record.getDurationYears();

            Course course = courseRepository
                    .findByCodeAndDepartmentId(
                            courseCode,
                            department.getId()
                    )
                    .orElse(null);

            if (course != null) {

                if (!Boolean.TRUE.equals(course.getActive())) {
                    throw new IllegalStateException(
                            "Course is inactive: " + courseCode
                    );
                }

                if (!sameName(course.getName(), courseName)
                        || !Objects.equals(
                        course.getDurationYears(),
                        duration
                )) {

                    throw new IllegalStateException(
                            "Course details changed after preview: "
                                    + courseCode
                    );
                }

            } else {

                if (courseRepository
                        .existsByNameIgnoreCaseAndDepartmentId(
                                courseName,
                                department.getId()
                        )) {
                    throw new IllegalStateException(
                            "Course name already exists: " + courseName
                    );
                }

                course = Course.builder()
                        .code(courseCode)
                        .name(courseName)
                        .durationYears(duration)
                        .department(department)
                        .active(true)
                        .build();

                course = courseRepository.save(course);
            }

            result.put(key, course);
        }

        return result;
    }

    // =========================================================
    // 8. MAP ROW TO IMPORT RECORD
    // =========================================================

    private StudentImportRecord toImportRecord(
            StudentImportBatch batch,
            StudentImportRow row
    ) {

        try {
            return StudentImportRecord.builder()
                    .batch(batch)
                    .rowNumber(row.getRowNumber())
                    .studentId(normalize(row.getStudentId()))
                    .fullName(row.getFullName())
                    .email(normalizeEmail(row.getEmail()))
                    .phoneNumber(normalizePhone(row.getPhoneNumber()))
                    .departmentCode(normalize(row.getDepartmentCode()))
                    .departmentName(normalizeName(row.getDepartmentName()))
                    .courseCode(normalize(row.getCourseCode()))
                    .courseName(normalizeName(row.getCourseName()))
                    .durationYears(row.getDurationYears())
                    .admissionYear(row.getAdmissionYear())
                    .academicYear(row.getAcademicYear())
                    .semester(row.getSemester())
                    .valid(row.isValid())
                    .errors(objectMapper.writeValueAsString(
                            row.getErrors()
                    ))
                    .imported(false)
                    .build();

        } catch (JsonProcessingException exception) {
            throw new IllegalStateException(
                    "Unable to serialize import validation errors",
                    exception
            );
        }
    }

    // =========================================================
    // 9. NORMALIZATION HELPERS
    // =========================================================

    private String normalize(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeEmail(String email) {

        if (email == null || email.isBlank()) {
            return null;
        }

        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizePhone(String phone) {

        if (phone == null || phone.isBlank()) {
            return null;
        }

        return phone.trim();
    }

    private String normalizeName(String value) {

        if (value == null || value.isBlank()) {
            return null;
        }

        return value.trim().replaceAll("\\s+", " ");
    }

    private boolean sameName(String first, String second) {
        return first != null && second != null
                && first.trim().equalsIgnoreCase(second.trim());
    }

    private String courseKey(Long departmentId, String courseCode) {
        return departmentId + ":" + normalize(courseCode);
    }

    private String courseKey(String departmentCode, String courseCode) {
        return normalize(departmentCode) + ":" + normalize(courseCode);
    }

    private record ProposedCourse(
            String departmentCode,
            String departmentName,
            String courseCode,
            String courseName,
            Integer durationYears
    ) {}
}
