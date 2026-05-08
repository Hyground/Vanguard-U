package com.vanguard.academic.domain.service;

import com.vanguard.academic.domain.model.Teacher;
import com.vanguard.academic.domain.repository.TeacherRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    @Transactional(readOnly = true)
    public List<Teacher> findAll() {
        return teacherRepository.findAll();
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
    public List<Teacher> searchByName(String name) {
        return teacherRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(name, name);
    }

    public Teacher save(Teacher teacher) {
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
