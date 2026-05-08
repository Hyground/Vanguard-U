package com.vanguard.academic.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ClassroomDTO(
    Long id,
    
    @NotBlank(message = "Classroom code is required")
    @Size(max = 10, message = "Classroom code must not exceed 10 characters")
    String code,
    
    Integer capacity
) {
    public ClassroomDTO {
        if (code != null) {
            code = code.trim().toUpperCase();
        }
    }
    
    public ClassroomDTO(String code, Integer capacity) {
        this(null, code, capacity);
    }
}
