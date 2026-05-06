package com.vanguard.studentenrollment.application.dto;

import java.math.BigDecimal;

public record ActivityResponse(
        Integer id,
        Integer teacherAssignmentId,
        Integer unitId,
        String activityName,
        BigDecimal weight
) {
}
