# Documentación de Rutas - API Gateway

El Gateway actúa como el punto único de entrada (Puerto 8080) y redirige las peticiones a los microservicios internos.

## 1. Rutas de Enrutamiento

| Microservicio | Prefijo de Ruta | Puerto Interno |
| :--- | :--- | :--- |
| **Users MS** | `/api/v1/auth/**`, `/api/v1/users/**`, `/api/v1/roles/**` | 8081 |
| **Academic MS** | `/api/v1/academic/**` | 8082 |
| **Students MS** | `/api/v1/students/**`, `/api/v1/enrollments/**`, etc. | 8083 |
| **Billing MS** | `/api/v1/billing/**` | 8084 |

## 2. Ejemplo de Uso con Billing

Para acceder al microservicio de facturación a través del Gateway, se debe usar la siguiente estructura:

### Registro de Pago vía Gateway
*   **URL:** `http://localhost:8080/api/v1/billing/payments`
*   **Método:** `POST`
*   **JSON:**
    ```json
    {
      "idStudent": 1,
      "idMethod": 2,
      "idUserIssuer": 1,
      "idUserPayer": 5,
      "amount": 500.00
    }
    ```

## 3. Monitoreo (Health)
*   **URL:** `http://localhost:8080/actuator/health`
*   **Método:** `GET`

---
*Desarrollado para el Sistema Vanguard.*
