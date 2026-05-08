package com.vanguard.billing.application.dto;

import java.math.BigDecimal;

public record PaymentRequest(
    Integer idStudent,
    Integer idMethod,
    Integer idUserIssuer,
    Integer idUserPayer,
    BigDecimal amount
) {}
