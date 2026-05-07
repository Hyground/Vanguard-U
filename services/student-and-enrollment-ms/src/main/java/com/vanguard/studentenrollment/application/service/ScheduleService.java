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
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ScheduleService {

    private static final Set<String> ALLOWED_DAYS = Set.of(
            "MONDAY",
            "TUESDAY",
            "WEDNESDAY",
            "THURSDAY",
            "FRIDAY",
            "SATURDAY",
            "SUNDAY"
    );

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

    @Transactional(readOnly = true)
    public List<ScheduleResponse> findByClassroomAndDay(Integer classroomId, String dayOfWeek) {
        String normalizedDay = normalizeDayOfWeek(dayOfWeek);
        validateDayOfWeek(normalizedDay);
        return scheduleRepository.findByClassroomIdAndDayOfWeek(classroomId, normalizedDay)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ScheduleResponse> findByTeacherAndDay(Integer teacherId, String dayOfWeek) {
        String normalizedDay = normalizeDayOfWeek(dayOfWeek);
        validateDayOfWeek(normalizedDay);
        return scheduleRepository.findByTeacherIdAndDayOfWeek(teacherId, normalizedDay)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public ScheduleResponse create(ScheduleRequest request) {
        TeacherAssignment teacherAssignment = getTeacherAssignment(request.teacherAssignmentId());
        String dayOfWeek = normalizeDayOfWeek(request.dayOfWeek());
        validateScheduleRules(request, teacherAssignment, dayOfWeek, null);

        Schedule schedule = StudentEnrollmentMapper.toEntity(request, teacherAssignment);
        schedule.setDayOfWeek(dayOfWeek);
        Schedule savedSchedule = scheduleRepository.save(schedule);
        return StudentEnrollmentMapper.toResponse(savedSchedule);
    }

    @Transactional
    public ScheduleResponse update(Integer id, ScheduleRequest request) {
        Schedule schedule = getSchedule(id);
        TeacherAssignment teacherAssignment = getTeacherAssignment(request.teacherAssignmentId());
        String dayOfWeek = normalizeDayOfWeek(request.dayOfWeek());
        validateScheduleRules(request, teacherAssignment, dayOfWeek, id);

        StudentEnrollmentMapper.updateEntity(schedule, request, teacherAssignment);
        schedule.setDayOfWeek(dayOfWeek);
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

    private void validateScheduleRules(
            ScheduleRequest request,
            TeacherAssignment teacherAssignment,
            String dayOfWeek,
            Integer currentScheduleId
    ) {
        validateTimeRange(request);
        validateDayOfWeek(dayOfWeek);
        ensureTeacherScheduleIsAvailable(request, teacherAssignment, dayOfWeek, currentScheduleId);
        ensureClassroomScheduleIsAvailable(request, dayOfWeek, currentScheduleId);
    }

    private void validateTimeRange(ScheduleRequest request) {
        if (request.startTime() == null || request.endTime() == null) {
            return;
        }

        if (!request.startTime().isBefore(request.endTime())) {
            throw new BusinessRuleException("Schedule start time must be before end time.");
        }
    }

    private String normalizeDayOfWeek(String dayOfWeek) {
        if (dayOfWeek == null || dayOfWeek.isBlank()) {
            return dayOfWeek;
        }

        return dayOfWeek.trim().toUpperCase(Locale.ROOT);
    }

    private void validateDayOfWeek(String dayOfWeek) {
        if (dayOfWeek == null || dayOfWeek.isBlank()) {
            return;
        }

        if (!ALLOWED_DAYS.contains(dayOfWeek)) {
            throw new BusinessRuleException(
                    "Schedule day of week must be one of: MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY."
            );
        }
    }

    private void ensureTeacherScheduleIsAvailable(
            ScheduleRequest request,
            TeacherAssignment teacherAssignment,
            String dayOfWeek,
            Integer currentScheduleId
    ) {
        if (dayOfWeek == null || request.startTime() == null || request.endTime() == null) {
            return;
        }

        if (teacherAssignment.getTeacherId() == null) {
            return;
        }

        scheduleRepository.findByTeacherIdAndDayOfWeek(teacherAssignment.getTeacherId(), dayOfWeek)
                .stream()
                .filter(schedule -> !Objects.equals(schedule.getId(), currentScheduleId))
                .filter(schedule -> overlaps(schedule, request.startTime(), request.endTime()))
                .findAny()
                .ifPresent(schedule -> {
                    throw new BusinessRuleException("Teacher already has a schedule in this time range.");
                });
    }

    private void ensureClassroomScheduleIsAvailable(
            ScheduleRequest request,
            String dayOfWeek,
            Integer currentScheduleId
    ) {
        if (request.classroomId() == null || dayOfWeek == null || request.startTime() == null || request.endTime() == null) {
            return;
        }

        scheduleRepository.findByClassroomIdAndDayOfWeek(request.classroomId(), dayOfWeek)
                .stream()
                .filter(schedule -> !Objects.equals(schedule.getId(), currentScheduleId))
                .filter(schedule -> overlaps(schedule, request.startTime(), request.endTime()))
                .findAny()
                .ifPresent(schedule -> {
                    throw new BusinessRuleException("Classroom already has a schedule in this time range.");
                });
    }

    private boolean overlaps(Schedule schedule, LocalTime startTime, LocalTime endTime) {
        if (schedule.getStartTime() == null || schedule.getEndTime() == null) {
            return false;
        }

        return startTime.isBefore(schedule.getEndTime()) && endTime.isAfter(schedule.getStartTime());
    }
}
