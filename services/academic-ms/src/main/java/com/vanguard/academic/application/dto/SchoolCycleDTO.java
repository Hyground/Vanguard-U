package com.vanguard.academic.application.dto;

import jakarta.validation.constraints.NotNull;

public record SchoolCycleDTO(
    Long id,
    
    @NotNull(message = "Year is required")
    Integer year,
    
    Boolean active
) {
    public SchoolCycleDTO(Integer year, Boolean active) {
        this(null, year, active);
    }
}
