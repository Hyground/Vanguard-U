# Billing Microservice (Finances)

This microservice manages payment methods and records financial transactions for student enrollments and tuition.

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
- `GET /api/v1/payment-methods` - List all available methods.
- `POST /api/v1/payment-methods` - Add a new method (Admin only).

### Payment Controller
- `POST /api/v1/payments` - Process a new payment.
- `GET /api/v1/payments/student/{studentId}` - Get payment history for a specific student.
- `GET /api/v1/payments/{id}` - Get transaction details.

## Suggested DTOs
- `PaymentMethodDTO` (id, name)
- `PaymentRequestDTO` (studentId, methodId, issuerId, payerId, amount)
- `PaymentResponseDTO` (id, amount, date, methodName)

## Suggested Sprints

### Sprint 1: Finance Core
- Implement Payment Methods CRUD.
- Implement Payment processing logic.
- Basic reporting endpoints.

---
*Developed by Gemini CLI - Expert in Spring Boot & Microservices.*
