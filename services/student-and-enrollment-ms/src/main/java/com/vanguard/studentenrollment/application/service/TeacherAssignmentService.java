package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.TeacherAssignmentRequest;
import com.vanguard.studentenrollment.application.dto.TeacherAssignmentResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.TeacherAssignment;
import com.vanguard.studentenrollment.domain.repository.ActivityRepository;
import com.vanguard.studentenrollment.domain.repository.AttendanceRepository;
import com.vanguard.studentenrollment.domain.repository.ScheduleRepository;
import com.vanguard.studentenrollment.domain.repository.TeacherAssignmentRepository;
import java.util.List;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TeacherAssignmentService {

    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final ScheduleRepository scheduleRepository;
    private final ActivityRepository activityRepository;
    private final AttendanceRepository attendanceRepository;

    public TeacherAssignmentService(
            TeacherAssignmentRepository teacherAssignmentRepository,
            ScheduleRepository scheduleRepository,
            ActivityRepository activityRepository,
            AttendanceRepository attendanceRepository
    ) {
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.scheduleRepository = scheduleRepository;
        this.activityRepository = activityRepository;
        this.attendanceRepository = attendanceRepository;
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
        return teacherAssignmentRepository.findByTeacherId(teacherId)
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
        ensureAssignmentIsAvailable(request, null);

        TeacherAssignment assignment = StudentEnrollmentMapper.toEntity(request);
        TeacherAssignment savedAssignment = teacherAssignmentRepository.save(assignment);
        return StudentEnrollmentMapper.toResponse(savedAssignment);
    }

    @Transactional
    public TeacherAssignmentResponse update(Integer id, TeacherAssignmentRequest request) {
        TeacherAssignment assignment = getTeacherAssignment(id);
        ensureAssignmentIsAvailable(request, id);

        StudentEnrollmentMapper.updateEntity(assignment, request);
        return StudentEnrollmentMapper.toResponse(assignment);
    }

    @Transactional
    public void delete(Integer id) {
        TeacherAssignment assignment = getTeacherAssignment(id);
        ensureTeacherAssignmentCanBeDeleted(id);
        teacherAssignmentRepository.delete(assignment);
    }

    private TeacherAssignment getTeacherAssignment(Integer id) {
        return teacherAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher assignment not found with id: " + id));
    }

    private void ensureAssignmentIsAvailable(TeacherAssignmentRequest request, Integer currentAssignmentId) {
        teacherAssignmentRepository.findByTeacherId(request.teacherId())
                .stream()
                .filter(assignment -> !Objects.equals(assignment.getId(), currentAssignmentId))
                .filter(assignment -> sameAssignment(assignment, request))
                .findAny()
                .ifPresent(assignment -> {
                    throw new BusinessRuleException("This teacher assignment already exists.");
                });
    }

    private boolean sameAssignment(TeacherAssignment assignment, TeacherAssignmentRequest request) {
        return sameValue(assignment.getTeacherId(), request.teacherId())
                && sameValue(assignment.getCourseId(), request.courseId())
                && sameValue(assignment.getGradeId(), request.gradeId())
                && sameValue(assignment.getSectionId(), request.sectionId());
    }

    private boolean sameValue(Integer left, Integer right) {
        return left == null ? right == null : left.equals(right);
    }

    private void ensureTeacherAssignmentCanBeDeleted(Integer teacherAssignmentId) {
        if (scheduleRepository.existsByTeacherAssignment_Id(teacherAssignmentId)) {
            throw new BusinessRuleException("Teacher assignment cannot be deleted because it has schedules.");
        }

        if (activityRepository.existsByTeacherAssignment_Id(teacherAssignmentId)) {
            throw new BusinessRuleException("Teacher assignment cannot be deleted because it has activities.");
        }

        if (attendanceRepository.existsByTeacherAssignment_Id(teacherAssignmentId)) {
            throw new BusinessRuleException("Teacher assignment cannot be deleted because it has attendance records.");
        }
    }
}
