# Documentacion: Infraestructura Docker

Esta carpeta contiene la configuracion necesaria para levantar los servicios de soporte del sistema Vanguard-U.

## Docker Compose

El archivo `docker-compose.yml` gestiona los siguientes contenedores:

1. **pg-master:** Base de datos PostgreSQL principal, puerto `5432`.
2. **pg-replica:** Replica de lectura de PostgreSQL, puerto `5433`.
3. **redis-cache:** Cache y soporte para rate limiting, puerto `6379`.
4. **rabbitmq:** Colas para comunicacion asincrona, puertos `5672` y `15672`.
5. **prometheus:** Recoleccion de metricas, puerto `9090`.
6. **grafana:** Visualizacion de metricas, puerto `3000`.

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
docker compose up -d prometheus grafana
```

Validacion rapida:

```bash
curl -I http://localhost:9090/-/ready
curl -I http://localhost:3000/login
```

## Persistencia

Los datos se guardan en volumenes locales:

- `./master_data`: datos de PostgreSQL master.
- `./replica_data`: datos de PostgreSQL replica.
- `./redis_data`: datos de Redis.

## Alta Disponibilidad De Base De Datos

La replica actual no hace failover automatico. Si `pg-master` cae, la aplicacion no cambia automaticamente a `pg-replica` para escrituras.

Para failover automatico real se necesita una herramienta adicional como Patroni, repmgr o un servicio administrado de PostgreSQL. Para la demo actual, la replica se considera replica de lectura.
