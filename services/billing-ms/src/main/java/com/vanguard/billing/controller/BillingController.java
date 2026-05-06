package com.vanguard.billing.controller;

import com.vanguard.billing.model.Payment;
import com.vanguard.billing.model.PaymentMethod;
import com.vanguard.billing.service.BillingService;
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
    public ResponseEntity<Payment> processPayment(@RequestBody Payment payment) {
        return ResponseEntity.ok(billingService.processPayment(payment));
    }

    @GetMapping("/payments/student/{studentId}")
    public ResponseEntity<List<Payment>> getPaymentsByStudent(@PathVariable Integer studentId) {
        return ResponseEntity.ok(billingService.getPaymentsByStudent(studentId));
    }
}
