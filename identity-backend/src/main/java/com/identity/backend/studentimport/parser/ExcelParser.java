
package com.identity.backend.studentimport.parser;

import com.identity.backend.studentimport.dto.StudentImportRow;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Component
public class ExcelParser {

    private static final int MAX_ROWS = 5000;

    private static final List<String> REQUIRED_HEADERS = List.of(
            "studentid",
            "fullname",
            "departmentcode",
            "departmentname",
            "coursecode",
            "coursename",
            "durationyears",
            "admissionyear",
            "academicyear",
            "semester"
    );

    public List<StudentImportRow> parse(InputStream inputStream)
            throws IOException {

        List<StudentImportRow> students = new ArrayList<>();

        try (XSSFWorkbook workbook = new XSSFWorkbook(inputStream)) {

            if (workbook.getNumberOfSheets() == 0) {
                throw new IllegalArgumentException(
                        "Excel workbook contains no worksheets"
                );
            }

            Sheet sheet = workbook.getSheetAt(0);

            if (sheet.getPhysicalNumberOfRows() == 0) {
                throw new IllegalArgumentException(
                        "Excel file is empty"
                );
            }

            DataFormatter formatter = new DataFormatter();

            FormulaEvaluator evaluator = workbook
                    .getCreationHelper()
                    .createFormulaEvaluator();

            Row headerRow = sheet.getRow(0);

            if (headerRow == null) {
                throw new IllegalArgumentException(
                        "Excel header row is missing"
                );
            }

            Map<String, Integer> headers =
                    readHeaders(headerRow, formatter, evaluator);

            validateHeaders(headers);

            int lastRow = sheet.getLastRowNum();

            if (lastRow > MAX_ROWS) {
                throw new IllegalArgumentException(
                        "Excel file cannot contain more than "
                                + MAX_ROWS + " student rows"
                );
            }

            for (int i = 1; i <= lastRow; i++) {

                Row row = sheet.getRow(i);

                if (row == null
                        || isEmptyRow(row, formatter, evaluator)) {
                    continue;
                }

                StudentImportRow student = parseRow(
                        row,
                        i + 1,
                        headers,
                        formatter,
                        evaluator
                );

                students.add(student);
            }
        }

        if (students.isEmpty()) {
            throw new IllegalArgumentException(
                    "No student records found in Excel file"
            );
        }

        return students;
    }

    // =========================================================
    // READ EXCEL HEADERS
    // =========================================================

    private Map<String, Integer> readHeaders(
            Row headerRow,
            DataFormatter formatter,
            FormulaEvaluator evaluator
    ) {

        Map<String, Integer> headers = new HashMap<>();

        for (Cell cell : headerRow) {

            String header = formatter
                    .formatCellValue(cell, evaluator)
                    .trim()
                    .toLowerCase(Locale.ROOT)
                    .replaceAll("[\\s_-]+", "");

            if (header.isBlank()) {
                continue;
            }

            if (headers.putIfAbsent(
                    header,
                    cell.getColumnIndex()
            ) != null) {

                throw new IllegalArgumentException(
                        "Duplicate Excel column: " + header
                );
            }
        }

        return headers;
    }

    // =========================================================
    // VALIDATE REQUIRED HEADERS
    // =========================================================

    private void validateHeaders(Map<String, Integer> headers) {

        List<String> missingHeaders = REQUIRED_HEADERS.stream()
                .filter(header -> !headers.containsKey(header))
                .toList();

        if (!missingHeaders.isEmpty()) {
            throw new IllegalArgumentException(
                    "Missing required columns: " + missingHeaders
            );
        }
    }

    // =========================================================
    // PARSE EXCEL ROW
    // =========================================================

    private StudentImportRow parseRow(
            Row row,
            int rowNumber,
            Map<String, Integer> headers,
            DataFormatter formatter,
            FormulaEvaluator evaluator
    ) {

        StudentImportRow student = StudentImportRow.builder()
                .rowNumber(rowNumber)

                .studentId(getCellValue(
                        row, headers, "studentid",
                        formatter, evaluator
                ))

                .fullName(getCellValue(
                        row, headers, "fullname",
                        formatter, evaluator
                ))

                .email(getCellValue(
                        row, headers, "email",
                        formatter, evaluator
                ))

                .phoneNumber(getCellValue(
                        row, headers, "phonenumber",
                        formatter, evaluator
                ))

                .departmentCode(getCellValue(
                        row, headers, "departmentcode",
                        formatter, evaluator
                ))

                .departmentName(getCellValue(
                        row, headers, "departmentname",
                        formatter, evaluator
                ))

                .courseCode(getCellValue(
                        row, headers, "coursecode",
                        formatter, evaluator
                ))

                .courseName(getCellValue(
                        row, headers, "coursename",
                        formatter, evaluator
                ))

                .durationYears(parseInteger(
                        row, headers, "durationyears",
                        formatter, evaluator
                ))

                .admissionYear(parseInteger(
                        row, headers, "admissionyear",
                        formatter, evaluator
                ))

                .academicYear(parseInteger(
                        row, headers, "academicyear",
                        formatter, evaluator
                ))

                .semester(parseInteger(
                        row, headers, "semester",
                        formatter, evaluator
                ))

                .errors(new ArrayList<>())

                .build();

        validateRow(student);

        return student;
    }

    // =========================================================
    // GET CELL VALUE
    // =========================================================

    private String getCellValue(
            Row row,
            Map<String, Integer> headers,
            String column,
            DataFormatter formatter,
            FormulaEvaluator evaluator
    ) {

        Integer index = headers.get(column);

        if (index == null) {
            return null;
        }

        Cell cell = row.getCell(
                index,
                Row.MissingCellPolicy.RETURN_BLANK_AS_NULL
        );

        if (cell == null) {
            return null;
        }

        String value = formatter
                .formatCellValue(cell, evaluator)
                .trim();

        return value.isEmpty() ? null : value;
    }

    // =========================================================
    // PARSE INTEGER VALUES
    // =========================================================

    private Integer parseInteger(
            Row row,
            Map<String, Integer> headers,
            String column,
            DataFormatter formatter,
            FormulaEvaluator evaluator
    ) {

        String value = getCellValue(
                row,
                headers,
                column,
                formatter,
                evaluator
        );

        if (value == null) {
            return null;
        }

        try {
            return Integer.valueOf(value);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    // =========================================================
    // VALIDATE STUDENT ROW
    // =========================================================

    private void validateRow(StudentImportRow student) {

        if (student.getStudentId() == null) {
            student.getErrors().add(
                    "Student ID is required"
            );
        }

        if (student.getFullName() == null) {
            student.getErrors().add(
                    "Full name is required"
            );
        }

        if (student.getDepartmentCode() == null
                || student.getDepartmentName() == null) {

            student.getErrors().add(
                    "Department code and name are required"
            );
        }

        if (student.getCourseCode() == null
                || student.getCourseName() == null) {

            student.getErrors().add(
                    "Course code and name are required"
            );
        }

        if (student.getDurationYears() == null
                || student.getDurationYears() < 1
                || student.getDurationYears() > 10) {

            student.getErrors().add(
                    "Course duration must be between 1 and 10 years"
            );
        }

        if (student.getAdmissionYear() == null) {
            student.getErrors().add(
                    "Valid admission year is required"
            );
        }

        if (student.getAcademicYear() == null
                || student.getAcademicYear() < 1) {

            student.getErrors().add(
                    "Academic year must be a positive integer"
            );
        }

        if (student.getSemester() == null
                || student.getSemester() < 1) {

            student.getErrors().add(
                    "Semester must be a positive integer"
            );
        }

        if (student.getEmail() != null
                && !student.getEmail().matches(
                "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")) {

            student.getErrors().add(
                    "Invalid email format"
            );
        }

        if (student.getPhoneNumber() != null
                && !student.getPhoneNumber().matches(
                "^\\+?[0-9]{10,15}$")) {

            student.getErrors().add(
                    "Invalid phone number format"
            );
        }
    }

    // =========================================================
    // CHECK EMPTY ROW
    // =========================================================

    private boolean isEmptyRow(
            Row row,
            DataFormatter formatter,
            FormulaEvaluator evaluator
    ) {

        for (Cell cell : row) {

            if (!formatter
                    .formatCellValue(cell, evaluator)
                    .trim()
                    .isEmpty()) {

                return false;
            }
        }

        return true;
    }
}
