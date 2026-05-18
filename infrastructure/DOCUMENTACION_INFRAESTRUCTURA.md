# Documentación: Infraestructura Docker

Esta carpeta contiene la configuración necesaria para levantar los servicios de soporte del sistema Vanguard-U.

## 🐳 Docker Compose

El archivo `docker-compose.yml` gestiona los siguientes contenedores:

1.  **pg-master:** Base de datos PostgreSQL principal (Puerto 5432).
2.  **pg-replica:** Réplica de lectura de PostgreSQL (Puerto 5433).
3.  **redis-cache:** Sistema de caché y rate limiting (Puerto 6379).
4.  **rabbitmq:** Gestor de colas para comunicación asíncrona (Puertos 5672, 15672).
5.  **prometheus:** Recolección de métricas (Puerto 9090).
6.  **grafana:** Visualización de métricas (Puerto 3000).

## 📊 Monitoreo

- **Prometheus Config:** Ubicado en `monitoring/prometheus.yml`. Debe actualizarse con las IPs de Tailscale de los microservicios para recolectar datos en un entorno distribuido.
- **Grafana:** Acceso inicial con usuario `admin` y contraseña `admin`.

## 💾 Persistencia

Los datos se guardan en volúmenes locales para evitar pérdida de información:
- `./master_data`: Datos de la base principal.
- `./replica_data`: Datos de la réplica.
- `./redis_data`: Datos de caché.
