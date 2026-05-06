package com.vanguard.studentenrollment.infrastructure.web.controller;

import com.vanguard.studentenrollment.application.dto.TeacherAssignmentRequest;
import com.vanguard.studentenrollment.application.dto.TeacherAssignmentResponse;
import com.vanguard.studentenrollment.application.service.TeacherAssignmentService;
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
@RequestMapping("/api/v1/teacher-assignments")
public class TeacherAssignmentController {

    private final TeacherAssignmentService teacherAssignmentService;

    public TeacherAssignmentController(TeacherAssignmentService teacherAssignmentService) {
        this.teacherAssignmentService = teacherAssignmentService;
    }

    @GetMapping
    public ResponseEntity<Page<TeacherAssignmentResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(teacherAssignmentService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherAssignmentResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(teacherAssignmentService.findById(id));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<TeacherAssignmentResponse>> findByTeacherId(@PathVariable Integer teacherId) {
        return ResponseEntity.ok(teacherAssignmentService.findByTeacherId(teacherId));
    }

    @GetMapping("/grade/{gradeId}/section/{sectionId}")
    public ResponseEntity<List<TeacherAssignmentResponse>> findByGradeAndSection(
            @PathVariable Integer gradeId,
            @PathVariable Integer sectionId
    ) {
        return ResponseEntity.ok(teacherAssignmentService.findByGradeAndSection(gradeId, sectionId));
    }

    @PostMapping
    public ResponseEntity<TeacherAssignmentResponse> create(
            @Valid @RequestBody TeacherAssignmentRequest request
    ) {
        TeacherAssignmentResponse response = teacherAssignmentService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherAssignmentResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody TeacherAssignmentRequest request
    ) {
        return ResponseEntity.ok(teacherAssignmentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        teacherAssignmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
