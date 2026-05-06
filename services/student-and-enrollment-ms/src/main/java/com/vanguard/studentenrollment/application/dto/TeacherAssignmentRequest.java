package com.vanguard.studentenrollment.application.dto;

import jakarta.validation.constraints.NotNull;

public record TeacherAssignmentRequest(
        @NotNull
        Integer teacherId,

        Integer courseId,
        Integer gradeId,
        Integer sectionId
) {
}
