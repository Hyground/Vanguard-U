package com.vanguard.studentenrollment.application.dto;

import java.time.LocalDateTime;

public record EnrollmentResponse(
        Integer id,
        Integer studentId,
        Integer gradeId,
        Integer sectionId,
        Integer planId,
        Integer shiftId,
        Integer cycleId,
        LocalDateTime enrollmentDate
) {
}
