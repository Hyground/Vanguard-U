package com.vanguard.academic.domain.service;

import com.vanguard.academic.domain.model.Teacher;
import com.vanguard.academic.domain.repository.TeacherRepository;
import com.vanguard.academic.infrastructure.persistence.ExternalReferenceValidator;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final ExternalReferenceValidator externalReferenceValidator;

    public TeacherService(TeacherRepository teacherRepository, ExternalReferenceValidator externalReferenceValidator) {
        this.teacherRepository = teacherRepository;
        this.externalReferenceValidator = externalReferenceValidator;
    }

    @Transactional(readOnly = true)
    public Page<Teacher> findAll(Pageable pageable) {
        return teacherRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Optional<Teacher> findById(Long id) {
        return teacherRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<Teacher> findByUserId(Long userId) {
        return teacherRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Page<Teacher> searchByName(String name, Pageable pageable) {
        return teacherRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(name, name, pageable);
    }

    public Teacher save(Teacher teacher) {
        externalReferenceValidator.ensureUserExists(teacher.getUserId());

        if (teacherRepository.existsByCui(teacher.getCui())) {
            throw new IllegalArgumentException("Teacher with CUI '" + teacher.getCui() + "' already exists");
        }
        if (teacherRepository.existsByUserId(teacher.getUserId())) {
            throw new IllegalArgumentException("Teacher with user id '" + teacher.getUserId() + "' already exists");
        }
        return teacherRepository.save(teacher);
    }

    public Teacher update(Long id, Teacher teacher) {
        return teacherRepository.findById(id)
            .map(existingTeacher -> {
                externalReferenceValidator.ensureUserExists(teacher.getUserId());

                if (!existingTeacher.getCui().equals(teacher.getCui()) && teacherRepository.existsByCui(teacher.getCui())) {
                    throw new IllegalArgumentException("Teacher with CUI '" + teacher.getCui() + "' already exists");
                }
                if (!existingTeacher.getUserId().equals(teacher.getUserId()) && teacherRepository.existsByUserId(teacher.getUserId())) {
                    throw new IllegalArgumentException("Teacher with user id '" + teacher.getUserId() + "' already exists");
                }
                existingTeacher.setCui(teacher.getCui());
                existingTeacher.setFirstName(teacher.getFirstName());
                existingTeacher.setLastName(teacher.getLastName());
                existingTeacher.setEmail(teacher.getEmail());
                existingTeacher.setUserId(teacher.getUserId());
                return teacherRepository.save(existingTeacher);
            })
            .orElseThrow(() -> new IllegalArgumentException("Teacher not found with id: " + id));
    }

    public void deleteById(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new IllegalArgumentException("Teacher not found with id: " + id);
        }
        teacherRepository.deleteById(id);
    }
}
