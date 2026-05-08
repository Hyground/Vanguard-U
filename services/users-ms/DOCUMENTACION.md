# Documentación del Microservicio de Usuarios (Users-MS)

## Propósito
Este microservicio es responsable de la gestión de identidades, autenticación y autorización del sistema Vanguard. Maneja el registro de usuarios, el inicio de sesión mediante JWT, la gestión de roles y la auditoría de acciones.

## Stack Tecnológico
- **Java 21**
- **Spring Boot 3.x**
- **Spring Security (JWT)**
- **Spring Data JPA**
- **PostgreSQL**
- **Lombok**

## Esquema de Base de Datos (Segmento Seguridad)
Basado en las entidades del sistema:
```sql
CREATE TABLE roles (
    id_role SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_role INTEGER REFERENCES roles(id_role),
    status BOOLEAN DEFAULT TRUE
);

CREATE TABLE system_logs (
    id_log SERIAL PRIMARY KEY,
    id_user INTEGER REFERENCES users(id_user),
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_recovery (
    id_recovery SERIAL PRIMARY KEY,
    id_user INTEGER REFERENCES users(id_user),
    token VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP NOT NULL
);
```

## Arquitectura
Se sigue una arquitectura de capas estándar:
1. **Controller:** Define los endpoints REST y maneja la seguridad a nivel de ruta.
2. **Service:** Implementa la lógica de autenticación (JWT) y gestión de usuarios.
3. **Repository:** Persistencia de datos con Spring Data JPA.
4. **Model:** Entidades JPA que representan el esquema de seguridad.
5. **DTO:** Objetos para peticiones (AuthRequest, RegisterRequest) y respuestas (AuthResponse, UserResponse).

## Endpoints Principales
- `POST /api/v1/auth/register`: Registro de nuevos usuarios.
- `POST /api/v1/auth/login`: Autenticación y generación de token JWT.
- `GET /api/v1/users`: Obtiene todos los usuarios (Solo ADMIN).
- `GET /api/v1/users/{id}`: Obtiene detalles de un usuario específico.
- `PATCH /api/v1/users/{id}/status`: Activa/Desactiva un usuario (Solo ADMIN).

## Configuración de Seguridad
- Autenticación basada en **JSON Web Token (JWT)**.
- Roles soportados: `ADMIN`, `USER` (y otros definidos en la tabla `roles`).
- Puerto del servicio: `8081`.
