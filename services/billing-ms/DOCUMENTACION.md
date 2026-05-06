# Documentación del Microservicio de Facturación (Billing-MS)

## Propósito
Este microservicio es responsable de la gestión financiera del sistema Vanguard, permitiendo el registro de pagos, la gestión de métodos de pago y la consulta de historial de transacciones para estudiantes.

## Stack Tecnológico
- **Java 21**
- **Spring Boot 3.4+**
- **Spring Data JPA**
- **PostgreSQL**
- **Docker**

## Esquema de Base de Datos (Segmento Finanzas)
```sql
CREATE TABLE payment_methods (
    id_method SERIAL PRIMARY KEY,
    method_name VARCHAR(50) NOT NULL
);

CREATE TABLE payments (
    id_payment SERIAL PRIMARY KEY,
    id_student INTEGER NOT NULL,
    id_method INTEGER REFERENCES payment_methods(id_method),
    id_user_issuer INTEGER,
    id_user_payer INTEGER,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Arquitectura
Se sigue una arquitectura de capas estándar:
1. **Controller:** Define los endpoints REST y maneja las solicitudes HTTP.
2. **Service:** Contiene la lógica de negocio.
3. **Repository:** Maneja la persistencia de datos mediante Spring Data JPA.
4. **Model/Entity:** Define las entidades de base de datos.
5. **DTO:** Objetos de transferencia de datos para desacoplar la API del modelo interno.

## Endpoints Principales
- `GET /api/v1/billing/payment-methods`: Obtiene la lista de métodos de pago.
- `POST /api/v1/billing/payment-methods`: Crea un nuevo método de pago (Admin).
- `POST /api/v1/billing/payments`: Registra un nuevo pago.
- `GET /api/v1/billing/payments/student/{studentId}`: Obtiene el historial de pagos de un estudiante.

## Configuración de Docker
El microservicio está configurado para ejecutarse en un contenedor Docker, integrado en el `docker-compose.yml` de la infraestructura global.
