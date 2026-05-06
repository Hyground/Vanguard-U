package com.vanguard.studentenrollment.application.dto;

import java.math.BigDecimal;

public record GradeRecordResponse(
        Integer id,
        Integer studentId,
        Integer activityId,
        BigDecimal scoreObtained
) {
}
