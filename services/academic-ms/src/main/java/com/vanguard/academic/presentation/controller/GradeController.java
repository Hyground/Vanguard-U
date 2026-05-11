package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.GradeDTO;
import com.vanguard.academic.domain.model.Grade;
import com.vanguard.academic.domain.model.Major;
import com.vanguard.academic.domain.service.GradeService;
import com.vanguard.academic.domain.service.MajorService;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/grades")
public class GradeController {
    
    private final GradeService gradeService;
    private final MajorService majorService;
    
    public GradeController(GradeService gradeService, MajorService majorService) {
        this.gradeService = gradeService;
        this.majorService = majorService;
    }
    
    @GetMapping
    @Cacheable(cacheNames = "academicCatalogs", key = "'grades:all'")
    public ResponseEntity<List<GradeDTO>> getAllGrades() {
        List<Grade> grades = gradeService.findAll();
        List<GradeDTO> gradeDTOs = grades.stream()
            .map(this::toDTO)
            .toList();
        return ResponseEntity.ok(gradeDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<GradeDTO> getGradeById(@PathVariable Long id) {
        return gradeService.findById(id)
            .map(grade -> ResponseEntity.ok(toDTO(grade)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping({"/major/{majorId}", "/career/{majorId}"})
    @Cacheable(cacheNames = "academicCatalogs", key = "'grades:major:' + #majorId")
    public ResponseEntity<List<GradeDTO>> getGradesByMajor(@PathVariable Long majorId) {
        List<Grade> grades = gradeService.findByMajorId(majorId);
        List<GradeDTO> gradeDTOs = grades.stream()
            .map(this::toDTO)
            .toList();
        return ResponseEntity.ok(gradeDTOs);
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<GradeDTO>> searchGrades(@RequestParam String name) {
        List<Grade> grades = gradeService.findByNameContaining(name);
        List<GradeDTO> gradeDTOs = grades.stream()
            .map(this::toDTO)
            .toList();
        return ResponseEntity.ok(gradeDTOs);
    }
    
    @PostMapping
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<GradeDTO> createGrade(@Valid @RequestBody GradeDTO gradeDTO) {
        Grade grade = toEntity(gradeDTO);
        Grade savedGrade = gradeService.save(grade);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedGrade));
    }
    
    @PutMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<GradeDTO> updateGrade(@PathVariable Long id, @Valid @RequestBody GradeDTO gradeDTO) {
        Grade grade = toEntity(gradeDTO);
        Grade updatedGrade = gradeService.update(id, grade);
        return ResponseEntity.ok(toDTO(updatedGrade));
    }
    
    @DeleteMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        gradeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    private GradeDTO toDTO(Grade grade) {
        return new GradeDTO(grade.getId(), grade.getName(), grade.getMajor().getId());
    }
    
    private Grade toEntity(GradeDTO dto) {
        Major major = majorService.findById(dto.majorId())
            .orElseThrow(() -> new IllegalArgumentException("Major not found with id: " + dto.majorId()));
        return new Grade(dto.name(), major);
    }
}
