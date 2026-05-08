package com.vanguard.academic.domain.service;

import com.vanguard.academic.domain.model.Classroom;
import com.vanguard.academic.domain.repository.ClassroomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ClassroomService {
    
    private final ClassroomRepository classroomRepository;
    
    public ClassroomService(ClassroomRepository classroomRepository) {
        this.classroomRepository = classroomRepository;
    }
    
    @Transactional(readOnly = true)
    public List<Classroom> findAll() {
        return classroomRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Optional<Classroom> findById(Long id) {
        return classroomRepository.findById(id);
    }
    
    @Transactional(readOnly = true)
    public Optional<Classroom> findByCode(String code) {
        return classroomRepository.findByCode(code);
    }
    
    public Classroom save(Classroom classroom) {
        if (classroomRepository.existsByCode(classroom.getCode())) {
            throw new IllegalArgumentException("Classroom with code '" + classroom.getCode() + "' already exists");
        }
        return classroomRepository.save(classroom);
    }
    
    public Classroom update(Long id, Classroom classroom) {
        return classroomRepository.findById(id)
            .map(existingClassroom -> {
                if (!existingClassroom.getCode().equals(classroom.getCode()) && 
                    classroomRepository.existsByCode(classroom.getCode())) {
                    throw new IllegalArgumentException("Classroom with code '" + classroom.getCode() + "' already exists");
                }
                existingClassroom.setCode(classroom.getCode());
                existingClassroom.setCapacity(classroom.getCapacity());
                return classroomRepository.save(existingClassroom);
            })
            .orElseThrow(() -> new IllegalArgumentException("Classroom not found with id: " + id));
    }
    
    public void deleteById(Long id) {
        if (!classroomRepository.existsById(id)) {
            throw new IllegalArgumentException("Classroom not found with id: " + id);
        }
        classroomRepository.deleteById(id);
    }
}
