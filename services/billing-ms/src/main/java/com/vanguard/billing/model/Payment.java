package com.vanguard.billing.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_payment")
    private Integer idPayment;

    @Column(name = "id_student", nullable = false)
    private Integer idStudent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_method", nullable = false)
    private PaymentMethod paymentMethod;

    @Column(name = "id_user_issuer")
    private Integer idUserIssuer;

    @Column(name = "id_user_payer")
    private Integer idUserPayer;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_date", nullable = false)
    @Builder.Default
    private LocalDateTime paymentDate = LocalDateTime.now();
}
