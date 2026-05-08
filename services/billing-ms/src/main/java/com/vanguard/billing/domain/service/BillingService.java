package com.vanguard.billing.domain.service;

import com.vanguard.billing.application.dto.PaymentRequest;
import com.vanguard.billing.application.dto.PaymentResponse;
import com.vanguard.billing.domain.model.Payment;
import com.vanguard.billing.domain.model.PaymentMethod;
import com.vanguard.billing.domain.repository.PaymentMethodRepository;
import com.vanguard.billing.domain.repository.PaymentRepository;
import com.vanguard.billing.infrastructure.persistence.ExternalReferenceValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final PaymentRepository paymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final ExternalReferenceValidator externalReferenceValidator;

    @Transactional(readOnly = true)
    public List<PaymentMethod> getAllPaymentMethods() {
        return paymentMethodRepository.findAll();
    }

    @Transactional
    public PaymentMethod createPaymentMethod(PaymentMethod paymentMethod) {
        return paymentMethodRepository.save(paymentMethod);
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        // Validar referencias externas antes de operar
        externalReferenceValidator.ensureStudentExists(request.idStudent());
        externalReferenceValidator.ensureUserExists(request.idUserIssuer());
        externalReferenceValidator.ensureUserExists(request.idUserPayer());

        PaymentMethod method = paymentMethodRepository.findById(request.idMethod())
            .orElseThrow(() -> new RuntimeException("Payment method not found"));

        Payment payment = Payment.builder()
            .idStudent(request.idStudent())
            .paymentMethod(method)
            .idUserIssuer(request.idUserIssuer())
            .idUserPayer(request.idUserPayer())
            .amount(request.amount())
            .build();

        Payment saved = paymentRepository.save(payment);
        return new PaymentResponse(
            saved.getIdPayment(),
            saved.getIdStudent(),
            method.getMethodName(),
            saved.getAmount(),
            saved.getPaymentDate()
        );
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByStudent(Integer idStudent) {
        return paymentRepository.findByIdStudent(idStudent).stream()
            .map(p -> new PaymentResponse(
                p.getIdPayment(),
                p.getIdStudent(),
                p.getPaymentMethod().getMethodName(),
                p.getAmount(),
                p.getPaymentDate()
            ))
            .collect(Collectors.toList());
    }
}
