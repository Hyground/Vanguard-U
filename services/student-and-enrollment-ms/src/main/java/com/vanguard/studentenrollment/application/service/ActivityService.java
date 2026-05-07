package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.ActivityRequest;
import com.vanguard.studentenrollment.application.dto.ActivityResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Activity;
import com.vanguard.studentenrollment.domain.model.TeacherAssignment;
import com.vanguard.studentenrollment.domain.repository.ActivityRepository;
import com.vanguard.studentenrollment.domain.repository.GradeRecordRepository;
import com.vanguard.studentenrollment.domain.repository.TeacherAssignmentRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;
    private final GradeRecordRepository gradeRecordRepository;

    public ActivityService(
            ActivityRepository activityRepository,
            TeacherAssignmentRepository teacherAssignmentRepository,
            GradeRecordRepository gradeRecordRepository
    ) {
        this.activityRepository = activityRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
        this.gradeRecordRepository = gradeRecordRepository;
    }

    @Transactional(readOnly = true)
    public Page<ActivityResponse> findAll(Pageable pageable) {
        return activityRepository.findAll(pageable)
                .map(StudentEnrollmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ActivityResponse findById(Integer id) {
        return StudentEnrollmentMapper.toResponse(getActivity(id));
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> findByTeacherAssignmentId(Integer teacherAssignmentId) {
        return activityRepository.findByTeacherAssignment_Id(teacherAssignmentId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public ActivityResponse create(ActivityRequest request) {
        TeacherAssignment teacherAssignment = getTeacherAssignment(request.teacherAssignmentId());
        Activity activity = StudentEnrollmentMapper.toEntity(request, teacherAssignment);
        Activity savedActivity = activityRepository.save(activity);
        return StudentEnrollmentMapper.toResponse(savedActivity);
    }

    @Transactional
    public ActivityResponse update(Integer id, ActivityRequest request) {
        Activity activity = getActivity(id);
        TeacherAssignment teacherAssignment = getTeacherAssignment(request.teacherAssignmentId());

        StudentEnrollmentMapper.updateEntity(activity, request, teacherAssignment);
        return StudentEnrollmentMapper.toResponse(activity);
    }

    @Transactional
    public void delete(Integer id) {
        Activity activity = getActivity(id);
        ensureActivityCanBeDeleted(id);
        activityRepository.delete(activity);
    }

    private Activity getActivity(Integer id) {
        return activityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Activity not found with id: " + id));
    }

    private TeacherAssignment getTeacherAssignment(Integer id) {
        return teacherAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher assignment not found with id: " + id));
    }

    private void ensureActivityCanBeDeleted(Integer activityId) {
        if (gradeRecordRepository.existsByActivity_Id(activityId)) {
            throw new BusinessRuleException("Activity cannot be deleted because it has grade records.");
        }
    }
}
