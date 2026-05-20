# Infraestructura Vanguard-U

Esta carpeta contiene la infraestructura pesada de Vanguard-U. En nube debe vivir en la VPS de infraestructura:

```text
vps.wissegt.com -> 207.231.111.45
```

Esta VPS no forma parte del Docker Swarm de microservicios.

## Servicios

`docker-compose.yml` levanta:

- Redis: `6379`
- RabbitMQ: `5672`, panel `15672`
- PostgreSQL exporter: `9187`, apuntando al cluster Patroni en `34.68.197.98:5000`
- Prometheus: `9090`
- Grafana: `3000`

PostgreSQL ya no se levanta en esta VPS. La base oficial esta en Patroni:

```text
bd1 / HAProxy escritura -> 34.68.197.98:5000
bd1 / HAProxy lectura   -> 34.68.197.98:5001
bd2 lider PostgreSQL    -> 34.45.194.127
bd3 replica PostgreSQL  -> 34.29.234.240
```

La PostgreSQL anterior de `vps.wissegt.com` quedo apagada.

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

Para actualizar monitoreo sin tocar Redis y RabbitMQ:

```bash
cd /root/infra-wave
mkdir -p monitoring
docker compose up -d postgres-exporter prometheus grafana
```

Para levantar toda la infraestructura desde cero:

```bash
cd /root/infra-wave
docker compose up -d
```

## Sobre PostgreSQL

El failover de PostgreSQL vive fuera de este compose y esta documentado en
`infrastructure/HA_PATRONI.md`.

## Backups

Para la parte de BD de la demo, el respaldo y la restauracion estan documentados en:

- [infrastructure/BACKUP_RESTORE.md](./BACKUP_RESTORE.md)
- [infrastructure/scripts/pg_backup.sh](./scripts/pg_backup.sh)
- [infrastructure/scripts/pg_restore.sh](./scripts/pg_restore.sh)

Pendiente importante: automatizar backups de Patroni. Por ahora los scripts existen para ejecucion manual.

## Dashboard Limpio

La version limpia del tablero de demo esta descrita aqui:

- [infrastructure/DASHBOARD_DEMO.md](./DASHBOARD_DEMO.md)
