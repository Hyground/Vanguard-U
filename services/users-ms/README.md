# Microservicio de Usuarios (Núcleo de Seguridad)

Este microservicio se encarga de la autenticación, autorización, gestión de usuarios y auditoría del sistema.

## Tech Stack
- **Java 21**
- **Spring Boot 3.x**
- **Spring Security**
- **JWT (JSON Web Tokens)**
- **PostgreSQL**

## Database Schema (English)

```sql
CREATE TABLE roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role_id INTEGER REFERENCES roles(role_id),
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE password_recovery (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) NOT NULL,
    temporary_token VARCHAR(255) NOT NULL,
    expiration_date TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT FALSE
);

CREATE TABLE system_log (
    log_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id),
    action TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Suggested Endpoints

### Auth Controller
- `POST /api/v1/auth/login` - Autenticar usuario y devolver JWT.
- `POST /api/v1/auth/register` - Registrar un nuevo usuario (estudiante por defecto o como admin).
- `POST /api/v1/auth/recover-password` - Iniciar recuperación de contraseña.
- `PUT /api/v1/auth/reset-password` - Restablecer contraseña usando un token.

### User Controller
- `GET /api/v1/users` - Listar todos los usuarios (Solo Admin).
- `GET /api/v1/users/{id}` - Obtener detalles del usuario.
- `PATCH /api/v1/users/{id}/status` - Habilitar/Deshabilitar usuario.

### Role Controller
- `GET /api/v1/roles` - Listar todos los roles.

## Suggested DTOs
- `AuthRequestDTO` (username, password)
- `AuthResponseDTO` (jwt, username, role)
- `UserResponseDTO` (id, username, role, status)
- `PasswordResetDTO` (token, newPassword)

## Suggested Sprints

### Sprint 1: Fundamentos de Seguridad
- Configuración de Spring Security y JWT.
- Implementar entidades y repositorios de Usuario y Rol.
- Endpoints básicos de Login y Registro.

### Sprint 2: Recuperación de Contraseña y Auditoría
- Implementar lógica de recuperación de contraseña.
- Implementar aspecto de Log de Sistema (Auditoría) para interceptar y registrar acciones.

---
*Desarrollado por Gemini CLI - Experto en Spring Boot y Microservicios.*
