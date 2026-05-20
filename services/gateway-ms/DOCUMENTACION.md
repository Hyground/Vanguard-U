# Documentacion: API Gateway

El gateway es el punto de entrada HTTP para clientes externos. Enruta solicitudes hacia los microservicios y aplica rate limiting con Redis.

## Rutas

- `/api/v1/auth/**`, `/api/v1/users/**`, `/api/v1/roles/**` -> `users-ms`
- `/api/v1/school-cycles/**`, `/api/v1/teachers/**`, catalogos academicos -> `academic-ms`
- `/api/v1/students/**`, `/api/v1/enrollments/**`, notas, asistencia y horarios -> `student-and-enrollment-ms`
- `/api/v1/billing/**` -> `billing-ms`

## Variables En Swarm

```text
USERS_MS_URL=http://users-ms:8081
ACADEMIC_MS_URL=http://academic-ms:8082
STUDENT_MS_URL=http://student-and-enrollment-ms:8083
BILLING_MS_URL=http://billing-ms:8084
REDIS_HOST=vps.wissegt.com
REDIS_PORT=6379
```

El gateway no se conecta a PostgreSQL. La base la usan los microservicios de negocio.

## Rate Limiting

Implementado con Redis.

Valores por defecto:

```text
GATEWAY_RATE_LIMIT_REPLENISH_RATE=50
GATEWAY_RATE_LIMIT_BURST_CAPACITY=100
GATEWAY_RATE_LIMIT_REQUESTED_TOKENS=1
```

## Validacion

```bash
curl -m 10 http://127.0.0.1/actuator/health
```
