package com.vanguard.studentenrollment.application.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record AttendanceRequest(
        @NotNull
        Integer studentId,

        @NotNull
        Integer teacherAssignmentId,

        LocalDate attendanceDate,

        @Size(max = 20)
        String status
) {
}
