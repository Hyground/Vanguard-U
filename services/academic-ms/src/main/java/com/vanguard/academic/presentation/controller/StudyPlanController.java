package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.CatalogItemDTO;
import com.vanguard.academic.domain.model.StudyPlan;
import com.vanguard.academic.domain.repository.StudyPlanRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/study-plans")
public class StudyPlanController {

    private final StudyPlanRepository repository;

    public StudyPlanController(StudyPlanRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Cacheable(cacheNames = "academicCatalogs", key = "'study-plans:all'")
    public List<CatalogItemDTO> findAll() {
        return repository.findAll().stream().map(this::toDTO).toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<CatalogItemDTO> findById(@PathVariable Long id) {
        return repository.findById(id)
            .map(item -> ResponseEntity.ok(toDTO(item)))
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<List<CatalogItemDTO>> search(@RequestParam String name) {
        return ResponseEntity.ok(repository.findByNameContainingIgnoreCase(name).stream().map(this::toDTO).toList());
    }

    @PostMapping
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<CatalogItemDTO> create(@Valid @RequestBody CatalogItemDTO dto) {
        if (repository.existsByName(dto.name())) {
            throw new IllegalArgumentException("Study plan with name '" + dto.name() + "' already exists");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(repository.save(new StudyPlan(dto.name()))));
    }

    @PutMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<CatalogItemDTO> update(@PathVariable Long id, @Valid @RequestBody CatalogItemDTO dto) {
        StudyPlan item = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Study plan not found with id: " + id));
        item.setName(dto.name());
        return ResponseEntity.ok(toDTO(repository.save(item)));
    }

    @DeleteMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Study plan not found with id: " + id);
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private CatalogItemDTO toDTO(StudyPlan item) {
        return new CatalogItemDTO(item.getId(), item.getName());
    }
}
