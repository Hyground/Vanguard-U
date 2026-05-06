package com.vanguard.studentenrollment.domain.repository;

import com.vanguard.studentenrollment.domain.model.Attendance;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Integer> {

    List<Attendance> findByStudent_Id(Integer studentId);

    List<Attendance> findByTeacherAssignment_Id(Integer teacherAssignmentId);

    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);

    boolean existsByStudent_IdAndTeacherAssignment_IdAndAttendanceDate(
            Integer studentId,
            Integer teacherAssignmentId,
            LocalDate attendanceDate
    );
}
