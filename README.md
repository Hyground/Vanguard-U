# Vanguard - Academic & Management System

> **IMPORTANT: AI/CLI AGENT INSTRUCTIONS**
> 1. **Standards:** Always follow Clean Architecture and SOLID principles. Use **Java 21** features (Records, Pattern Matching, Sealed Classes) and **Spring Boot 3.x**.
> 2. **Context:** This is a microservices-based system. Each service in `services/` has its own database schema and responsibilities defined in its respective `README.md`.
> 3. **Consistency:** Use English for all code (classes, methods, variables, database tables, comments). Spanish is allowed only for end-user documentation or if specifically requested.
> 4. **Microservices Communication:** Prefer **Spring Cloud OpenFeign** for synchronous calls and potentially Kafka/RabbitMQ for asynchronous events (to be defined).
> 5. **Security:** Authentication is handled by `users-ms` using JWT. `gateway-ms` validates tokens.
> 6. **Database:** Use **PostgreSQL**. Flyway or Liquibase should be used for migrations.

## Project Overview
Vanguard is a comprehensive Academic Management System designed to handle everything from student enrollment and teacher assignments to billing and system auditing.

## Architecture
The system follows a Microservices Architecture:

- **Gateway MS:** Central entry point (Routing, Security).
- **Users MS:** Authentication, Authorization, and Audit.
- **Academic MS:** Master data for careers, courses, and classrooms.
- **Student & Enrollment MS:** Core business logic for students, teachers, and academic operations.
- **Billing MS:** Financial transactions and payment methods.

## Directory Structure
```text
vanguard/
├── services/
│   ├── academic-ms/             # Academic Master Data
│   ├── billing-ms/              # Finances & Payments
│   ├── gateway-ms/              # API Gateway
│   ├── student-and-enrollment-ms/# Core Operations (Students/Teachers)
│   └── users-ms/                # Security & Auth
├── infrastructure/              # Docker, Prometheus, Grafana
└── README.md                    # This file
```

## Tech Stack
- **Backend:** Java 21, Spring Boot 3.4+, Spring Cloud.
- **Persistence:** PostgreSQL, Spring Data JPA.
- **Security:** Spring Security, JWT.
- **Observability:** Prometheus, Grafana (located in `infrastructure/`).
- **Containerization:** Docker & Docker Compose.

## Infrastructure
The `infrastructure/` directory contains configuration for:
- **Docker Compose:** Orchestrating all microservices and databases.
- **Prometheus:** Metrics collection.
- **Grafana:** Metrics visualization.

## Suggested Global Sprints

### Phase 1: Foundation (Sprint 1-2)
- Setup all microservices with basic Health Checks and Dockerization.
- Implement Security Core (`users-ms`) and Gateway.

### Phase 2: Core Academic (Sprint 3-4)
- Implement `academic-ms` master data.
- Start student/teacher registration in `student-and-enrollment-ms`.

### Phase 3: Operations & Finances (Sprint 5-6)
- Implement Enrollments, Scheduling, and Grading.
- Implement Payments in `billing-ms`.

---
*Maintained by Gemini CLI - Lead Architect.*
