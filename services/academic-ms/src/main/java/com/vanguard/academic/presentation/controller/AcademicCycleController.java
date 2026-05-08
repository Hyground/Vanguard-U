package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.AcademicCycleDTO;
import com.vanguard.academic.domain.model.AcademicCycle;
import com.vanguard.academic.domain.service.AcademicCycleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/academic-cycles")
public class AcademicCycleController {
    
    private final AcademicCycleService academicCycleService;
    
    public AcademicCycleController(AcademicCycleService academicCycleService) {
        this.academicCycleService = academicCycleService;
    }
    
    @GetMapping
    public ResponseEntity<List<AcademicCycleDTO>> getAllAcademicCycles() {
        List<AcademicCycle> cycles = academicCycleService.findAll();
        List<AcademicCycleDTO> cycleDTOs = cycles.stream()
            .map(this::toDTO)
            .toList();
        return ResponseEntity.ok(cycleDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<AcademicCycleDTO> getAcademicCycleById(@PathVariable Long id) {
        return academicCycleService.findById(id)
            .map(cycle -> ResponseEntity.ok(toDTO(cycle)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/active")
    public ResponseEntity<AcademicCycleDTO> getActiveAcademicCycle() {
        return academicCycleService.findActiveCycle()
            .map(cycle -> ResponseEntity.ok(toDTO(cycle)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<AcademicCycleDTO> createAcademicCycle(@Valid @RequestBody AcademicCycleDTO cycleDTO) {
        AcademicCycle cycle = toEntity(cycleDTO);
        AcademicCycle savedCycle = academicCycleService.save(cycle);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedCycle));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<AcademicCycleDTO> updateAcademicCycle(@PathVariable Long id, @Valid @RequestBody AcademicCycleDTO cycleDTO) {
        AcademicCycle cycle = toEntity(cycleDTO);
        AcademicCycle updatedCycle = academicCycleService.update(id, cycle);
        return ResponseEntity.ok(toDTO(updatedCycle));
    }
    
    @PutMapping("/{id}/activate")
    public ResponseEntity<AcademicCycleDTO> activateAcademicCycle(@PathVariable Long id) {
        AcademicCycle activatedCycle = academicCycleService.activateCycle(id);
        return ResponseEntity.ok(toDTO(activatedCycle));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAcademicCycle(@PathVariable Long id) {
        academicCycleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    private AcademicCycleDTO toDTO(AcademicCycle cycle) {
        return new AcademicCycleDTO(cycle.getId(), cycle.getYear(), cycle.isActive());
    }
    
    private AcademicCycle toEntity(AcademicCycleDTO dto) {
        return new AcademicCycle(dto.year(), dto.active());
    }
}
