package com.vanguard.academic.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CareerDTO(
    Long id,
    
    @NotBlank(message = "Career name is required")
    @Size(max = 100, message = "Career name must not exceed 100 characters")
    String name
) {
    public CareerDTO {
        if (name != null) {
            name = name.trim();
        }
    }
    
    public CareerDTO(String name) {
        this(null, name);
    }
}
