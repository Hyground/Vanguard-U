# API Gateway Microservice

This microservice acts as the entry point for all client requests, providing routing, load balancing, and cross-cutting concerns like security and rate limiting.

## Tech Stack
- **Java 21**
- **Spring Boot 3.x**
- **Spring Cloud Gateway**
- **Spring Cloud Discovery Client** (Eureka/Consul optional)

## Responsibilities
- **Routing:** Directing requests to `users-ms`, `academic-ms`, `student-and-enrollment-ms`, and `billing-ms`.
- **Security:** Validating JWT tokens before forwarding requests to downstream services.
- **Aggregation:** (Optional) Combining responses from multiple services.
- **Rate Limiting:** Protecting the system from abuse.

## Suggested Routes

- `/api/v1/auth/**` -> `users-ms`
- `/api/v1/users/**` -> `users-ms`
- `/api/v1/academic/**` -> `academic-ms`
- `/api/v1/students/**` -> `student-and-enrollment-ms`
- `/api/v1/enrollments/**` -> `student-and-enrollment-ms`
- `/api/v1/billing/**` -> `billing-ms`

## Suggested Sprints

### Sprint 1: Gateway Setup
- Configure Spring Cloud Gateway.
- Implement basic routing to existing microservices.
- Implement Global Filter for JWT validation.

---
*Developed by Gemini CLI - Expert in Spring Boot & Microservices.*
