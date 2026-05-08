package com.vanguard.academic.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CatalogItemDTO(
    Long id,

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    String name
) {
    public CatalogItemDTO {
        if (name != null) {
            name = name.trim();
        }
    }

    public CatalogItemDTO(String name) {
        this(null, name);
    }
}
