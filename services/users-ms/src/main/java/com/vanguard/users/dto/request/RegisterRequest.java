package com.vanguard.users.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    @NotBlank(message = "Username is required")
    private String username;

    @NotBlank(message = "Password is required")
    private String password;

    @NotNull(message = "Role id is required")
    private Integer roleId;

    // Optional profile fields kept for compatibility with existing clients.
    // Profile records are created by academic-ms or student-and-enrollment-ms.
    private String cui;

    private String firstName;

    private String lastName;

    private String email;
}
