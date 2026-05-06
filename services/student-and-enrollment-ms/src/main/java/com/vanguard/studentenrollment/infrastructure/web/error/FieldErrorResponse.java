package com.vanguard.studentenrollment.infrastructure.web.error;

public record FieldErrorResponse(
        String field,
        String message
) {
}
