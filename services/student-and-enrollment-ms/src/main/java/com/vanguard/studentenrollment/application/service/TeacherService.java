package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.TeacherRequest;
import com.vanguard.studentenrollment.application.dto.TeacherResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Teacher;
import com.vanguard.studentenrollment.domain.repository.TeacherAssignmentRepository;
import com.vanguard.studentenrollment.domain.repository.TeacherRepository;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public TeacherService(TeacherRepository teacherRepository, TeacherAssignmentRepository teacherAssignmentRepository) {
        this.teacherRepository = teacherRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
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

    @Transactional(readOnly = true)
    public TeacherResponse findByCui(String cui) {
        return teacherRepository.findByCui(cui)
                .map(StudentEnrollmentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with CUI: " + cui));
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
        ensureTeacherCanBeDeleted(id);
        teacherRepository.delete(teacher);
    }

    private Teacher getTeacher(Integer id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
    }

    private void ensureCuiIsAvailable(String cui, Integer currentTeacherId) {
        teacherRepository.findByCui(cui)
                .filter(existingTeacher -> !Objects.equals(existingTeacher.getId(), currentTeacherId))
                .ifPresent(existingTeacher -> {
                    throw new BusinessRuleException("A teacher with this CUI already exists.");
                });
    }

    private void ensureTeacherCanBeDeleted(Integer teacherId) {
        if (teacherAssignmentRepository.existsByTeacher_Id(teacherId)) {
            throw new BusinessRuleException("Teacher cannot be deleted because it has assignments.");
        }
    }
}
