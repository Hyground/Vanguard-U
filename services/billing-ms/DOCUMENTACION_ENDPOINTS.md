# Documentación de Endpoints - Billing Microservice

Este microservicio gestiona los métodos de pago y el registro de transacciones financieras.

## 1. Métodos de Pago (Payment Methods)

### Obtener todos los métodos
*   **URL:** `/api/v1/billing/payment-methods`
*   **Método:** `GET`
*   **Respuesta Exitosa (200 OK):**
    ```json
    [
      {
        "idMethod": 1,
        "methodName": "Tarjeta de Crédito"
      },
      {
        "idMethod": 2,
        "methodName": "Efectivo"
      }
    ]
    ```

### Crear un método de pago
*   **URL:** `/api/v1/billing/payment-methods`
*   **Método:** `POST`
*   **Cuerpo de la Petición (JSON):**
    ```json
    {
      "methodName": "Transferencia Bancaria"
    }
    ```
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "idMethod": 3,
      "methodName": "Transferencia Bancaria"
    }
    ```

---

## 2. Pagos (Payments)

### Procesar un pago
*   **URL:** `/api/v1/billing/payments`
*   **Método:** `POST`
*   **Cuerpo de la Petición (JSON):**
    ```json
    {
      "idStudent": 10,
      "idMethod": 1,
      "idUserIssuer": 1,
      "idUserPayer": 2,
      "amount": 150.50
    }
    ```
*   **Respuesta Exitosa (200 OK):**
    ```json
    {
      "idPayment": 100,
      "idStudent": 10,
      "methodName": "Tarjeta de Crédito",
      "amount": 150.50,
      "paymentDate": "2026-05-07T21:45:30.123"
    }
    ```

### Consultar historial por estudiante
*   **URL:** `/api/v1/billing/payments/student/{idStudent}`
*   **Método:** `GET`
*   **Respuesta Exitosa (200 OK):**
    ```json
    [
      {
        "idPayment": 100,
        "idStudent": 10,
        "methodName": "Tarjeta de Crédito",
        "amount": 150.50,
        "paymentDate": "2026-05-07T21:45:30.123"
      }
    ]
    ```

---
*Nota: Todos los montos deben ser enviados como números decimales.*
