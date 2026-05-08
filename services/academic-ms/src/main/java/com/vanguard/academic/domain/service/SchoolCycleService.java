package com.vanguard.academic.domain.service;

import com.vanguard.academic.domain.model.SchoolCycle;
import com.vanguard.academic.domain.repository.SchoolCycleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class SchoolCycleService {
    
    private final SchoolCycleRepository schoolCycleRepository;
    
    public SchoolCycleService(SchoolCycleRepository schoolCycleRepository) {
        this.schoolCycleRepository = schoolCycleRepository;
    }
    
    @Transactional(readOnly = true)
    public List<SchoolCycle> findAll() {
        return schoolCycleRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Optional<SchoolCycle> findById(Long id) {
        return schoolCycleRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<SchoolCycle> findByYear(Integer year) {
        return schoolCycleRepository.findByYear(year);
    }
    
    @Transactional(readOnly = true)
    public Optional<SchoolCycle> findActiveCycle() {
        return schoolCycleRepository.findByActiveTrue();
    }
    
    public SchoolCycle save(SchoolCycle schoolCycle) {
        if (schoolCycleRepository.existsByYear(schoolCycle.getYear())) {
            throw new IllegalArgumentException("School cycle with year '" + schoolCycle.getYear() + "' already exists");
        }
        return schoolCycleRepository.save(schoolCycle);
    }
    
    public SchoolCycle update(Long id, SchoolCycle schoolCycle) {
        return schoolCycleRepository.findById(id)
            .map(existingCycle -> {
                if (!existingCycle.getYear().equals(schoolCycle.getYear()) &&
                    schoolCycleRepository.existsByYear(schoolCycle.getYear())) {
                    throw new IllegalArgumentException("School cycle with year '" + schoolCycle.getYear() + "' already exists");
                }
                existingCycle.setYear(schoolCycle.getYear());
                existingCycle.setActive(schoolCycle.isActive());
                return schoolCycleRepository.save(existingCycle);
            })
            .orElseThrow(() -> new IllegalArgumentException("School cycle not found with id: " + id));
    }
    
    public SchoolCycle activateCycle(Long id) {
        return schoolCycleRepository.findById(id)
            .map(cycle -> {
                schoolCycleRepository.findByActiveTrue()
                    .ifPresent(activeCycle -> {
                        activeCycle.setActive(false);
                        schoolCycleRepository.save(activeCycle);
                    });
                cycle.setActive(true);
                return schoolCycleRepository.save(cycle);
            })
            .orElseThrow(() -> new IllegalArgumentException("School cycle not found with id: " + id));
    }
    
    public void deleteById(Long id) {
        if (!schoolCycleRepository.existsById(id)) {
            throw new IllegalArgumentException("School cycle not found with id: " + id);
        }
        schoolCycleRepository.deleteById(id);
    }
}
