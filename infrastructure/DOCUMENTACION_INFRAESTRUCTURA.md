# Documentacion: Infraestructura Docker

Esta carpeta contiene la configuracion necesaria para levantar los servicios de soporte del sistema Vanguard-U.

## Docker Compose

El archivo `docker-compose.yml` gestiona los siguientes contenedores:

1. **redis-cache:** Cache y soporte para rate limiting, puerto `6379`.
2. **rabbitmq:** Colas para comunicacion asincrona, puertos `5672` y `15672`.
3. **postgres-exporter:** Metricas de PostgreSQL Patroni, puerto `9187`.
4. **prometheus:** Recoleccion de metricas, puerto `9090`.
5. **grafana:** Visualizacion de metricas, puerto `3000`.

PostgreSQL ya no vive en este compose. La base oficial esta en Patroni:

```text
Escritura -> 34.68.197.98:5000
Lectura   -> 34.68.197.98:5001
```

## Monitoreo

- Configuracion de Prometheus: `monitoring/prometheus.yml`.
- Grafana inicial: usuario `admin`, contrasena `admin`.
- Datasource de Grafana: `http://prometheus:9090`.

Prometheus consulta los endpoints `/actuator/prometheus` publicados por el Swarm:

```text
gateway-ms                  -> 104.197.126.0:80
users-ms                    -> 104.197.126.0:8081
academic-ms                 -> 104.197.126.0:8082
student-and-enrollment-ms   -> 104.197.126.0:8083
billing-ms                  -> 104.197.126.0:8084
```

Para instalar solo monitoreo en la VPS de infraestructura:

```bash
cd /root/infra-wave
mkdir -p monitoring
docker compose up -d postgres-exporter prometheus grafana
```

Validacion rapida:

```bash
curl -I http://localhost:9090/-/ready
curl -I http://localhost:3000/login
```

## Persistencia

Los datos se guardan en volumenes locales:

- `./redis_data`: datos de Redis.

## Alta Disponibilidad De Base De Datos

La alta disponibilidad de PostgreSQL esta implementada con Patroni y HAProxy.
Ver `infrastructure/HA_PATRONI.md`.
