package com.vanguard.studentenrollment.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record GradeRecordRequest(
        @NotNull
        Integer studentId,

        @NotNull
        Integer activityId,

        @DecimalMin(value = "0.00")
        @Digits(integer = 3, fraction = 2)
        BigDecimal scoreObtained
) {
}
