# Vanguard-U

Sistema academico basado en microservicios. Este README es la guia general para levantar el proyecto y probar el flujo principal por gateway.

La fuente de verdad del esquema de base de datos es `sql.txt`.
La division real de tablas por microservicio esta en `MICROSERVICIOS_DIVISION.md`.

## READMEs Del Proyecto

- `README.md`: guia general de arranque y flujo principal.
- `MICROSERVICIOS_DIVISION.md`: define que tablas pertenecen a cada microservicio.
- `services/users-ms/README.md`: autenticacion, usuarios, roles y JWT.
- `services/academic-ms/README.md`: catalogos academicos y docentes.
- `services/student-and-enrollment-ms/README.md`: estudiantes, tutores, inscripciones, horarios, notas y asistencia.
- `services/billing-ms/README.md`: metodos de pago y pagos.
- `services/gateway-ms/README.md`: rutas del gateway.
- `deploy/README.md`: plan de Docker, replicas y Docker Swarm para microservicios.
- `infrastructure/README.md`: infraestructura local auxiliar como PostgreSQL/Redis.
- `sql.txt`: esquema oficial actual de la base de datos.

## Microservicios

Todo consumo externo debe pasar por `gateway-ms` en `http://localhost:8080`.

Puertos internos:

- `gateway-ms`: `8080`
- `users-ms`: `8081`
- `academic-ms`: `8082`
- `student-and-enrollment-ms`: `8083`
- `billing-ms`: `8084`

## Base De Datos

Los microservicios se conectan a PostgreSQL usando las variables del archivo `env/.env`.
El esquema actual debe coincidir con `sql.txt`.

El archivo real de variables debe estar en `env/.env`. Ese archivo contiene secretos y no debe subirse al repositorio.

Si la infraestructura de nube ya esta desplegada con PostgreSQL master, PostgreSQL replica y Redis, revisar `infrastructure/USO_INFRAESTRUCTURA_NUBE.md`. Ese documento define que debe usar cada microservicio y que tareas faltan para aprovechar la tecnologia existente.

Antes de crear usuarios, revisar los roles en pgAdmin:

```sql
SELECT * FROM roles ORDER BY id_role;
```

En la base actual los roles estan asi:

```text
5 = ADMIN
6 = TEACHER
7 = STUDENT
8 = TUTOR
```

Si la base se reinicia manualmente, estos IDs pueden cambiar. Siempre usar el `id_role` real que devuelva la consulta.

## Levantar Servicios

Abrir una terminal por microservicio y ejecutar:

```powershell
$env:JAVA_HOME="C:\Program Files\Java\jdk-21.0.10"
.\mvnw.cmd spring-boot:run
```

Ejecutarlo desde cada carpeta:

```text
services/users-ms
services/academic-ms
services/student-and-enrollment-ms
services/billing-ms
services/gateway-ms
```

Verificar gateway:

```http
GET http://localhost:8080/actuator/health
```

## Despliegue Distribuido Pendiente

El despliegue final debe permitir que los microservicios sigan vivos aunque una computadora se apague.
La opcion recomendada para este proyecto es Docker Swarm.

Modelo objetivo:

```text
Cliente
  -> entrada del sistema / gateway
  -> replicas de microservicios en varias computadoras
  -> PostgreSQL en la nube
```

Reglas del modelo:

- Cada microservicio debe tener su propia imagen Docker.
- No se debe crear un solo contenedor con todos los microservicios.
- Cada microservicio debe poder ejecutarse con mas de una replica.
- Las computadoras del cluster no necesitan tener el proyecto completo; necesitan Docker y las imagenes.
- La base de datos principal vive en la nube.
- `sql.txt` sigue siendo la referencia del esquema.

Estado actual:

- Cada microservicio ya tiene su Dockerfile en `services/`.
- Falta definir `deploy/docker-compose.local.yml` para pruebas en una sola computadora.
- Falta definir `deploy/docker-stack.yml` para Docker Swarm en varias computadoras.
- Falta definir healthchecks por servicio.
- Falta definir balanceador o entrada estable para multiples replicas de `gateway-ms`.

Plan recomendado:

1. Probar localmente con Docker Compose en una sola computadora.
2. Levantar 2 replicas por microservicio para simular alta disponibilidad.
3. Probar apagando una replica y verificando que otra responde.
4. Pasar el mismo modelo a Docker Swarm con 4 computadoras.
5. Usar PostgreSQL en la nube como base principal.

## Tareas Para Aprovechar La Infraestructura De Nube

La infraestructura puede existir en la nube, pero los microservicios solo la aprovechan cuando su configuracion y codigo la consumen explicitamente.

Tareas pendientes:

1. Mantener `env/.env` como archivo real de configuracion local y usar esas mismas variables en el orquestador cuando los microservicios se desplieguen en nube.
2. Mantener `DB_HOST` y `DB_PORT` para compatibilidad mientras los servicios no tengan separacion lectura/escritura.
3. Agregar variables `DB_WRITE_HOST`, `DB_WRITE_PORT`, `DB_READ_HOST` y `DB_READ_PORT`.
4. Configurar `gateway-ms` con Redis para rate limiting.
5. Configurar `academic-ms` con Redis para cache de catalogos.
6. Configurar `academic-ms` con datasource de escritura al master y datasource de lectura a la replica.
7. Configurar `student-and-enrollment-ms` con datasource de lectura para listados, horarios y reportes.
8. Evaluar replica en `users-ms` solo para listados administrativos.
9. Evaluar replica en `billing-ms` solo para reportes historicos.
10. Medir carga con pruebas reales antes de afirmar soporte para 50,000 consultas.

Regla importante: el YAML o el orquestador solo entregan variables y reinician contenedores. La decision de usar master, replica o Redis debe implementarse dentro de cada microservicio.

## Base De Datos, Redis Y Carga

PostgreSQL:

- Vive en la nube.
- Es el sistema de persistencia principal.
- No debe levantarse como contenedor local para produccion si ya se usa la nube.
- Las replicas de base de datos, si se implementan, deben definirse en la capa de PostgreSQL o proveedor cloud, no dentro de cada microservicio.

Redis:

- No reemplaza PostgreSQL.
- Se debe usar cuando exista una necesidad concreta de cache, rate limiting, sesiones temporales, colas ligeras o bloqueo distribuido.
- Para mas de 5,000 peticiones, Redis puede ayudar a reducir lecturas repetidas a PostgreSQL, pero primero deben existir metricas de los endpoints mas usados.

Uso recomendado de Redis en este proyecto:

- Cache de catalogos academicos que cambian poco: grados, secciones, jornadas, cursos.
- Rate limiting en gateway.
- Cache temporal de validaciones frecuentes.
- No usar Redis para datos criticos como pagos, notas o inscripciones sin persistir primero en PostgreSQL.

Pendiente antes de prometer mas de 5,000 peticiones:

- Pruebas de carga con escenarios reales.
- Indices en PostgreSQL para las consultas mas usadas.
- Pool de conexiones ajustado por microservicio.
- Timeouts y limites de concurrencia.
- Observabilidad: logs, metricas y healthchecks.
- Cache Redis solo donde las pruebas demuestren beneficio.

## Flujo De Cuenta Y Perfil

`users-ms` crea cuentas de acceso en `users`.
Los perfiles se crean en el microservicio que corresponde.

La cuenta guarda permisos:

```text
users.id_role -> roles.id_role
```

El perfil guarda datos de la persona:

- Docente/director/admin academico: `teachers`
- Estudiante: `students`
- Tutor: `tutor`

Un usuario puede tener rol `ADMIN` y tambien tener perfil en `teachers`.
Ejemplo: un director puede iniciar sesion como admin y tener registro docente.

## Crear Admin Por Gateway

Crear cuenta:

```http
POST http://localhost:8080/api/v1/auth/register
```

```json
{
  "username": "admin1",
  "password": "123456",
  "roleId": 5
}
```

Respuesta esperada:

```json
{
  "idUser": 2,
  "token": "...",
  "username": "admin1",
  "role": "ADMIN"
}
```

Crear perfil docente/director para ese mismo usuario:

```http
POST http://localhost:8080/api/v1/teachers
```

```json
{
  "cui": "0000000000002",
  "firstName": "Admin",
  "lastName": "Director",
  "email": "admin1@vanguard.edu",
  "userId": 2
}
```

## Login

```http
POST http://localhost:8080/api/v1/auth/login
```

```json
{
  "username": "admin1",
  "password": "123456"
}
```

Usar el token devuelto como:

```http
Authorization: Bearer <token>
```

## Verificar En Base De Datos

```sql
SELECT
  u.id_user,
  u.username,
  u.id_role,
  r.role_name,
  u.status,
  t.id_teacher,
  t.cui,
  t.first_name,
  t.last_name,
  t.email
FROM users u
JOIN roles r ON r.id_role = u.id_role
LEFT JOIN teachers t ON t.id_user = u.id_user
WHERE u.username = 'admin1';
```

## Reglas Importantes

- No probar endpoints internos directamente salvo diagnostico; usar `gateway-ms`.
- No modificar `sql.txt` sin decidir primero el cambio de modelo de datos.
- No crear perfiles desde `users-ms`.
- `users-ms` recibe `roleId`, no texto de rol, porque la base guarda `users.id_role`.
- El reinicio de base se hace manualmente en pgAdmin usando `sql.txt` como referencia.
