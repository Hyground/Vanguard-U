package com.vanguard.academic.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CourseDTO(
    Long id,
    
    @NotBlank(message = "Course code is required")
    @Size(max = 10, message = "Course code must not exceed 10 characters")
    String code,
    
    @NotBlank(message = "Course name is required")
    @Size(max = 100, message = "Course name must not exceed 100 characters")
    String name
) {
    public CourseDTO {
        if (code != null) {
            code = code.trim().toUpperCase();
        }
        if (name != null) {
            name = name.trim();
        }
    }
    
    public CourseDTO(String code, String name) {
        this(null, code, name);
    }
}
