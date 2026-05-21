package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.TeacherDTO;
import com.vanguard.academic.domain.model.Teacher;
import com.vanguard.academic.domain.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @GetMapping
    public ResponseEntity<Page<TeacherDTO>> getAllTeachers(Pageable pageable) {
        return ResponseEntity.ok(teacherService.findAll(pageable).map(this::toDTO));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherDTO> getTeacherById(@PathVariable Long id) {
        return teacherService.findById(id)
            .map(teacher -> ResponseEntity.ok(toDTO(teacher)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<TeacherDTO> getTeacherByUserId(@PathVariable Long userId) {
        return teacherService.findByUserId(userId)
            .map(teacher -> ResponseEntity.ok(toDTO(teacher)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<Page<TeacherDTO>> searchTeachers(@RequestParam String name, Pageable pageable) {
        return ResponseEntity.ok(teacherService.searchByName(name, pageable).map(this::toDTO));
    }

    @PostMapping
    public ResponseEntity<TeacherDTO> createTeacher(@Valid @RequestBody TeacherDTO teacherDTO) {
        Teacher savedTeacher = teacherService.save(toEntity(teacherDTO));
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedTeacher));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherDTO> updateTeacher(@PathVariable Long id, @Valid @RequestBody TeacherDTO teacherDTO) {
        Teacher updatedTeacher = teacherService.update(id, toEntity(teacherDTO));
        return ResponseEntity.ok(toDTO(updatedTeacher));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private TeacherDTO toDTO(Teacher teacher) {
        return new TeacherDTO(
            teacher.getId(),
            teacher.getCui(),
            teacher.getFirstName(),
            teacher.getLastName(),
            teacher.getEmail(),
            teacher.getUserId()
        );
    }

    private Teacher toEntity(TeacherDTO dto) {
        return new Teacher(dto.cui(), dto.firstName(), dto.lastName(), dto.email(), dto.userId());
    }
}
