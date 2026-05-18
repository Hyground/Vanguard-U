# Documentación: Billing Microservice (billing-ms)

Gestiona los métodos de pago y el procesamiento de transacciones.

## 💳 Métodos de Pago

### Listar Métodos
- **Endpoint:** `GET /api/v1/billing/payment-methods`

### Crear Método de Pago
- **Endpoint:** `POST /api/v1/billing/payment-methods`
- **JSON Request:**
```json
{
  "methodName": "Tarjeta de Crédito",
  "status": true
}
```

## 💰 Pagos (Payments)

### Procesar Pago
- **Endpoint:** `POST /api/v1/billing/payments`
- **JSON Request:**
```json
{
  "idStudent": 1,
  "idPaymentMethod": 1,
  "amount": 1500.00,
  "description": "Pago Colegiatura Mayo"
}
```

### Historial de Pagos por Estudiante
- **Endpoint:** `GET /api/v1/billing/payments/student/{idStudent}`
