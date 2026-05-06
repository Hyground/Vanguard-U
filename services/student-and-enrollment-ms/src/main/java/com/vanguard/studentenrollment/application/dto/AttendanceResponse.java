package com.vanguard.studentenrollment.application.dto;

import java.time.LocalDate;

public record AttendanceResponse(
        Integer id,
        Integer studentId,
        Integer teacherAssignmentId,
        LocalDate attendanceDate,
        String status
) {
}
