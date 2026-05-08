package com.vanguard.academic.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record GradeDTO(
    Long id,
    
    @NotBlank(message = "Grade name is required")
    @Size(max = 50, message = "Grade name must not exceed 50 characters")
    String name,
    
    @NotNull(message = "Career ID is required")
    Long careerId
) {
    public GradeDTO {
        if (name != null) {
            name = name.trim();
        }
    }
    
    public GradeDTO(String name, Long careerId) {
        this(null, name, careerId);
    }
}
