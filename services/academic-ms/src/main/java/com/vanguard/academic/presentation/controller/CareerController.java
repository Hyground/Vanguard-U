package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.CareerDTO;
import com.vanguard.academic.domain.model.Career;
import com.vanguard.academic.domain.service.CareerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/careers")
public class CareerController {
    
    private final CareerService careerService;
    
    public CareerController(CareerService careerService) {
        this.careerService = careerService;
    }
    
    @GetMapping
    public ResponseEntity<List<CareerDTO>> getAllCareers() {
        List<Career> careers = careerService.findAll();
        List<CareerDTO> careerDTOs = careers.stream()
            .map(this::toDTO)
            .toList();
        return ResponseEntity.ok(careerDTOs);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CareerDTO> getCareerById(@PathVariable Long id) {
        return careerService.findById(id)
            .map(career -> ResponseEntity.ok(toDTO(career)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<CareerDTO>> searchCareers(@RequestParam String name) {
        List<Career> careers = careerService.findByNameContaining(name);
        List<CareerDTO> careerDTOs = careers.stream()
            .map(this::toDTO)
            .toList();
        return ResponseEntity.ok(careerDTOs);
    }
    
    @PostMapping
    public ResponseEntity<CareerDTO> createCareer(@Valid @RequestBody CareerDTO careerDTO) {
        Career career = toEntity(careerDTO);
        Career savedCareer = careerService.save(career);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedCareer));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CareerDTO> updateCareer(@PathVariable Long id, @Valid @RequestBody CareerDTO careerDTO) {
        Career career = toEntity(careerDTO);
        Career updatedCareer = careerService.update(id, career);
        return ResponseEntity.ok(toDTO(updatedCareer));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCareer(@PathVariable Long id) {
        careerService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    private CareerDTO toDTO(Career career) {
        return new CareerDTO(career.getId(), career.getName());
    }
    
    private Career toEntity(CareerDTO dto) {
        return new Career(dto.name());
    }
}
