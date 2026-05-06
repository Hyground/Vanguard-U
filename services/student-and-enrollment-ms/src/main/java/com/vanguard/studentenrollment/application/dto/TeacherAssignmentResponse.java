package com.vanguard.studentenrollment.application.dto;

public record TeacherAssignmentResponse(
        Integer id,
        Integer teacherId,
        Integer courseId,
        Integer gradeId,
        Integer sectionId
) {
}
