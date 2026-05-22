package com.vanguard.studentenrollment.infrastructure.web.controller;

import com.vanguard.studentenrollment.application.dto.StudentRequest;
import com.vanguard.studentenrollment.application.dto.StudentResponse;
import com.vanguard.studentenrollment.application.service.StudentService;
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
@RequestMapping("/api/v1/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<Page<StudentResponse>> findAll(Pageable pageable) {
        return ResponseEntity.ok(studentService.findAll(pageable));
    }

    @GetMapping("/count")
    public ResponseEntity<Long> countStudents() {
        return ResponseEntity.ok(studentService.countStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> findById(@PathVariable Integer id) {
        return ResponseEntity.ok(studentService.findById(id));
    }

    @GetMapping("/cui/{cui}")
    public ResponseEntity<StudentResponse> findByCui(@PathVariable String cui) {
        return ResponseEntity.ok(studentService.findByCui(cui));
    }

    @GetMapping("/personal-code/{personalCode}")
    public ResponseEntity<StudentResponse> findByPersonalCode(@PathVariable String personalCode) {
        return ResponseEntity.ok(studentService.findByPersonalCode(personalCode));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<StudentResponse> findByUserId(@PathVariable Integer userId) {
        return ResponseEntity.ok(studentService.findByUserId(userId));
    }

    @GetMapping("/tutor/{tutorId}")
    public ResponseEntity<List<StudentResponse>> findByTutorId(@PathVariable Integer tutorId) {
        return ResponseEntity.ok(studentService.findByTutorId(tutorId));
    }

    @PostMapping
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest request) {
        StudentResponse response = studentService.create(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(response.id())
                .toUri();

        return ResponseEntity.created(location).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody StudentRequest request
    ) {
        return ResponseEntity.ok(studentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
