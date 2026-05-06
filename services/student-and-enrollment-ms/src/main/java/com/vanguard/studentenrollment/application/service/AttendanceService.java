package com.vanguard.studentenrollment.application.service;

import com.vanguard.studentenrollment.application.dto.AttendanceRequest;
import com.vanguard.studentenrollment.application.dto.AttendanceResponse;
import com.vanguard.studentenrollment.application.exception.BusinessRuleException;
import com.vanguard.studentenrollment.application.exception.ResourceNotFoundException;
import com.vanguard.studentenrollment.application.mapper.StudentEnrollmentMapper;
import com.vanguard.studentenrollment.domain.model.Attendance;
import com.vanguard.studentenrollment.domain.model.Student;
import com.vanguard.studentenrollment.domain.model.TeacherAssignment;
import com.vanguard.studentenrollment.domain.repository.AttendanceRepository;
import com.vanguard.studentenrollment.domain.repository.StudentRepository;
import com.vanguard.studentenrollment.domain.repository.TeacherAssignmentRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final TeacherAssignmentRepository teacherAssignmentRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            StudentRepository studentRepository,
            TeacherAssignmentRepository teacherAssignmentRepository
    ) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.teacherAssignmentRepository = teacherAssignmentRepository;
    }

    @Transactional(readOnly = true)
    public Page<AttendanceResponse> findAll(Pageable pageable) {
        return attendanceRepository.findAll(pageable)
                .map(StudentEnrollmentMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public AttendanceResponse findById(Integer id) {
        return StudentEnrollmentMapper.toResponse(getAttendance(id));
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> findByStudentId(Integer studentId) {
        return attendanceRepository.findByStudent_Id(studentId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> findByTeacherAssignmentId(Integer teacherAssignmentId) {
        return attendanceRepository.findByTeacherAssignment_Id(teacherAssignmentId)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponse> findByAttendanceDate(LocalDate attendanceDate) {
        return attendanceRepository.findByAttendanceDate(attendanceDate)
                .stream()
                .map(StudentEnrollmentMapper::toResponse)
                .toList();
    }

    @Transactional
    public AttendanceResponse create(AttendanceRequest request) {
        LocalDate attendanceDate = resolveAttendanceDate(request.attendanceDate());
        ensureAttendanceIsAvailable(request.studentId(), request.teacherAssignmentId(), attendanceDate, null);

        Student student = getStudent(request.studentId());
        TeacherAssignment teacherAssignment = getTeacherAssignment(request.teacherAssignmentId());
        Attendance attendance = StudentEnrollmentMapper.toEntity(request, student, teacherAssignment);
        attendance.setAttendanceDate(attendanceDate);

        Attendance savedAttendance = attendanceRepository.save(attendance);
        return StudentEnrollmentMapper.toResponse(savedAttendance);
    }

    @Transactional
    public AttendanceResponse update(Integer id, AttendanceRequest request) {
        Attendance attendance = getAttendance(id);
        LocalDate attendanceDate = resolveAttendanceDate(request.attendanceDate());
        ensureAttendanceIsAvailable(request.studentId(), request.teacherAssignmentId(), attendanceDate, id);

        Student student = getStudent(request.studentId());
        TeacherAssignment teacherAssignment = getTeacherAssignment(request.teacherAssignmentId());
        StudentEnrollmentMapper.updateEntity(attendance, request, student, teacherAssignment);
        attendance.setAttendanceDate(attendanceDate);
        return StudentEnrollmentMapper.toResponse(attendance);
    }

    @Transactional
    public void delete(Integer id) {
        Attendance attendance = getAttendance(id);
        attendanceRepository.delete(attendance);
    }

    private Attendance getAttendance(Integer id) {
        return attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance not found with id: " + id));
    }

    private Student getStudent(Integer id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    private TeacherAssignment getTeacherAssignment(Integer id) {
        return teacherAssignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher assignment not found with id: " + id));
    }

    private LocalDate resolveAttendanceDate(LocalDate attendanceDate) {
        return attendanceDate == null ? LocalDate.now() : attendanceDate;
    }

    private void ensureAttendanceIsAvailable(
            Integer studentId,
            Integer teacherAssignmentId,
            LocalDate attendanceDate,
            Integer currentAttendanceId
    ) {
        attendanceRepository.findByStudent_Id(studentId)
                .stream()
                .filter(attendance -> !attendance.getId().equals(currentAttendanceId))
                .filter(attendance -> sameAttendance(attendance, teacherAssignmentId, attendanceDate))
                .findAny()
                .ifPresent(attendance -> {
                    throw new BusinessRuleException(
                            "Attendance for this student, teacher assignment and date already exists."
                    );
                });
    }

    private boolean sameAttendance(Attendance attendance, Integer teacherAssignmentId, LocalDate attendanceDate) {
        return attendance.getTeacherAssignment() != null
                && attendance.getTeacherAssignment().getId().equals(teacherAssignmentId)
                && attendanceDate.equals(attendance.getAttendanceDate());
    }
}
