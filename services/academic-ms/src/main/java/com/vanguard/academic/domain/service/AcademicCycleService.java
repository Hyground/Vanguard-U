package com.vanguard.academic.domain.service;

import com.vanguard.academic.domain.model.AcademicCycle;
import com.vanguard.academic.domain.repository.AcademicCycleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class AcademicCycleService {
    
    private final AcademicCycleRepository academicCycleRepository;
    
    public AcademicCycleService(AcademicCycleRepository academicCycleRepository) {
        this.academicCycleRepository = academicCycleRepository;
    }
    
    @Transactional(readOnly = true)
    public List<AcademicCycle> findAll() {
        return academicCycleRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Optional<AcademicCycle> findById(Long id) {
        return academicCycleRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<AcademicCycle> findByYear(Integer year) {
        return academicCycleRepository.findByYear(year);
    }
    
    @Transactional(readOnly = true)
    public Optional<AcademicCycle> findActiveCycle() {
        return academicCycleRepository.findByActiveTrue();
    }
    
    public AcademicCycle save(AcademicCycle academicCycle) {
        if (academicCycleRepository.existsByYear(academicCycle.getYear())) {
            throw new IllegalArgumentException("Academic cycle with year '" + academicCycle.getYear() + "' already exists");
        }
        return academicCycleRepository.save(academicCycle);
    }
    
    public AcademicCycle update(Long id, AcademicCycle academicCycle) {
        return academicCycleRepository.findById(id)
            .map(existingCycle -> {
                if (!existingCycle.getYear().equals(academicCycle.getYear()) && 
                    academicCycleRepository.existsByYear(academicCycle.getYear())) {
                    throw new IllegalArgumentException("Academic cycle with year '" + academicCycle.getYear() + "' already exists");
                }
                existingCycle.setYear(academicCycle.getYear());
                existingCycle.setActive(academicCycle.isActive());
                return academicCycleRepository.save(existingCycle);
            })
            .orElseThrow(() -> new IllegalArgumentException("Academic cycle not found with id: " + id));
    }
    
    public AcademicCycle activateCycle(Long id) {
        return academicCycleRepository.findById(id)
            .map(cycle -> {
                academicCycleRepository.findByActiveTrue()
                    .ifPresent(activeCycle -> {
                        activeCycle.setActive(false);
                        academicCycleRepository.save(activeCycle);
                    });
                cycle.setActive(true);
                return academicCycleRepository.save(cycle);
            })
            .orElseThrow(() -> new IllegalArgumentException("Academic cycle not found with id: " + id));
    }
    
    public void deleteById(Long id) {
        if (!academicCycleRepository.existsById(id)) {
            throw new IllegalArgumentException("Academic cycle not found with id: " + id);
        }
        academicCycleRepository.deleteById(id);
    }
}
