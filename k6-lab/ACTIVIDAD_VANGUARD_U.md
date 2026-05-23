# Actividad de observabilidad y estres - Vanguard-U

Este laboratorio adapta la actividad teorica al proyecto real Vanguard-U. No se usan endpoints de ejemplo como `/clientes`; la carga se ejecuta contra los endpoints reales publicados por `https://api.wissegt.com`.

## Arquitectura usada

Componentes del proyecto:

- API: `https://api.wissegt.com`, expuesta por `gateway-ms`.
- Microservicios: `users-ms`, `academic-ms`, `student-and-enrollment-ms`, `billing-ms`.
- Base de datos: PostgreSQL remoto de Vanguard-U.
- Exporter: `postgres-exporter` en `infrastructure/docker-compose.yml`.
- Prometheus: `infrastructure/monitoring/prometheus.yml`.
- Grafana: dashboards provisionados en `infrastructure/grafana/provisioning/dashboards`.
- Generador de carga: `k6-lab`, panel local en `http://localhost:3006`.

Flujo:

```text
k6-lab -> https://api.wissegt.com -> gateway-ms -> microservicios -> PostgreSQL
                                           |
Prometheus <- postgres-exporter + /actuator/prometheus
     |
Grafana
```

## Targets de carga

El panel `k6-lab` permite atacar endpoints reales:

- `Login`: `/api/v1/auth/login`
- `Usuarios`: `/api/v1/admin/security/identity?section=users`
- `Estudiantes`: `/api/v1/admin/security/identity?section=students` y `/api/v1/students`
- `Inscripciones`: `/api/v1/enrollments`
- `Pagos`: `/api/v1/billing/payment-methods` y `/api/v1/billing/payments/student/1`
- `Todo`: mezcla de login, usuarios, estudiantes, inscripciones, pagos y resumen admin.

Para observar PostgreSQL, priorizar `Estudiantes`, `Inscripciones`, `Pagos` y luego `Todo`.

## Login, token y pruebas reales

No usar `Login` para la prueba principal de 50,000 si el objetivo es medir API + PostgreSQL. Login mide autenticacion: validacion de credenciales, generacion de JWT, gateway/proxy y posibles consultas de usuario. Es normal que se sature antes que una lectura normal.

Para medir endpoints protegidos:

1. Usar `Estudiantes`, `Inscripciones`, `Pagos` o `Todo`.
2. El panel hace login una sola vez en `setup` y reutiliza el token.
3. Si ya se tiene un token valido, pegarlo en `Token Bearer opcional` para saltar incluso ese login inicial.
4. Si hay varios usuarios reales con la misma contrasena, pegarlos en `Usuarios de carga` y poner la contrasena compartida. El setup hace login una vez por usuario y reparte las peticiones entre esos tokens.

Para laboratorio se puede crear un usuario/token de carga con expiracion larga. No se recomienda un token que nunca expire en produccion. Si se usa, debe ser solo para pruebas, con permisos minimos y revocable.

`Todo` no repite login por iteracion. El target `Login` queda separado para medir exclusivamente cuanto aguanta autenticacion.

Ejemplo practico:

```text
Usuarios de carga:
load_admin

Contrasena compartida:
Demo123!
```

Cuenta alternativa real:

```text
Usuarios de carga:
admin

Contrasena compartida:
admin
```

No mezclar `load_admin` y `admin` en la misma corrida porque no comparten contrasena. Con eso, para una prueba de 50,000 contra `Estudiantes`, k6 no hace 50,000 logins. Hace 1 login al inicio, obtiene 1 token y reutiliza ese token en las 50,000 iteraciones.

## Validacion antes de carga

Antes de correr pruebas:

1. Confirmar que `k6-lab` responde en `http://localhost:3006`.
2. Confirmar que Prometheus este disponible en `http://localhost:9090`.
3. Confirmar que Grafana este disponible en `http://localhost:3000`.
4. En Prometheus, revisar que los targets esten `UP`:
   - `postgres`
   - `gateway-ms`
   - `users-ms`
   - `academic-ms`
   - `student-and-enrollment-ms`
   - `billing-ms`
5. En Grafana, abrir:
   - `Vanguard-U PostgreSQL`
   - `Vanguard-U Microservices`

## Prueba base

Objetivo: obtener una linea base estable.

Configuracion sugerida:

```text
Target: Estudiantes
Peticiones: 1,000
VUs: 25
VUs maximos: 100
Tiempo: 3m
Timeout API: 30s
```

Observar:

- Latencia promedio y p95.
- Error rate.
- Conexiones activas en PostgreSQL.
- Transacciones por segundo.
- CPU/memoria de servicios.

## Prueba de estres corta

Objetivo: meter presion en una ventana corta, parecida a una sesion real de clase o evaluacion.

Configuracion sugerida para 10,000 peticiones en 3 minutos:

```text
Target: Estudiantes o Inscripciones
Peticiones: 10,000
VUs: 150
VUs maximos: 500
Tiempo: 3m
Timeout API: 30s
```

Configuracion agresiva para 50,000 peticiones en 3 minutos:

```text
Target: Estudiantes o Todo
Peticiones: 50,000
VUs: 500
VUs maximos: 2,000
Tiempo: 3m
Timeout API: 30s
```

Nota: `Todo` genera varias llamadas HTTP por iteracion. Es mas fuerte que un target individual.

## Como interpretar resultados k6

- `completedIterations`: iteraciones reales completadas por el script.
- `requestedIterations`: volumen solicitado.
- `plannedRate`: iteraciones por segundo calculadas para cumplir el tiempo.
- `effectiveDuration`: tiempo real que k6 necesita con esa tasa para completar el volumen.
- `requests`: requests HTTP reales. En `Todo` puede ser mayor que las iteraciones.
- `failRate`: porcentaje de requests fallidos.
- `p95`: latencia del 95% de requests.
- `status5xx`: errores de backend.
- `dropped_iterations`: k6 no pudo sostener la tasa; faltan VUs o la API/BD no responde suficientemente rapido.

## Diagnostico cuando no llega a 10,000 o 50,000

La prueba anterior no llego a 10,000 porque usaba `1` VU y `2m`. Eso no era un fallo de PostgreSQL todavia; era una configuracion de k6 que no tenia capacidad para producir suficiente carga. Con 1 VU, k6 solo puede iniciar otra iteracion cuando termina la anterior.

Si se seleccionan pocas peticiones con una ventana grande, por ejemplo `10` en `15m`, el panel calcula `1/s` y usa una duracion efectiva cercana a `10s`. La ventana de `15m` solo sirve para calcular la tasa maxima deseada; la prueba no debe quedarse corriendo sin hacer requests reales.

Ahora el panel usa tasa por segundo. Para diagnosticar:

- Si `completedIterations` es bajo y `droppedIterations` es alto, k6 no pudo sostener la tasa. Subir `VUs` y `VUs maximos`.
- Si `completedIterations` se acerca al objetivo, `droppedIterations` es `0`, pero sube `p95`, la API/BD esta respondiendo lento bajo carga.
- Si aparecen `status5xx`, el backend o algun microservicio fallo bajo presion.
- Si aparecen muchos `status4xx`, revisar autenticacion, permisos, limites o datos de prueba.
- Si `p95` sube y PostgreSQL muestra muchas conexiones activas, revisar pool de conexiones e indices.
- Si `p95` sube pero PostgreSQL esta tranquilo, revisar gateway, red, CPU/JVM o llamadas entre microservicios.

Configuracion practica para buscar el limite:

```text
0) 10 rapido
   VUs: 5
   VUs maximos: 25
   Tiempo: 10s

1) 1,000 en 2m
   VUs: 25
   VUs maximos: 100
   Tasa esperada: 9 iteraciones/s

2) 10,000 en 3m
   VUs: 150
   VUs maximos: 500
   Tasa esperada: 56 iteraciones/s

3) 25,000 en 3m
   VUs: 300
   VUs maximos: 1,000
   Tasa esperada: 139 iteraciones/s

4) 50,000 en 5m
   VUs: 500
   VUs maximos: 2,000
   Tasa esperada: 167 iteraciones/s
```

No pasar al siguiente nivel si el nivel actual ya muestra `5xx`, `droppedIterations` alto o `p95` fuera de control.

El panel ajusta automaticamente `VUs`, `VUs maximos` y `Tiempo` cuando se elige un preset. Si se quiere presionar mas fuerte, bajar el tiempo manualmente:

- `50,000` en `5m`: 167 iteraciones/s.
- `50,000` en `3m`: 278 iteraciones/s.

## Preguntas para el reporte

Responder con evidencia de Grafana y k6:

- Que metrica cambio primero al iniciar la carga.
- Si la latencia aumento gradualmente o de golpe.
- Si el throughput siguio creciendo o llego a un limite.
- Si PostgreSQL aumento conexiones activas.
- Si aparecieron errores 4xx o 5xx.
- Que componente parece ser el cuello de botella.
- Que mejora tecnica se propone.

## Posibles mejoras tecnicas

Segun los resultados, las mejoras mas probables son:

- Crear indices en columnas usadas por filtros y ordenamientos.
- Reducir consultas N+1 en endpoints de estudiantes, inscripciones o pagos.
- Paginacion mas estricta y limites maximos de `size`.
- Pool de conexiones ajustado por microservicio.
- Cache para catalogos academicos de alta lectura.
- Separar lecturas hacia replicas si Patroni/HA esta disponible.
- Aumentar recursos o replicas del microservicio que sature primero.
