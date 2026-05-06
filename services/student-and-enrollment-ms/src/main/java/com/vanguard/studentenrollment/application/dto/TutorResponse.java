package com.vanguard.studentenrollment.application.dto;

public record TutorResponse(
        Integer id,
        String cui,
        String firstName,
        String lastName,
        Integer userId
) {
}
