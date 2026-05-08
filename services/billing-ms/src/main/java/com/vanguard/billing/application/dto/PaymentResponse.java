package com.vanguard.billing.application.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
    Integer idPayment,
    Integer idStudent,
    String methodName,
    BigDecimal amount,
    LocalDateTime paymentDate
) {}
