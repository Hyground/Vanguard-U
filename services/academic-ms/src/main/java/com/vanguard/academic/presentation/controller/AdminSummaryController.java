package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.AcademicSummaryDTO;
import com.vanguard.academic.domain.service.CourseService;
import com.vanguard.academic.domain.service.SchoolCycleService;
import com.vanguard.academic.domain.service.TeacherService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminSummaryController {

    private final TeacherService teacherService;
    private final CourseService courseService;
    private final SchoolCycleService schoolCycleService;

    public AdminSummaryController(
            TeacherService teacherService,
            CourseService courseService,
            SchoolCycleService schoolCycleService
    ) {
        this.teacherService = teacherService;
        this.courseService = courseService;
        this.schoolCycleService = schoolCycleService;
    }

    @GetMapping("/summary")
    public ResponseEntity<AcademicSummaryDTO> getSummary() {
        return ResponseEntity.ok(new AcademicSummaryDTO(
                teacherService.countTeachers(),
                courseService.countCourses(),
                schoolCycleService.countActiveSchoolCycles()
        ));
    }
}
