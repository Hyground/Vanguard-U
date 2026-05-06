package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.ScheduleRequest;
import com.vanguard.studentenrollment.application.dto.ScheduleResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Schedule;
import com.vanguard.studentenrollment.domain.model.TeacherAssignment;
import com.vanguard.studentenrollment.domain.repository.ScheduleRepository;
import com.vanguard.studentenrollment.domain.repository.TeacherAssignmentRepository;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public ScheduleService(
            ScheduleRepository scheduleRepository,
            TeacherAssignmentRepository teacherAssignmentRepository
    ) {
        this.scheduleRepository = scheduleRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
    }

    @Transactional(readOnly = true)
    public Page<ScheduleResponse> findAll(Pageable pageable) {
        return scheduleRepository.findAll(pageable)
                .map(StudentEnrollmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ScheduleResponse findById(Integer id) {
        return StudentEnrollmentMapper.toResponse(getSchedule(id));
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> findByTeacherAssignmentId(Integer teacherAssignmentId) {
        return scheduleRepository.findByTeacherAssignment_Id(teacherAssignmentId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public ScheduleResponse create(ScheduleRequest request) {
        validateTimeRange(request);
        TeacherAssignment teacherAssignment = getTeacherAssignment(request.teacherAssignmentId());

        Schedule schedule = StudentEnrollmentMapper.toEntity(request, teacherAssignment);
        Schedule savedSchedule = scheduleRepository.save(schedule);
        return StudentEnrollmentMapper.toResponse(savedSchedule);
    }

    @Transactional
    public ScheduleResponse update(Integer id, ScheduleRequest request) {
        Schedule schedule = getSchedule(id);
        validateTimeRange(request);
        TeacherAssignment teacherAssignment = getTeacherAssignment(request.teacherAssignmentId());

        StudentEnrollmentMapper.updateEntity(schedule, request, teacherAssignment);
        return StudentEnrollmentMapper.toResponse(schedule);
    }

    @Transactional
    public void delete(Integer id) {
        Schedule schedule = getSchedule(id);
        scheduleRepository.delete(schedule);
    }

    private Schedule getSchedule(Integer id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found with id: " + id));
    }

    private TeacherAssignment getTeacherAssignment(Integer id) {
        return teacherAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher assignment not found with id: " + id));
    }

    private void validateTimeRange(ScheduleRequest request) {
        if (request.startTime() == null || request.endTime() == null) {
            return;
        }

        if (!request.startTime().isBefore(request.endTime())) {
            throw new BusinessRuleException("Schedule start time must be before end time.");
        }
    }
}
