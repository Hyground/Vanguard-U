package com.vanguard.studentenrollment.infrastructure.web.controller;

import com.vanguard.studentenrollment.application.dto.StudentEnrollmentSummaryResponse;
import com.vanguard.studentenrollment.application.service.EnrollmentService;
import com.vanguard.studentenrollment.application.service.StudentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminSummaryController {

    private final StudentService studentService;
    private final EnrollmentService enrollmentService;

    public AdminSummaryController(StudentService studentService, EnrollmentService enrollmentService) {
        this.studentService = studentService;
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/summary")
    public ResponseEntity<StudentEnrollmentSummaryResponse> getSummary() {
        return ResponseEntity.ok(new StudentEnrollmentSummaryResponse(
                studentService.countStudents(),
                enrollmentService.countEnrollments()
        ));
    }
}
