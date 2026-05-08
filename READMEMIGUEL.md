# Resumen de Cambios - Sistema Vanguard (Miguel)

Este archivo detalla todas las modificaciones y mejoras realizadas en los microservicios `billing-ms` y `gateway-ms`.

## 1. Microservicio de Facturación (`billing-ms`)
Se ha reestructurado completamente para cumplir con los estándares del proyecto y el esquema de base de datos oficial.

*   **Estructura de Paquetes:** Se migró a una estructura plana y simplificada:
    *   `controller`: Endpoints REST.
    *   `service`: Lógica de negocio.
    *   `model`: Entidades JPA vinculadas a la DB.
    *   `repository`: Interfaces de persistencia.
    *   `dto`: Objetos de transferencia de datos (Java Records).
    *   `exception`: Manejo global de errores.
*   **Alineación con Base de Datos (`sql.txt`):**
    *   Las entidades ahora mapean exactamente a las tablas `payments` y `payment_methods`.
    *   Se respetan los nombres de columnas (ej. `id_method`, `method_name`, `id_user_issuer`, etc.).
*   **Configuración:**
    *   Se eliminó `application.yml`.
    *   Se creó `application.properties` con la conexión a la DB `bdedu` y el puerto `8084`.
*   **Documentación:** Se añadió `DOCUMENTACION_ENDPOINTS.md` con ejemplos de JSON para cada endpoint.

## 2. API Gateway (`gateway-ms`)
Se implementó el punto único de entrada para todo el ecosistema de microservicios.

*   **Tecnología:** Spring Cloud Gateway sobre Java 21.
*   **Puerto:** Centralizado en el puerto `8080`.
*   **Enrutamiento Configurado:**
    *   `/api/v1/auth/**`, `/api/v1/users/**` -> `users-ms` (8081)
    *   `/api/v1/academic/**` -> `academic-ms` (8082)
    *   `/api/v1/students/**`, `/api/v1/enrollments/**` -> `student-and-enrollment-ms` (8083)
    *   `/api/v1/billing/**` -> `billing-ms` (8084)
*   **Configuración:** Implementada exclusivamente en `application.properties`.
*   **Documentación:** Se añadió `DOCUMENTACION_GATEWAY.md` explicando las rutas y ejemplos de acceso.

## 3. Cambios Generales
*   **Estandarización:** Todos los nuevos microservicios utilizan ahora `application.properties` para mantener la consistencia con el resto del repositorio.
*   **Docker:** Se incluyeron `Dockerfile` funcionales para ambos servicios.
*   **Restricción de Alcance:** No se modificó ningún archivo fuera de las carpetas `billing-ms` y `gateway-ms`.

---
*Estado: Los microservicios de facturación y el gateway están listos para integración y pruebas.*
