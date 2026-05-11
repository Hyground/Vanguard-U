package com.vanguard.academic.presentation.controller;

import com.vanguard.academic.application.dto.CatalogItemDTO;
import com.vanguard.academic.domain.model.BimonthlyUnit;
import com.vanguard.academic.domain.repository.BimonthlyUnitRepository;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/bimonthly-units")
public class BimonthlyUnitController {

    private final BimonthlyUnitRepository repository;

    public BimonthlyUnitController(BimonthlyUnitRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    @Cacheable(cacheNames = "academicCatalogs", key = "'bimonthly-units:all'")
    public ResponseEntity<List<CatalogItemDTO>> findAll() {
        return ResponseEntity.ok(repository.findAll().stream().map(this::toDTO).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CatalogItemDTO> findById(@PathVariable Long id) {
        return repository.findById(id)
            .map(item -> ResponseEntity.ok(toDTO(item)))
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<CatalogItemDTO> create(@Valid @RequestBody CatalogItemDTO dto) {
        if (repository.existsByName(dto.name())) {
            throw new IllegalArgumentException("Bimonthly unit with name '" + dto.name() + "' already exists");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(repository.save(new BimonthlyUnit(dto.name()))));
    }

    @PutMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<CatalogItemDTO> update(@PathVariable Long id, @Valid @RequestBody CatalogItemDTO dto) {
        BimonthlyUnit item = repository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Bimonthly unit not found with id: " + id));
        item.setName(dto.name());
        return ResponseEntity.ok(toDTO(repository.save(item)));
    }

    @DeleteMapping("/{id}")
    @CacheEvict(cacheNames = "academicCatalogs", allEntries = true)
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Bimonthly unit not found with id: " + id);
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private CatalogItemDTO toDTO(BimonthlyUnit item) {
        return new CatalogItemDTO(item.getId(), item.getName());
    }
}
