package com.vanguard.academic.domain.service;

import com.vanguard.academic.domain.model.Grade;
import com.vanguard.academic.domain.repository.GradeRepository;
import com.vanguard.academic.domain.repository.MajorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class GradeService {
    
    private final GradeRepository gradeRepository;
    private final MajorRepository majorRepository;
    
    public GradeService(GradeRepository gradeRepository, MajorRepository majorRepository) {
        this.gradeRepository = gradeRepository;
        this.majorRepository = majorRepository;
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
    public List<Grade> findByMajorId(Long majorId) {
        if (!majorRepository.existsById(majorId)) {
            throw new IllegalArgumentException("Major not found with id: " + majorId);
        }
        return gradeRepository.findByMajorId(majorId);
    }
    
    @Transactional(readOnly = true)
    public List<Grade> findByNameContaining(String name) {
        return gradeRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Grade save(Grade grade) {
        if (!majorRepository.existsById(grade.getMajor().getId())) {
            throw new IllegalArgumentException("Major not found with id: " + grade.getMajor().getId());
        }
        
        if (gradeRepository.existsByNameAndMajorId(grade.getName(), grade.getMajor().getId())) {
            throw new IllegalArgumentException("Grade with name '" + grade.getName() + 
                "' already exists for this major");
        }
        return gradeRepository.save(grade);
    }
    
    public Grade update(Long id, Grade grade) {
        return gradeRepository.findById(id)
            .map(existingGrade -> {
                if (!majorRepository.existsById(grade.getMajor().getId())) {
                    throw new IllegalArgumentException("Major not found with id: " + grade.getMajor().getId());
                }
                
                if ((!existingGrade.getName().equals(grade.getName()) || 
                     !existingGrade.getMajor().getId().equals(grade.getMajor().getId())) &&
                    gradeRepository.existsByNameAndMajorId(grade.getName(), grade.getMajor().getId())) {
                    throw new IllegalArgumentException("Grade with name '" + grade.getName() + 
                        "' already exists for this major");
                }
                
                existingGrade.setName(grade.getName());
                existingGrade.setMajor(grade.getMajor());
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
