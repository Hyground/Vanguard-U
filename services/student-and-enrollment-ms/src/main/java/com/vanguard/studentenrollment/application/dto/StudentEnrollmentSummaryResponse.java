package com.vanguard.studentenrollment.application.dto;

public record StudentEnrollmentSummaryResponse(
        long totalStudents,
        long totalEnrollments
) {
}
