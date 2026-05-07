package com.vanguard.studentenrollment.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record AttendanceRequest(
        @NotNull
        Integer studentId,

        @NotNull
        Integer teacherAssignmentId,

        LocalDate attendanceDate,

        @NotBlank
        @Size(max = 20)
        String status
) {
}
