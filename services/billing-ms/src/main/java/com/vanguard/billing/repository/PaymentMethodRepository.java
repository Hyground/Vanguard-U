package com.vanguard.billing.repository;

import com.vanguard.billing.model.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, Integer> {
    Optional<PaymentMethod> findByMethodName(String methodName);
}
