package com.vanguard.studentenrollment.application.dto;

public record StudentResponse(
        Integer id,
        String personalCode,
        String cui,
        String firstName,
        String lastName,
        Integer tutorId,
        Integer userId
) {
}
