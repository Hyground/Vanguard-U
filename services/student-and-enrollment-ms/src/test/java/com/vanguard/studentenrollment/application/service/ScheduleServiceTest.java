package com.vanguard.studentenrollment.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;

import com.vanguard.studentenrollment.application.dto.ScheduleRequest;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.domain.model.Schedule;
import com.vanguard.studentenrollment.domain.model.TeacherAssignment;
import com.vanguard.studentenrollment.domain.repository.ScheduleRepository;
import com.vanguard.studentenrollment.domain.repository.TeacherAssignmentRepository;
import com.vanguard.studentenrollment.infrastructure.persistence.ExternalReferenceValidator;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock
    private ScheduleRepository scheduleRepository;

    @Mock
    private TeacherAssignmentRepository teacherAssignmentRepository;

    @Mock
    private ExternalReferenceValidator externalReferenceValidator;

    @InjectMocks
    private ScheduleService scheduleService;

    @Test
    void createRejectsUnsupportedDayOfWeek() {
        ScheduleRequest request = request("HOLIDAY", LocalTime.of(8, 0), LocalTime.of(9, 0));

        when(teacherAssignmentRepository.findById(1)).thenReturn(Optional.of(assignmentWithTeacher(5)));
        doNothing().when(externalReferenceValidator).ensureClassroomExists(7);

        assertThatThrownBy(() -> scheduleService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Schedule day of week must be one of");
    }

    @Test
    void createRejectsTeacherTimeOverlap() {
        Schedule existingSchedule = schedule(10, LocalTime.of(8, 30), LocalTime.of(9, 30));
        ScheduleRequest request = request("MONDAY", LocalTime.of(8, 0), LocalTime.of(9, 0));

        when(teacherAssignmentRepository.findById(1)).thenReturn(Optional.of(assignmentWithTeacher(5)));
        doNothing().when(externalReferenceValidator).ensureClassroomExists(7);
        when(scheduleRepository.findByTeacherIdAndDayOfWeek(5, "MONDAY")).thenReturn(List.of(existingSchedule));

        assertThatThrownBy(() -> scheduleService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Teacher already has a schedule in this time range.");
    }

    @Test
    void createRejectsClassroomTimeOverlap() {
        Schedule existingSchedule = schedule(10, LocalTime.of(8, 30), LocalTime.of(9, 30));
        ScheduleRequest request = request("MONDAY", LocalTime.of(8, 0), LocalTime.of(9, 0));

        when(teacherAssignmentRepository.findById(1)).thenReturn(Optional.of(assignmentWithTeacher(5)));
        doNothing().when(externalReferenceValidator).ensureClassroomExists(7);
        when(scheduleRepository.findByTeacherIdAndDayOfWeek(5, "MONDAY")).thenReturn(List.of());
        when(scheduleRepository.findByClassroomIdAndDayOfWeek(7, "MONDAY")).thenReturn(List.of(existingSchedule));

        assertThatThrownBy(() -> scheduleService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Classroom already has a schedule in this time range.");
    }

    @Test
    void createNormalizesDayOfWeek() {
        ScheduleRequest request = request(" monday ", LocalTime.of(8, 0), LocalTime.of(9, 0));

        when(teacherAssignmentRepository.findById(1)).thenReturn(Optional.of(assignmentWithTeacher(5)));
        doNothing().when(externalReferenceValidator).ensureClassroomExists(7);
        when(scheduleRepository.findByTeacherIdAndDayOfWeek(5, "MONDAY")).thenReturn(List.of());
        when(scheduleRepository.findByClassroomIdAndDayOfWeek(7, "MONDAY")).thenReturn(List.of());
        when(scheduleRepository.save(any(Schedule.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThat(scheduleService.create(request).dayOfWeek()).isEqualTo("MONDAY");
    }

    private ScheduleRequest request(String dayOfWeek, LocalTime startTime, LocalTime endTime) {
        return new ScheduleRequest(1, 7, dayOfWeek, startTime, endTime);
    }

    private TeacherAssignment assignmentWithTeacher(Integer teacherId) {
        TeacherAssignment teacherAssignment = new TeacherAssignment();
        teacherAssignment.setTeacherId(teacherId);
        return teacherAssignment;
    }

    private Schedule schedule(Integer id, LocalTime startTime, LocalTime endTime) {
        Schedule schedule = new Schedule();
        ReflectionTestUtils.setField(schedule, "id", id);
        schedule.setStartTime(startTime);
        schedule.setEndTime(endTime);
        return schedule;
    }
}
