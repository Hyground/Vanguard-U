# Vanguard-web Documentation

## 1. Documentación Completa y Extensa
Vanguard-web es la interfaz de usuario oficial para el ecosistema Vanguard-U, diseñada para operar bajo una arquitectura de microservicios con un Gateway como punto único de entrada. La web se enfoca en la **Alta Disponibilidad** y la **Seguridad**, heredando las políticas de autenticación y autorización del backend.

### Arquitectura de Navegación
La aplicación utiliza un patrón de **Single Page Application (SPA)** simplificado mediante Vanilla JS para minimizar la carga de recursos y maximizar la velocidad de respuesta. Todas las solicitudes al backend se realizan a través de la API publica por HTTPS (`https://api.wissegt.com/api/v1`).

### Flujo de Autenticación
1. El usuario ingresa sus credenciales en la vista de Login.
2. La solicitud se envía a `https://api.wissegt.com/api/v1/auth/login`.
3. El backend (`users-ms`) valida y retorna un **JWT**.
4. El frontend almacena el JWT de forma segura y lo adjunta en el encabezado `Authorization: Bearer <token>` para todas las solicitudes subsecuentes.

## 2. Tecnologías Usadas y su Implementación
- **HTML5:** Estructura semántica para SEO y accesibilidad.
- **Vanilla CSS:** Estilizado minimalista utilizando Variables CSS (Custom Properties) para consistencia de marca y Flexbox/Grid para diseño responsivo.
- **Vanilla JavaScript (ES6+):** Lógica de negocio y manipulación del DOM sin dependencias externas para mantener el proyecto ligero.
- **Fetch API:** Para la comunicación asíncrona con los microservicios.
- **LocalStorage:** Almacenamiento persistente del JWT y datos de sesión no sensibles.

## 3. Integración con el Backend
La integración se realiza mediante la clase `GatewayClient` (ubicada en `js/utils/gateway-client.js`), la cual encapsula:
- Manejo de URL base del Gateway.
- Intercepción de solicitudes para agregar el Token JWT.
- Manejo de errores globales (401 Unauthorized, 403 Forbidden).
- Parseo automático de respuestas JSON.

## 4. Resumen para Modificaciones Futuras (Instrucciones para IA)
Para realizar cambios o expandir la funcionalidad:
1. **Agregar un nuevo Servicio:** Crea un archivo en `js/services/` (ej. `NewService.js`) que extienda de `GatewayClient`.
2. **Modificar una Vista:** Dirígete a `js/pages/` y busca el controlador de la vista correspondiente. Los archivos están divididos por roles: `StudentView.js`, `TeacherView.js`, `AdminView.js`.
3. **Cambiar el Estilo:** Modifica `css/styles.css`. Usa las variables definidas en `:root` para cambios globales de color o espaciado.
4. **Seguridad:** No almacenes contraseñas en texto plano. No expongas el JWT en logs. Verifica siempre el rol del usuario antes de renderizar componentes críticos.

### Flujo de Datos por Microservicio
- **users-ms:** Maneja `/auth/` y `/users/`. Es el corazón de la seguridad.
- **academic-ms:** Catálogos de cursos, maestros y carreras.
- **student-and-enrollment-ms:** Notas, asistencia y actividades (usado para el Calendario).
- **billing-ms:** Pagos y métodos de pago (usado en la vista de Finanzas).

## 5. Consideraciones Imprescindibles
- **Manejo de Errores:** Siempre utiliza bloques `try-catch` en las llamadas a servicios.
- **Responsividad:** La web debe ser funcional en dispositivos móviles (especialmente para estudiantes).
- **Carga de Datos:** Implementa esqueletos de carga (Skeletons) o Spinners mientras se esperan respuestas del backend.
- **Modularidad:** Mantén las funciones de renderizado separadas de la lógica de fetch.
- **Validación de Token:** El `GatewayClient` maneja automáticamente la redirección al login si el token expira (401).

## 6. Esquema de Base de Datos (SQL)
```sql
BEGIN;

--- 1. SECURITY
CREATE TABLE roles (
    id_role SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    id_role INTEGER REFERENCES roles(id_role),
    status BOOLEAN DEFAULT TRUE
);

-- ... (Resto del SQL proporcionado)
COMMIT;
```

## 7. Recomendaciones Técnicas
- **Paginación:** Para la gestión de usuarios, se recomienda implementar paginación en el backend si la lista supera los 100 registros.
- **Auditoría:** Utilizar la tabla `system_log` para registrar cada creación o cambio de estado de usuario realizado por el Administrador.
- **Seguridad:** Las contraseñas deben ser hasheadas en el backend (BCrypt/Argon2). Nunca enviarlas de vuelta al frontend en las consultas.

---
*Desarrollado con estándares de ingeniería de software para Vanguard-U.*

