# Documentación: API Gateway (gateway-ms)

El Gateway es el único punto de entrada para los clientes externos. Se encarga del enrutamiento y el control de tráfico (Rate Limiting).

## 🛣️ Rutas de Enrutamiento

El Gateway redirige las peticiones según el prefijo de la URL:

- **Auth/Users/Roles:** `/api/v1/auth/**`, `/api/v1/users/**`, `/api/v1/roles/**` -> Hacia `users-ms`
- **Académico:** `/api/v1/school-cycles/**`, `/api/v1/teachers/**`, etc. -> Hacia `academic-ms`
- **Estudiantes/Inscripciones:** `/api/v1/students/**`, `/api/v1/enrollments/**`, etc. -> Hacia `student-and-enrollment-ms`
- **Facturación:** `/api/v1/billing/**` -> Hacia `billing-ms`

## 🚦 Rate Limiting

Implementado con Redis. Por defecto:
- **Replenish Rate:** 50 peticiones/segundo.
- **Burst Capacity:** 100 peticiones.

## 🔧 Configuración de Red

En un entorno distribuido con Tailscale, las URLs de destino de los microservicios se configuran en el archivo `application.properties` o mediante variables de entorno.
