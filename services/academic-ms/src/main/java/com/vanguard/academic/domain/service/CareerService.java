package com.vanguard.academic.domain.service;

import com.vanguard.academic.domain.model.Career;
import com.vanguard.academic.domain.repository.CareerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CareerService {
    
    private final CareerRepository careerRepository;
    
    public CareerService(CareerRepository careerRepository) {
        this.careerRepository = careerRepository;
    }
    
    @Transactional(readOnly = true)
    public List<Career> findAll() {
        return careerRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Optional<Career> findById(Long id) {
        return careerRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Career> findByName(String name) {
        return careerRepository.findByName(name);
    }
    
    @Transactional(readOnly = true)
    public List<Career> findByNameContaining(String name) {
        return careerRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Career save(Career career) {
        if (careerRepository.existsByName(career.getName())) {
            throw new IllegalArgumentException("Career with name '" + career.getName() + "' already exists");
        }
        return careerRepository.save(career);
    }
    
    public Career update(Long id, Career career) {
        return careerRepository.findById(id)
            .map(existingCareer -> {
                if (!existingCareer.getName().equals(career.getName()) && 
                    careerRepository.existsByName(career.getName())) {
                    throw new IllegalArgumentException("Career with name '" + career.getName() + "' already exists");
                }
                existingCareer.setName(career.getName());
                return careerRepository.save(existingCareer);
            })
            .orElseThrow(() -> new IllegalArgumentException("Career not found with id: " + id));
    }
    
    public void deleteById(Long id) {
        if (!careerRepository.existsById(id)) {
            throw new IllegalArgumentException("Career not found with id: " + id);
        }
        careerRepository.deleteById(id);
    }
}
