package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.TeacherRequest;
import com.vanguard.studentenrollment.application.dto.TeacherResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Teacher;
import com.vanguard.studentenrollment.domain.repository.TeacherRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;

    public TeacherService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    @Transactional(readOnly = true)
    public Page<TeacherResponse> findAll(Pageable pageable) {
        return teacherRepository.findAll(pageable)
                .map(StudentEnrollmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TeacherResponse findById(Integer id) {
        return StudentEnrollmentMapper.toResponse(getTeacher(id));
    }

    @Transactional
    public TeacherResponse create(TeacherRequest request) {
        ensureCuiIsAvailable(request.cui(), null);

        Teacher teacher = StudentEnrollmentMapper.toEntity(request);
        Teacher savedTeacher = teacherRepository.save(teacher);
        return StudentEnrollmentMapper.toResponse(savedTeacher);
    }

    @Transactional
    public TeacherResponse update(Integer id, TeacherRequest request) {
        Teacher teacher = getTeacher(id);
        ensureCuiIsAvailable(request.cui(), id);

        StudentEnrollmentMapper.updateEntity(teacher, request);
        return StudentEnrollmentMapper.toResponse(teacher);
    }

    @Transactional
    public void delete(Integer id) {
        Teacher teacher = getTeacher(id);
        teacherRepository.delete(teacher);
    }

    private Teacher getTeacher(Integer id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
    }

    private void ensureCuiIsAvailable(String cui, Integer currentTeacherId) {
        teacherRepository.findByCui(cui)
                .filter(existingTeacher -> !existingTeacher.getId().equals(currentTeacherId))
                .ifPresent(existingTeacher -> {
                    throw new BusinessRuleException("A teacher with this CUI already exists.");
                });
    }
}
