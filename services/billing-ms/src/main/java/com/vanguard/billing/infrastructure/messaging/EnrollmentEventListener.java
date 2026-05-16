package com.vanguard.billing.infrastructure.messaging;

import com.vanguard.billing.application.dto.events.EnrollmentCreatedEvent;
import com.vanguard.billing.application.dto.PaymentRequest;
import com.vanguard.billing.domain.service.BillingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EnrollmentEventListener {

    private final BillingService billingService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE)
    public void handleEnrollmentCreated(EnrollmentCreatedEvent event) {
        log.info("Received EnrollmentCreatedEvent: {}", event);
        
        try {
            // Creamos una solicitud de pago (factura inicial de inscripción)
            // idUserIssuer y idUserPayer se ponen en 0 o un ID de sistema por ahora
            PaymentRequest paymentRequest = new PaymentRequest(
                event.studentId(),
                1, // idMethod (Efectivo o Sistema por defecto)
                0, // idUserIssuer (Sistema)
                0, // idUserPayer (Sistema/Estudiante)
                event.enrollmentFee()
            );

            billingService.processPayment(paymentRequest);
            log.info("Automatic payment processed for student: {}", event.studentId());
        } catch (Exception e) {
            log.error("Error processing automatic payment for enrollment {}: {}", 
                event.enrollmentId(), e.getMessage());
        }
    }
}
