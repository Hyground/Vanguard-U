package com.vanguard.studentenrollment.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ActivityRequest(
        @NotNull
        Integer teacherAssignmentId,

        Integer unitId,

        @Size(max = 100)
        String activityName,

        @DecimalMin(value = "0.00")
        @Digits(integer = 3, fraction = 2)
        BigDecimal weight
) {
}
