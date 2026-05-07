package com.vanguard.studentenrollment.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TutorRequest(
        @NotBlank
        @Size(min = 13, max = 13)
        String cui,

        @NotBlank
        @Size(max = 100)
        String firstName,

        @NotBlank
        @Size(max = 100)
        String lastName,

        @NotNull
        Integer userId
) {
}
