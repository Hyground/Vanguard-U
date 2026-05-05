# Microservicio de Facturación (Finanzas)

Este microservicio gestiona los métodos de pago y registra las transacciones financieras para las inscripciones y colegiaturas de los estudiantes.

## Tech Stack
- **Java 21**
- **Spring Boot 3.x**
- **PostgreSQL**

## Database Schema (English)

```sql
CREATE TABLE payment_methods (
    method_id SERIAL PRIMARY KEY,
    method_name VARCHAR(50) NOT NULL
);

CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    student_id INTEGER, -- References student-and-enrollment-ms.students
    method_id INTEGER REFERENCES payment_methods(method_id),
    issuer_user_id INTEGER, -- References users-ms.users (The admin/clerk processing)
    payer_user_id INTEGER, -- References users-ms.users (The student/guardian paying)
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Suggested Endpoints

### Payment Method Controller
- `GET /api/v1/payment-methods` - Listar todos los métodos disponibles.
- `POST /api/v1/payment-methods` - Agregar un nuevo método (Solo Admin).

### Payment Controller
- `POST /api/v1/payments` - Procesar un nuevo pago.
- `GET /api/v1/payments/student/{studentId}` - Obtener historial de pagos de un estudiante específico.
- `GET /api/v1/payments/{id}` - Obtener detalles de una transacción.

## Suggested DTOs
- `PaymentMethodDTO` (id, name)
- `PaymentRequestDTO` (studentId, methodId, issuerId, payerId, amount)
- `PaymentResponseDTO` (id, amount, date, methodName)

## Suggested Sprints

### Sprint 1: Núcleo de Finanzas
- Implementar CRUD de Métodos de Pago.
- Implementar lógica de procesamiento de pagos.
- Endpoints básicos de reporte.

---
*Desarrollado por Gemini CLI - Experto en Spring Boot y Microservicios.*
