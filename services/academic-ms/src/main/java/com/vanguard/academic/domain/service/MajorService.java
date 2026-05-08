package com.vanguard.academic.domain.service;

import com.vanguard.academic.domain.model.Major;
import com.vanguard.academic.domain.repository.MajorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MajorService {
    
    private final MajorRepository majorRepository;
    
    public MajorService(MajorRepository majorRepository) {
        this.majorRepository = majorRepository;
    }
    
    @Transactional(readOnly = true)
    public List<Major> findAll() {
        return majorRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Optional<Major> findById(Long id) {
        return majorRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Major> findByName(String name) {
        return majorRepository.findByName(name);
    }
    
    @Transactional(readOnly = true)
    public List<Major> findByNameContaining(String name) {
        return majorRepository.findByNameContainingIgnoreCase(name);
    }
    
    public Major save(Major major) {
        if (majorRepository.existsByName(major.getName())) {
            throw new IllegalArgumentException("Major with name '" + major.getName() + "' already exists");
        }
        return majorRepository.save(major);
    }
    
    public Major update(Long id, Major major) {
        return majorRepository.findById(id)
            .map(existingMajor -> {
                if (!existingMajor.getName().equals(major.getName()) &&
                    majorRepository.existsByName(major.getName())) {
                    throw new IllegalArgumentException("Major with name '" + major.getName() + "' already exists");
                }
                existingMajor.setName(major.getName());
                return majorRepository.save(existingMajor);
            })
            .orElseThrow(() -> new IllegalArgumentException("Major not found with id: " + id));
    }
    
    public void deleteById(Long id) {
        if (!majorRepository.existsById(id)) {
            throw new IllegalArgumentException("Major not found with id: " + id);
        }
        majorRepository.deleteById(id);
    }
}
