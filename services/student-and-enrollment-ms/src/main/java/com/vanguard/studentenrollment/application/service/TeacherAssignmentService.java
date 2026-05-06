package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.TeacherAssignmentRequest;
import com.vanguard.studentenrollment.application.dto.TeacherAssignmentResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Teacher;
import com.vanguard.studentenrollment.domain.model.TeacherAssignment;
import com.vanguard.studentenrollment.domain.repository.TeacherAssignmentRepository;
import com.vanguard.studentenrollment.domain.repository.TeacherRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeacherAssignmentService {

    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final TeacherRepository teacherRepository;

    public TeacherAssignmentService(
            TeacherAssignmentRepository teacherAssignmentRepository,
            TeacherRepository teacherRepository
    ) {
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.teacherRepository = teacherRepository;
    }

    @Transactional(readOnly = true)
    public Page<TeacherAssignmentResponse> findAll(Pageable pageable) {
        return teacherAssignmentRepository.findAll(pageable)
                .map(StudentEnrollmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public TeacherAssignmentResponse findById(Integer id) {
        return StudentEnrollmentMapper.toResponse(getTeacherAssignment(id));
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentResponse> findByTeacherId(Integer teacherId) {
        return teacherAssignmentRepository.findByTeacher_Id(teacherId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TeacherAssignmentResponse> findByGradeAndSection(Integer gradeId, Integer sectionId) {
        return teacherAssignmentRepository.findByGradeIdAndSectionId(gradeId, sectionId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public TeacherAssignmentResponse create(TeacherAssignmentRequest request) {
        Teacher teacher = getTeacher(request.teacherId());
        ensureAssignmentIsAvailable(request, null);

        TeacherAssignment assignment = StudentEnrollmentMapper.toEntity(request, teacher);
        TeacherAssignment savedAssignment = teacherAssignmentRepository.save(assignment);
        return StudentEnrollmentMapper.toResponse(savedAssignment);
    }

    @Transactional
    public TeacherAssignmentResponse update(Integer id, TeacherAssignmentRequest request) {
        TeacherAssignment assignment = getTeacherAssignment(id);
        Teacher teacher = getTeacher(request.teacherId());
        ensureAssignmentIsAvailable(request, id);

        StudentEnrollmentMapper.updateEntity(assignment, request, teacher);
        return StudentEnrollmentMapper.toResponse(assignment);
    }

    @Transactional
    public void delete(Integer id) {
        TeacherAssignment assignment = getTeacherAssignment(id);
        teacherAssignmentRepository.delete(assignment);
    }

    private TeacherAssignment getTeacherAssignment(Integer id) {
        return teacherAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher assignment not found with id: " + id));
    }

    private Teacher getTeacher(Integer id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + id));
    }

    private void ensureAssignmentIsAvailable(TeacherAssignmentRequest request, Integer currentAssignmentId) {
        teacherAssignmentRepository.findByTeacher_Id(request.teacherId())
                .stream()
                .filter(assignment -> !assignment.getId().equals(currentAssignmentId))
                .filter(assignment -> sameAssignment(assignment, request))
                .findAny()
                .ifPresent(assignment -> {
                    throw new BusinessRuleException("This teacher assignment already exists.");
                });
    }

    private boolean sameAssignment(TeacherAssignment assignment, TeacherAssignmentRequest request) {
        return sameValue(assignment.getCourseId(), request.courseId())
                && sameValue(assignment.getGradeId(), request.gradeId())
                && sameValue(assignment.getSectionId(), request.sectionId());
    }

    private boolean sameValue(Integer left, Integer right) {
        return left == null ? right == null : left.equals(right);
    }
}
