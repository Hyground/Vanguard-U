package com.vanguard.billing.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "payment_methods")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_method")
    private Integer idMethod;

    @Column(name = "method_name", nullable = false, length = 50)
    private String methodName;
}
