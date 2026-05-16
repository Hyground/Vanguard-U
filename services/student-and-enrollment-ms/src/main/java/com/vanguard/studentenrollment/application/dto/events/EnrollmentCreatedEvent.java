package com.vanguard.studentenrollment.application.dto.events;

import java.io.Serializable;
import java.math.BigDecimal;

public record EnrollmentCreatedEvent(
    Integer enrollmentId,
    Integer studentId,
    Integer cycleId,
    BigDecimal enrollmentFee
) implements Serializable {}
