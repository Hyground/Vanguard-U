# Guía de Pruebas (Test Suite) - Vanguard-U Distribuido

Este archivo contiene comandos `curl` y peticiones HTTP listas para copiar y pegar para verificar que la red distribuida a través de Tailscale funciona correctamente.

## 📡 1. Pruebas de Salud (Health Checks) Directas
Estas pruebas se hacen directo a la máquina (sin pasar por el gateway) para validar que la red de Tailscale conecta las computadoras correctamente y que tienen acceso a la base de datos de la máquina principal.

```bash
# 1. Gateway (Máquina Principal)
curl -X GET http://100.70.253.58:8080/actuator/health

# 2. Users Microservice (Máquina Users)
curl -X GET http://100.125.236.96:8081/actuator/health

# 3. Academic Microservice (Máquina Academic)
curl -X GET http://100.91.4.45:8082/actuator/health

# 4. Student Microservice (Máquina Student)
curl -X GET http://100.105.17.78:8083/actuator/health

# 5. Billing Microservice (Máquina Billing)
curl -X GET http://100.119.91.28:8084/actuator/health
```
*(Todas deben responder `{"status":"UP"}` o algo similar indicando salud positiva).*

---

## 🚪 2. Pruebas a través del Gateway
El flujo real del sistema siempre entra por el Gateway (`100.70.253.58:8080`).

### A) Prueba de Roles (Apunta a Users-ms)
Debería devolver la lista de roles si la base de datos tiene datos iniciales.
```bash
curl -X GET http://100.70.253.58:8080/api/v1/roles
```

### B) Prueba de Métodos de Pago (Apunta a Billing-ms)
```bash
curl -X GET http://100.70.253.58:8080/api/v1/billing/payment-methods
```

### C) Prueba de Docentes (Apunta a Academic-ms)
```bash
curl -X GET http://100.70.253.58:8080/api/v1/teachers
```

---

## 🔐 3. Flujo Completo (Crear Usuario, Obtener Token)

### 1. Registrar un Administrador
```bash
curl -X POST http://100.70.253.58:8080/api/v1/auth/register \
-H "Content-Type: application/json" \
-d '{
  "username": "admin_test",
  "password": "password123",
  "roleId": 5
}'
```

### 2. Hacer Login (Copiar el "token" devuelto)
```bash
curl -X POST http://100.70.253.58:8080/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{
  "username": "admin_test",
  "password": "password123"
}'
```
