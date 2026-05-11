package com.vanguard.academic.application.dto;

import java.io.Serializable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MajorDTO(
    Long id,
    
    @NotBlank(message = "Major name is required")
    @Size(max = 100, message = "Major name must not exceed 100 characters")
    String name
) implements Serializable {
    public MajorDTO {
        if (name != null) {
            name = name.trim();
        }
    }
    
    public MajorDTO(String name) {
        this(null, name);
    }
}
