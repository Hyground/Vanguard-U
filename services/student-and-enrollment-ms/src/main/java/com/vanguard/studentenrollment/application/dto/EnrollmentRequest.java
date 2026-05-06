package com.vanguard.studentenrollment.application.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record EnrollmentRequest(
        @NotNull
        Integer studentId,

        Integer gradeId,
        Integer sectionId,
        Integer planId,
        Integer shiftId,
        Integer cycleId,
        LocalDateTime enrollmentDate
) {
}
