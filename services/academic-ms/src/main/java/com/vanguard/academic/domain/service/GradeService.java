package com.vanguard.academic.domain.service;

import com.vanguard.academic.domain.model.Grade;
import com.vanguard.academic.domain.repository.GradeRepository;
import com.vanguard.academic.domain.repository.CareerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class GradeService {
    
    private final GradeRepository gradeRepository;
    private final CareerRepository careerRepository;
    
    public GradeService(GradeRepository gradeRepository, CareerRepository careerRepository) {
        this.gradeRepository = gradeRepository;
        this.careerRepository = careerRepository;
    }
    
    @Transactional(readOnly = true)
    public List<Grade> findAll() {
        return gradeRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Optional<Grade> findById(Long id) {
        return gradeRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public List<Grade> findByCareerId(Long careerId) {
        if (!careerRepository.existsById(careerId)) {
            throw new IllegalArgumentException("Career not found with id: " + careerId);
        }
        return gradeRepository.findByCareerId(careerId);
    }
    
    @Transactional(readOnly = true)
    public List<Grade> findByNameContaining(String name) {
        return gradeRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Grade save(Grade grade) {
        if (!careerRepository.existsById(grade.getCareer().getId())) {
            throw new IllegalArgumentException("Career not found with id: " + grade.getCareer().getId());
        }
        
        if (gradeRepository.existsByNameAndCareerId(grade.getName(), grade.getCareer().getId())) {
            throw new IllegalArgumentException("Grade with name '" + grade.getName() + 
                "' already exists for this career");
        }
        return gradeRepository.save(grade);
    }
    
    public Grade update(Long id, Grade grade) {
        return gradeRepository.findById(id)
            .map(existingGrade -> {
                if (!careerRepository.existsById(grade.getCareer().getId())) {
                    throw new IllegalArgumentException("Career not found with id: " + grade.getCareer().getId());
                }
                
                if ((!existingGrade.getName().equals(grade.getName()) || 
                     !existingGrade.getCareer().getId().equals(grade.getCareer().getId())) &&
                    gradeRepository.existsByNameAndCareerId(grade.getName(), grade.getCareer().getId())) {
                    throw new IllegalArgumentException("Grade with name '" + grade.getName() + 
                        "' already exists for this career");
                }
                
                existingGrade.setName(grade.getName());
                existingGrade.setCareer(grade.getCareer());
                return gradeRepository.save(existingGrade);
            })
            .orElseThrow(() -> new IllegalArgumentException("Grade not found with id: " + id));
    }
    
    public void deleteById(Long id) {
        if (!gradeRepository.existsById(id)) {
            throw new IllegalArgumentException("Grade not found with id: " + id);
        }
        gradeRepository.deleteById(id);
    }
}
