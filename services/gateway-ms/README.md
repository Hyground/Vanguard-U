# Microservicio API Gateway

Este microservicio actúa como el punto de entrada para todas las solicitudes de los clientes, proporcionando enrutamiento, equilibrio de carga y manejo de aspectos transversales como seguridad y limitación de tasa (rate limiting).

## Tech Stack
- **Java 21**
- **Spring Boot 3.x**
- **Spring Cloud Gateway**
- **Spring Cloud Discovery Client** (Eureka/Consul opcional)

## Responsabilidades
- **Enrutamiento (Routing):** Dirigir solicitudes a `users-ms`, `academic-ms`, `student-and-enrollment-ms` y `billing-ms`.
- **Seguridad:** Validar tokens JWT antes de redirigir las solicitudes a los servicios internos.
- **Agregación:** (Opcional) Combinar respuestas de múltiples servicios.
- **Limitación de Tasa (Rate Limiting):** Proteger el sistema contra abusos.

## Suggested Routes (Rutas sugeridas)

- `/api/v1/auth/**` -> `users-ms`
- `/api/v1/users/**` -> `users-ms`
- `/api/v1/academic/**` -> `academic-ms`
- `/api/v1/students/**` -> `student-and-enrollment-ms`
- `/api/v1/enrollments/**` -> `student-and-enrollment-ms`
- `/api/v1/billing/**` -> `billing-ms`

## Suggested Sprints

### Sprint 1: Configuración del Gateway
- Configurar Spring Cloud Gateway.
- Implementar enrutamiento básico a los microservicios existentes.
- Implementar Filtro Global para la validación de JWT.

---
*Desarrollado por Gemini CLI - Experto en Spring Boot y Microservicios.*
