# Documentación: Users Microservice (users-ms)

Este microservicio se encarga de la gestión de identidades, roles y seguridad (JWT).

## 🛡️ Autenticación

### Registro de Usuario
- **Endpoint:** `POST /api/v1/auth/register`
- **JSON Request:**
```json
{
  "username": "usuario_ejemplo",
  "password": "mi_password_segura",
  "roleId": 5
}
```
*Nota: roleId 5=ADMIN, 6=TEACHER, 7=STUDENT, 8=TUTOR.*

### Login (Obtener Token)
- **Endpoint:** `POST /api/v1/auth/login`
- **JSON Request:**
```json
{
  "username": "usuario_ejemplo",
  "password": "mi_password_segura"
}
```
- **Respuesta:** Devuelve un objeto con el `token` JWT necesario para otros endpoints.

## 👤 Gestión de Usuarios

### Obtener todos los usuarios (Solo ADMIN)
- **Endpoint:** `GET /api/v1/users`
- **Headers:** `Authorization: Bearer <token>`

### Obtener usuario por ID
- **Endpoint:** `GET /api/v1/users/{id}`

### Actualizar estado (Habilitar/Deshabilitar)
- **Endpoint:** `PATCH /api/v1/users/{id}/status`
- **JSON Request:**
```json
{
  "status": false
}
```

## 🔑 Roles

### Listar Roles
- **Endpoint:** `GET /api/v1/roles`
