package com.vanguard.studentenrollment.infrastructure.web.controller;

import com.vanguard.studentenrollment.application.dto.GradeRecordRequest;
import com.vanguard.studentenrollment.application.dto.GradeRecordResponse;
import com.vanguard.studentenrollment.application.service.GradeRecordService;
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
@RequestMapping("/api/v1/grades-records")
public class GradeRecordController {

    private final GradeRecordService gradeRecordService;

    public GradeRecordController(GradeRecordService gradeRecordService) {
        this.gradeRecordService = gradeRecordService;
    }

    @GetMapping
    public ResponseEntity<Page<GradeRecordResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(gradeRecordService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GradeRecordResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(gradeRecordService.findById(id));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GradeRecordResponse>> findByStudentId(@PathVariable Integer studentId) {
        return ResponseEntity.ok(gradeRecordService.findByStudentId(studentId));
    }

    @GetMapping("/activity/{activityId}")
    public ResponseEntity<List<GradeRecordResponse>> findByActivityId(@PathVariable Integer activityId) {
        return ResponseEntity.ok(gradeRecordService.findByActivityId(activityId));
    }

    @PostMapping
    public ResponseEntity<GradeRecordResponse> create(@Valid @RequestBody GradeRecordRequest request) {
        GradeRecordResponse response = gradeRecordService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GradeRecordResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody GradeRecordRequest request
    ) {
        return ResponseEntity.ok(gradeRecordService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        gradeRecordService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
