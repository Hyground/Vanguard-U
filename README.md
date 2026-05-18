# Vanguard-U

Sistema académico integral basado en microservicios, diseñado para alta disponibilidad y escalabilidad.

## 📑 Guía de Documentación

Para facilitar la administración y el desarrollo, el proyecto se ha documentado de forma modular:

- **[CONFIGURACION_DISTRIBUIDA.md](./CONFIGURACION_DISTRIBUIDA.md)**: Guía paso a paso para el despliegue en múltiples máquinas usando **Tailscale**.
- **[Infraestructura](./infrastructure/DOCUMENTACION_INFRAESTRUCTURA.md)**: Detalles sobre PostgreSQL, Redis, RabbitMQ y Monitoreo.
- **[Gateway (Punto de Entrada)](./services/gateway-ms/DOCUMENTACION.md)**: Rutas y control de tráfico.

### Referencia de Microservicios (APIs y JSONs)
- **[Usuarios y Seguridad](./services/users-ms/DOCUMENTACION.md)**
- **[Gestión Académica](./services/academic-ms/DOCUMENTACION.md)**
- **[Estudiantes e Inscripciones](./services/student-and-enrollment-ms/DOCUMENTACION.md)**
- **[Facturación y Pagos](./services/billing-ms/DOCUMENTACION.md)**

## 🚀 Arquitectura Distribuida

El sistema está preparado para ejecutarse en 5 máquinas independientes conectadas por una red privada segura (Tailscale):

1. **Máquina Principal**: Orquestación de infraestructura (DB, Redis, RabbitMQ) y API Gateway.
2. **Máquina de Facturación**: Procesamiento de pagos.
3. **Máquina de Usuarios**: Seguridad y autenticación.
4. **Máquina Académica**: Catálogos y docentes.
5. **Máquina Estudiantil**: Inscripciones y vida académica.

## 🛠️ Tecnologías Principales

- **Lenguaje**: Java 21 (Spring Boot 3.x)
- **Base de Datos**: PostgreSQL (con replicación Master-Slave)
- **Caché**: Redis
- **Mensajería**: RabbitMQ (Comunicación asíncrona)
- **Monitoreo**: Prometheus & Grafana
- **Red**: Tailscale (VPN Mesh)

## 📡 Acceso al Sistema

Todo consumo externo debe pasar por el `gateway-ms` en el puerto `8080` de la máquina principal.

```http
GET http://100.70.253.58:8080/actuator/health
```
