package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.SchoolCycleDTO;
import com.vanguard.academic.domain.model.SchoolCycle;
import com.vanguard.academic.domain.service.SchoolCycleService;
import jakarta.validation.Valid;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/school-cycles")
public class SchoolCycleController {
    
    private final SchoolCycleService schoolCycleService;
    
    public SchoolCycleController(SchoolCycleService schoolCycleService) {
        this.schoolCycleService = schoolCycleService;
    }
    
    @GetMapping
    @Cacheable(cacheNames = "academicCatalogs", key = "'school-cycles:all'")
    public List<SchoolCycleDTO> getAllSchoolCycles() {
        List<SchoolCycle> cycles = schoolCycleService.findAll();
        return cycles.stream()
            .map(this::toDTO)
            .toList();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<SchoolCycleDTO> getSchoolCycleById(@PathVariable Long id) {
        return schoolCycleService.findById(id)
            .map(cycle -> ResponseEntity.ok(toDTO(cycle)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/active")
    public ResponseEntity<SchoolCycleDTO> getActiveSchoolCycle() {
        return schoolCycleService.findActiveCycle()
            .map(cycle -> ResponseEntity.ok(toDTO(cycle)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<SchoolCycleDTO> createSchoolCycle(@Valid @RequestBody SchoolCycleDTO cycleDTO) {
        SchoolCycle cycle = toEntity(cycleDTO);
        SchoolCycle savedCycle = schoolCycleService.save(cycle);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedCycle));
    }
    
    @PutMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<SchoolCycleDTO> updateSchoolCycle(@PathVariable Long id, @Valid @RequestBody SchoolCycleDTO cycleDTO) {
        SchoolCycle cycle = toEntity(cycleDTO);
        SchoolCycle updatedCycle = schoolCycleService.update(id, cycle);
        return ResponseEntity.ok(toDTO(updatedCycle));
    }
    
    @PutMapping("/{id}/activate")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<SchoolCycleDTO> activateSchoolCycle(@PathVariable Long id) {
        SchoolCycle activatedCycle = schoolCycleService.activateCycle(id);
        return ResponseEntity.ok(toDTO(activatedCycle));
    }
    
    @DeleteMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<Void> deleteSchoolCycle(@PathVariable Long id) {
        schoolCycleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    private SchoolCycleDTO toDTO(SchoolCycle cycle) {
        return new SchoolCycleDTO(cycle.getId(), cycle.getYear(), cycle.isActive());
    }
    
    private SchoolCycle toEntity(SchoolCycleDTO dto) {
        return new SchoolCycle(dto.year(), dto.active());
    }
}
