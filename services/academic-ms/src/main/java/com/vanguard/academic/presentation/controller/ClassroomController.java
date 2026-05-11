package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.ClassroomDTO;
import com.vanguard.academic.domain.model.Classroom;
import com.vanguard.academic.domain.service.ClassroomService;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/classrooms")
public class ClassroomController {
    
    private final ClassroomService classroomService;
    
    public ClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }
    
    @GetMapping
    @Cacheable(cacheNames = "academicCatalogs", key = "'classrooms:all'")
    public ResponseEntity<List<ClassroomDTO>> getAllClassrooms() {
        List<Classroom> classrooms = classroomService.findAll();
        List<ClassroomDTO> classroomDTOs = classrooms.stream()
            .map(this::toDTO)
            .toList();
        return ResponseEntity.ok(classroomDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ClassroomDTO> getClassroomById(@PathVariable Long id) {
        return classroomService.findById(id)
            .map(classroom -> ResponseEntity.ok(toDTO(classroom)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<ClassroomDTO> createClassroom(@Valid @RequestBody ClassroomDTO classroomDTO) {
        Classroom classroom = toEntity(classroomDTO);
        Classroom savedClassroom = classroomService.save(classroom);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedClassroom));
    }
    
    @PutMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<ClassroomDTO> updateClassroom(@PathVariable Long id, @Valid @RequestBody ClassroomDTO classroomDTO) {
        Classroom classroom = toEntity(classroomDTO);
        Classroom updatedClassroom = classroomService.update(id, classroom);
        return ResponseEntity.ok(toDTO(updatedClassroom));
    }
    
    @DeleteMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<Void> deleteClassroom(@PathVariable Long id) {
        classroomService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    private ClassroomDTO toDTO(Classroom classroom) {
        return new ClassroomDTO(classroom.getId(), classroom.getCode(), classroom.getCapacity());
    }
    
    private Classroom toEntity(ClassroomDTO dto) {
        return new Classroom(dto.code(), dto.capacity());
    }
}
