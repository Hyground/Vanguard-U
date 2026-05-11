# users-ms

Microservicio responsable de cuentas de acceso, roles, autenticacion JWT y auditoria.

La fuente de verdad del esquema es `sql.txt` y la division funcional se define en `MICROSERVICIOS_DIVISION.md`.

## Responsabilidad

Este servicio administra:

- `roles`
- `users`
- `password_recovery`
- `system_log`

No debe crear ni modificar perfiles en `teachers`, `students` o `tutor`.
Esos perfiles pertenecen a `academic-ms` y `student-and-enrollment-ms`.

## Esquema Oficial

```sql
CREATE TABLE roles (
    id_role SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    id_role INTEGER REFERENCES roles(id_role),
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE password_recovery (
    id_token SERIAL PRIMARY KEY,
    id_user INTEGER REFERENCES users(id_user) NOT NULL,
    temp_token VARCHAR(255) NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE
);

CREATE TABLE system_log (
    id_log SERIAL PRIMARY KEY,
    id_user INTEGER REFERENCES users(id_user),
    action TEXT,
    log_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Endpoints Por Gateway

Base externa:

```text
http://localhost:8080
```

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

### Users

- `GET /api/v1/users`
- `GET /api/v1/users/{id}`
- `PATCH /api/v1/users/{id}/status`

### Roles

- `GET /api/v1/roles`

## Crear Cuenta

Primero revisar los roles reales en la base:

```sql
SELECT * FROM roles ORDER BY id_role;
```

La cuenta se crea usando `roleId`, porque `users.id_role` apunta a `roles.id_role`.

```http
POST /api/v1/auth/register
```

```json
{
  "username": "admin1",
  "password": "123456",
  "roleId": 5
}
```

Respuesta:

```json
{
  "idUser": 2,
  "token": "...",
  "username": "admin1",
  "role": "ADMIN"
}
```

## Cuenta Y Perfil

`users-ms` solo devuelve `idUser`.

Despues se crea el perfil en el servicio correspondiente:

- Docente/director/admin academico: `POST /api/v1/teachers` en `academic-ms`.
- Estudiante: `POST /api/v1/students` en `student-and-enrollment-ms`.
- Tutor: `POST /api/v1/tutors` en `student-and-enrollment-ms`.

Un usuario con rol `ADMIN` tambien puede tener perfil en `teachers`.

## Arranque

- Puerto interno: `8081`
- Entrada externa: `http://localhost:8080`
- Base de datos: `bdedu`
- `ddl-auto: none`

## Tareas De Infraestructura Cloud

Este microservicio debe priorizar consistencia porque maneja autenticacion, usuarios y roles.

Le corresponde:

1. Mantener escrituras y validaciones criticas contra PostgreSQL master.
2. Usar `DB_HOST` y `DB_PORT` mientras no exista separacion lectura/escritura.
3. Preparar configuracion futura con `DB_WRITE_HOST` y `DB_WRITE_PORT` para operaciones criticas.
4. Evaluar `DB_READ_HOST` y `DB_READ_PORT` solo para listados administrativos no criticos.
5. Conectar Redis solo para datos temporales, por ejemplo intentos fallidos de login o bloqueo temporal por abuso.
6. No usar replica para login, registro, recuperacion de contrasena o cambios de rol.

Redis no debe guardar usuarios, contrasenas ni tokens como fuente de verdad.
