package com.vanguard.studentenrollment.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.vanguard.studentenrollment.application.dto.AttendanceRequest;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.domain.model.Attendance;
import com.vanguard.studentenrollment.domain.model.Student;
import com.vanguard.studentenrollment.domain.model.TeacherAssignment;
import com.vanguard.studentenrollment.domain.repository.AttendanceRepository;
import com.vanguard.studentenrollment.domain.repository.StudentRepository;
import com.vanguard.studentenrollment.domain.repository.TeacherAssignmentRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TeacherAssignmentRepository teacherAssignmentRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    @Test
    void createRejectsUnsupportedStatus() {
        AttendanceRequest request = new AttendanceRequest(1, 2, LocalDate.of(2026, 5, 6), "UNKNOWN");

        assertThatThrownBy(() -> attendanceService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Attendance status must be one of: PRESENT, ABSENT, LATE, EXCUSED.");
    }

    @Test
    void createNormalizesAllowedStatus() {
        Student student = new Student();
        TeacherAssignment teacherAssignment = new TeacherAssignment();
        AttendanceRequest request = new AttendanceRequest(1, 2, LocalDate.of(2026, 5, 6), " present ");

        when(attendanceRepository.findByStudent_Id(1)).thenReturn(List.of());
        when(studentRepository.findById(1)).thenReturn(Optional.of(student));
        when(teacherAssignmentRepository.findById(2)).thenReturn(Optional.of(teacherAssignment));
        when(attendanceRepository.save(any(Attendance.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThat(attendanceService.create(request).status()).isEqualTo("PRESENT");
    }

    @Test
    void createRejectsDuplicateAttendance() {
        Attendance existingAttendance = new Attendance();
        ReflectionTestUtils.setField(existingAttendance, "id", 10);
        TeacherAssignment existingAssignment = new TeacherAssignment();
        ReflectionTestUtils.setField(existingAssignment, "id", 2);
        existingAttendance.setTeacherAssignment(existingAssignment);
        existingAttendance.setAttendanceDate(LocalDate.of(2026, 5, 6));

        AttendanceRequest request = new AttendanceRequest(1, 2, LocalDate.of(2026, 5, 6), "PRESENT");

        when(attendanceRepository.findByStudent_Id(1)).thenReturn(List.of(existingAttendance));

        assertThatThrownBy(() -> attendanceService.create(request))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessage("Attendance for this student, teacher assignment and date already exists.");
    }
}
