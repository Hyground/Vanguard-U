package com.vanguard.studentenrollment.infrastructure.web.controller;

import com.vanguard.studentenrollment.application.dto.AttendanceRequest;
import com.vanguard.studentenrollment.application.dto.AttendanceResponse;
import com.vanguard.studentenrollment.application.service.AttendanceService;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/v1/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<Page<AttendanceResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(attendanceService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AttendanceResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(attendanceService.findById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceResponse>> findByStudentId(@PathVariable Integer studentId) {
        return ResponseEntity.ok(attendanceService.findByStudentId(studentId));
    }

    @GetMapping("/teacher-assignment/{teacherAssignmentId}")
    public ResponseEntity<List<AttendanceResponse>> findByTeacherAssignmentId(
            @PathVariable Integer teacherAssignmentId
    ) {
        return ResponseEntity.ok(attendanceService.findByTeacherAssignmentId(teacherAssignmentId));
    }

    @GetMapping("/date/{attendanceDate}")
    public ResponseEntity<List<AttendanceResponse>> findByAttendanceDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate attendanceDate
    ) {
        return ResponseEntity.ok(attendanceService.findByAttendanceDate(attendanceDate));
    }

    @GetMapping("/student/{studentId}/date/{attendanceDate}")
    public ResponseEntity<List<AttendanceResponse>> findByStudentAndAttendanceDate(
            @PathVariable Integer studentId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate attendanceDate
    ) {
        return ResponseEntity.ok(attendanceService.findByStudentAndAttendanceDate(studentId, attendanceDate));
    }

    @PostMapping
    public ResponseEntity<AttendanceResponse> create(@Valid @RequestBody AttendanceRequest request) {
        AttendanceResponse response = attendanceService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AttendanceResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody AttendanceRequest request
    ) {
        return ResponseEntity.ok(attendanceService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        attendanceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
