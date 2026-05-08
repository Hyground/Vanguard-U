package com.vanguard.billing.presentation.controller;

import com.vanguard.billing.application.dto.PaymentRequest;
import com.vanguard.billing.application.dto.PaymentResponse;
import com.vanguard.billing.domain.model.PaymentMethod;
import com.vanguard.billing.domain.service.BillingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/payment-methods")
    public ResponseEntity<List<PaymentMethod>> getAllPaymentMethods() {
        return ResponseEntity.ok(billingService.getAllPaymentMethods());
    }

    @PostMapping("/payment-methods")
    public ResponseEntity<PaymentMethod> createPaymentMethod(@RequestBody PaymentMethod paymentMethod) {
        return ResponseEntity.ok(billingService.createPaymentMethod(paymentMethod));
    }

    @PostMapping("/payments")
    public ResponseEntity<PaymentResponse> processPayment(@RequestBody PaymentRequest request) {
        return ResponseEntity.ok(billingService.processPayment(request));
    }

    @GetMapping("/payments/student/{idStudent}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByStudent(@PathVariable Integer idStudent) {
        return ResponseEntity.ok(billingService.getPaymentsByStudent(idStudent));
    }
}
