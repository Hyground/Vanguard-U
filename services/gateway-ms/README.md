# gateway-ms

Punto de entrada externo para todos los microservicios.

Todo consumo desde cliente, Postman o frontend debe pasar por:

```text
http://localhost:8080
```

## Responsabilidad

- Enrutar solicitudes a los microservicios internos.
- Centralizar la entrada HTTP del sistema.
- Exponer health check del gateway.

Este servicio no administra tablas.

## Rutas Actuales

### `users-ms`

- `/api/v1/auth/**`
- `/api/v1/users/**`
- `/api/v1/roles/**`

Destino interno: `http://localhost:8081`

### `academic-ms`

- `/api/v1/school-cycles/**`
- `/api/v1/majors/**`
- `/api/v1/classrooms/**`
- `/api/v1/courses/**`
- `/api/v1/grades/**`
- `/api/v1/sections/**`
- `/api/v1/study-plans/**`
- `/api/v1/shifts/**`
- `/api/v1/bimonthly-units/**`
- `/api/v1/teachers/**`

Destino interno: `http://localhost:8082`

### `student-and-enrollment-ms`

- `/api/v1/students/**`
- `/api/v1/enrollments/**`
- `/api/v1/activities/**`
- `/api/v1/attendance/**`
- `/api/v1/grades-records/**`
- `/api/v1/schedules/**`
- `/api/v1/teacher-assignments/**`
- `/api/v1/tutors/**`

Destino interno: `http://localhost:8083`

### `billing-ms`

- `/api/v1/billing/**`

Destino interno: `http://localhost:8084`

## Health Check

```http
GET http://localhost:8080/actuator/health
```

Respuesta esperada:

```json
{
  "status": "UP"
}
```

## Arranque

- Puerto: `8080`
- Configuracion de rutas: `src/main/resources/application.properties`

## Tareas De Infraestructura Cloud

Este microservicio debe ser el primero en aprovechar Redis.

Le corresponde:

1. Hecho: leer `REDIS_HOST`, `REDIS_PORT` y `REDIS_PASSWORD` desde `env/.env` o desde variables del orquestador.
2. Hecho: configurar rate limiting usando Redis.
3. Hecho: aplicar limites por IP de cliente.
4. Pendiente: definir timeouts por ruta hacia cada microservicio.
5. Pendiente: agregar circuit breaker para evitar que una falla de un microservicio bloquee todo el sistema.
6. Hecho: mantener health check activo para que el orquestador pueda reiniciarlo si falla.

Variables de rate limiting:

- `GATEWAY_RATE_LIMIT_REPLENISH_RATE`: tokens recuperados por segundo.
- `GATEWAY_RATE_LIMIT_BURST_CAPACITY`: maximo de tokens acumulados.
- `GATEWAY_RATE_LIMIT_REQUESTED_TOKENS`: tokens consumidos por request.

No le corresponde conectarse a PostgreSQL master ni replica.

Cuando los microservicios se ejecuten en contenedores, las rutas `USERS_MS_URL`, `ACADEMIC_MS_URL`, `STUDENT_MS_URL` y `BILLING_MS_URL` deben apuntar a nombres de servicio del orquestador, no a `localhost`.
