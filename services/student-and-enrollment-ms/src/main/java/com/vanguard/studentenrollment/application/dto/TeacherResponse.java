package com.vanguard.studentenrollment.application.dto;

public record TeacherResponse(
        Integer id,
        String cui,
        String firstName,
        String lastName,
        String email,
        Integer userId
) {
}
