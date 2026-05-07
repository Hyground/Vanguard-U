package com.vanguard.studentenrollment.application.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record GradeRecordRequest(
        @NotNull
        Integer studentId,

        @NotNull
        Integer activityId,

        @DecimalMax(value = "100.00")
        @DecimalMin(value = "0.00")
        @Digits(integer = 3, fraction = 2)
        BigDecimal scoreObtained
) {
}
