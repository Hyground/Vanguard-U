# Microservicio de Usuarios

Este microservicio se encarga de autenticacion, autorizacion, gestion de usuarios y auditoria del sistema.

`users-ms` solo crea cuentas de acceso. No crea perfiles en `students`, `tutor` ni `teachers`.
El endpoint de registro devuelve `idUser`; ese valor se usa despues para crear el perfil en el microservicio correspondiente.

## Tech Stack

- Java 21
- Spring Boot 3.x
- Spring Security
- JWT
- PostgreSQL

## Esquema Oficial

La fuente de verdad es `sql.txt`.

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

## Endpoints

### Auth

- `POST /api/v1/auth/register` - registra una cuenta de acceso con `roleId` y devuelve `idUser`.
- `POST /api/v1/auth/login` - autentica usuario y devuelve JWT.

### Users

- `GET /api/v1/users` - lista usuarios.
- `GET /api/v1/users/{id}` - obtiene un usuario.
- `PATCH /api/v1/users/{id}/status` - habilita o deshabilita usuario.

### Roles

- `GET /api/v1/roles` - lista roles.

## Flujo Correcto

1. Crear cuenta:

```http
POST /api/v1/auth/register
```

```json
{
  "username": "estudiante1",
  "password": "secret123",
  "roleId": 3
}
```

2. Tomar `idUser` de la respuesta. El `roleId` debe existir en `roles.id_role`.

3. Crear el perfil en el servicio correspondiente:

- Estudiante: `POST /api/v1/students` en `student-and-enrollment-ms`.
- Tutor: `POST /api/v1/tutors` en `student-and-enrollment-ms`.
- Docente: `POST /api/v1/teachers` en `academic-ms`.

Un usuario `ADMIN` no tiene tabla de perfil propia en `sql.txt`; basta con la cuenta y el rol.
