package com.vanguard.billing.domain.repository;

import com.vanguard.billing.domain.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {
    List<Payment> findByIdStudent(Integer idStudent);
}
