# Users Microservice (Security Core)

This microservice handles authentication, authorization, user management, and system auditing.

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
- `POST /api/v1/auth/login` - Authenticate user and return JWT.
- `POST /api/v1/auth/register` - Register a new user (default student or as admin).
- `POST /api/v1/auth/recover-password` - Initiate password recovery.
- `PUT /api/v1/auth/reset-password` - Reset password using token.

### User Controller
- `GET /api/v1/users` - List all users (Admin only).
- `GET /api/v1/users/{id}` - Get user details.
- `PATCH /api/v1/users/{id}/status` - Enable/Disable user.

### Role Controller
- `GET /api/v1/roles` - List all roles.

## Suggested DTOs
- `AuthRequestDTO` (username, password)
- `AuthResponseDTO` (jwt, username, role)
- `UserResponseDTO` (id, username, role, status)
- `PasswordResetDTO` (token, newPassword)

## Suggested Sprints

### Sprint 1: Security Foundation
- Setup Spring Security and JWT configuration.
- Implement User and Role entities/repositories.
- Basic Login and Register endpoints.

### Sprint 2: Password Recovery & Audit
- Implement Password Recovery logic.
- Implement System Log (Audit) aspect to intercept and record actions.

---
*Developed by Gemini CLI - Expert in Spring Boot & Microservices.*
