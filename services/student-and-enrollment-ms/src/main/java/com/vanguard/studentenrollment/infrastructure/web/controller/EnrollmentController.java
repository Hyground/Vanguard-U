package com.vanguard.studentenrollment.infrastructure.web.controller;

import com.vanguard.studentenrollment.application.dto.EnrollmentRequest;
import com.vanguard.studentenrollment.application.dto.EnrollmentResponse;
import com.vanguard.studentenrollment.application.service.EnrollmentService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping
    public ResponseEntity<Page<EnrollmentResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(enrollmentService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnrollmentResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(enrollmentService.findById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentResponse>> findByStudentId(@PathVariable Integer studentId) {
        return ResponseEntity.ok(enrollmentService.findByStudentId(studentId));
    }

    @GetMapping("/cycle/{cycleId}")
    public ResponseEntity<List<EnrollmentResponse>> findByCycleId(@PathVariable Integer cycleId) {
        return ResponseEntity.ok(enrollmentService.findByCycleId(cycleId));
    }

    @GetMapping("/grade/{gradeId}/section/{sectionId}/cycle/{cycleId}")
    public ResponseEntity<List<EnrollmentResponse>> findByGradeSectionAndCycle(
            @PathVariable Integer gradeId,
            @PathVariable Integer sectionId,
            @PathVariable Integer cycleId
    ) {
        return ResponseEntity.ok(enrollmentService.findByGradeSectionAndCycle(gradeId, sectionId, cycleId));
    }

    @PostMapping
    public ResponseEntity<EnrollmentResponse> create(@Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnrollmentResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody EnrollmentRequest request
    ) {
        return ResponseEntity.ok(enrollmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        enrollmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
