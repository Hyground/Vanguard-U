package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.MajorDTO;
import com.vanguard.academic.domain.model.Major;
import com.vanguard.academic.domain.service.MajorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/majors", "/api/v1/careers"})
public class MajorController {
    
    private final MajorService majorService;
    
    public MajorController(MajorService majorService) {
        this.majorService = majorService;
    }
    
    @GetMapping
    public ResponseEntity<List<MajorDTO>> getAllMajors() {
        List<Major> majors = majorService.findAll();
        List<MajorDTO> majorDTOs = majors.stream()
            .map(this::toDTO)
            .toList();
        return ResponseEntity.ok(majorDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MajorDTO> getMajorById(@PathVariable Long id) {
        return majorService.findById(id)
            .map(major -> ResponseEntity.ok(toDTO(major)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<MajorDTO>> searchMajors(@RequestParam String name) {
        List<Major> majors = majorService.findByNameContaining(name);
        List<MajorDTO> majorDTOs = majors.stream()
            .map(this::toDTO)
            .toList();
        return ResponseEntity.ok(majorDTOs);
    }
    
    @PostMapping
    public ResponseEntity<MajorDTO> createMajor(@Valid @RequestBody MajorDTO majorDTO) {
        Major major = toEntity(majorDTO);
        Major savedMajor = majorService.save(major);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedMajor));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<MajorDTO> updateMajor(@PathVariable Long id, @Valid @RequestBody MajorDTO majorDTO) {
        Major major = toEntity(majorDTO);
        Major updatedMajor = majorService.update(id, major);
        return ResponseEntity.ok(toDTO(updatedMajor));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMajor(@PathVariable Long id) {
        majorService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    private MajorDTO toDTO(Major major) {
        return new MajorDTO(major.getId(), major.getName());
    }
    
    private Major toEntity(MajorDTO dto) {
        return new Major(dto.name());
    }
}
