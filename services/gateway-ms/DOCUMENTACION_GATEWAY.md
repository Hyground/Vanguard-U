# Documentación de Rutas - API Gateway

El Gateway actúa como el punto único de entrada (Puerto 8080) y redirige las peticiones a los microservicios internos.

## 1. Rutas de Enrutamiento (Configuración Real)

| Microservicio | Rutas Manejadas (Predicados) | Puerto Interno |
| :--- | :--- | :--- |
| **Users MS** | `/api/v1/auth/**`, `/api/v1/users/**`, `/api/v1/roles/**` | 8081 |
| **Academic MS** | `/api/v1/school-cycles/**`, `/api/v1/majors/**`, `/api/v1/classrooms/**`, `/api/v1/courses/**`, `/api/v1/grades/**`, `/api/v1/sections/**`, `/api/v1/study-plans/**`, `/api/v1/shifts/**`, `/api/v1/bimonthly-units/**`, `/api/v1/teachers/**` | 8082 |
| **Student MS** | `/api/v1/students/**`, `/api/v1/enrollments/**`, `/api/v1/activities/**`, `/api/v1/attendance/**`, `/api/v1/grades-records/**`, `/api/v1/schedules/**`, `/api/v1/teacher-assignments/**`, `/api/v1/tutors/**` | 8083 |
| **Billing MS** | `/api/v1/billing/**` | 8084 |

## 2. Ejemplo de Uso con Billing

Para acceder al microservicio de facturación a través del Gateway, se debe usar la siguiente estructura:

### Registro de Pago vía Gateway
*   **URL:** `http://<IP_GATEWAY>:8080/api/v1/billing/payments`
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
*   **Gateway:** `http://<IP_GATEWAY>:8080/actuator/health`
*   **Estado de Nodos:** Cada microservicio expone su propio `/actuator/health` que el Gateway monitorea.

---
*Desarrollado para el Sistema Vanguard.*
