# Infraestructura Vanguard-U

Esta carpeta contiene la infraestructura pesada de Vanguard-U. En nube debe vivir en la VPS de infraestructura:

```text
vps.wissegt.com -> 207.231.111.45
```

Esta VPS no forma parte del Docker Swarm de microservicios.

## Servicios

`docker-compose.yml` levanta:

- PostgreSQL master: `5432`
- PostgreSQL replica de lectura: `5433`
- Redis: `6379`
- RabbitMQ: `5672`, panel `15672`
- Prometheus: `9090`
- Grafana: `3000`

Los microservicios se despliegan aparte en `deploy/docker-stack.yml`.

## Monitoreo

Prometheus usa:

```text
monitoring/prometheus.yml
```

Ese archivo consulta las metricas publicadas por el Swarm en la manager:

```text
104.197.126.0:80/actuator/prometheus
104.197.126.0:8081/actuator/prometheus
104.197.126.0:8082/actuator/prometheus
104.197.126.0:8083/actuator/prometheus
104.197.126.0:8084/actuator/prometheus
```

En Google Cloud, los puertos `8081-8084` deben estar abiertos solo desde:

```text
207.231.111.45/32
```

## Levantar O Actualizar

Para agregar solo Prometheus y Grafana sin tocar los contenedores actuales de base de datos, Redis y RabbitMQ:

```bash
cd /root/infra-wave
mkdir -p monitoring
docker compose up -d prometheus grafana
```

Para levantar toda la infraestructura desde cero:

```bash
cd /root/infra-wave
docker compose up -d
```

## Sobre La Replica De PostgreSQL

La replica actual es de lectura. Sirve para consultas y reportes, pero no reemplaza automaticamente al master si el master cae.

Por ahora la decision recomendada para la demo es:

```text
master -> escrituras y operaciones criticas
replica -> lecturas no criticas donde el atraso sea aceptable
```

El failover automatico real de PostgreSQL requiere otra capa, por ejemplo Patroni, repmgr o un servicio administrado. No esta incluido en este compose.
