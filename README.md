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
