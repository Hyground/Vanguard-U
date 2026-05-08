package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.GradeDTO;
import com.vanguard.academic.domain.model.Grade;
import com.vanguard.academic.domain.model.Career;
import com.vanguard.academic.domain.service.GradeService;
import com.vanguard.academic.domain.service.CareerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/grades")
public class GradeController {
    
    private final GradeService gradeService;
    private final CareerService careerService;
    
    public GradeController(GradeService gradeService, CareerService careerService) {
        this.gradeService = gradeService;
        this.careerService = careerService;
    }
    
    @GetMapping
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
    
    @GetMapping("/career/{careerId}")
    public ResponseEntity<List<GradeDTO>> getGradesByCareer(@PathVariable Long careerId) {
        List<Grade> grades = gradeService.findByCareerId(careerId);
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
    public ResponseEntity<GradeDTO> createGrade(@Valid @RequestBody GradeDTO gradeDTO) {
        Grade grade = toEntity(gradeDTO);
        Grade savedGrade = gradeService.save(grade);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedGrade));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<GradeDTO> updateGrade(@PathVariable Long id, @Valid @RequestBody GradeDTO gradeDTO) {
        Grade grade = toEntity(gradeDTO);
        Grade updatedGrade = gradeService.update(id, grade);
        return ResponseEntity.ok(toDTO(updatedGrade));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        gradeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    private GradeDTO toDTO(Grade grade) {
        return new GradeDTO(grade.getId(), grade.getName(), grade.getCareer().getId());
    }
    
    private Grade toEntity(GradeDTO dto) {
        Career career = careerService.findById(dto.careerId())
            .orElseThrow(() -> new IllegalArgumentException("Career not found with id: " + dto.careerId()));
        return new Grade(dto.name(), career);
    }
}
