# Vanguard-U

Sistema academico integral basado en microservicios Spring Boot, desplegado en Docker Swarm con PostgreSQL en alta disponibilidad mediante Patroni.

## Arquitectura Actual

```text
Usuarios / frontend / k6
  -> api.wissegt.com
  -> Docker Swarm en 4 VPS Google Cloud
  -> gateway-ms
  -> users-ms / academic-ms / student-and-enrollment-ms / billing-ms
  -> PostgreSQL Patroni por HAProxy
  -> Redis y RabbitMQ en VPS de infraestructura
```

## Nodos

Swarm de aplicaciones:

| Nombre | IP publica | Rol |
| --- | --- | --- |
| vps | `104.197.126.0` | manager |
| node2 | `34.41.23.205` | worker |
| vps4 | `34.51.123.84` | worker |
| vps5 | `35.208.149.96` | worker |

Base de datos:

| Nombre | IP publica | Rol |
| --- | --- | --- |
| bd1 | `34.68.197.98` | Etcd + HAProxy |
| bd2 | `34.45.194.127` | PostgreSQL lider actual |
| bd3 | `34.29.234.240` | PostgreSQL replica de Patroni |

Infraestructura auxiliar:

| Host | IP publica | Servicios |
| --- | --- | --- |
| vps.wissegt.com | `207.231.111.45` | Redis, RabbitMQ, Prometheus, Grafana, postgres-exporter |
| vanguard.wissegt.com | `34.29.45.128` | frontend |

## Conexiones De Datos

PostgreSQL oficial:

```text
Escritura -> 34.68.197.98:5000 -> lider Patroni
Lectura   -> 34.68.197.98:5001 -> replica Patroni
```

Servicios auxiliares:

```text
Redis    -> vps.wissegt.com:6379
RabbitMQ -> vps.wissegt.com:5672
Grafana  -> vps.wissegt.com:3000
Prometheus -> vps.wissegt.com:9090
```

La PostgreSQL vieja de `vps.wissegt.com` fue apagada y ya no forma parte de la aplicacion.

## Archivos Principales

- [deploy/docker-stack.yml](./deploy/docker-stack.yml): stack activo de microservicios Swarm.
- [deploy/GUIA_VPS_SWARM.md](./deploy/GUIA_VPS_SWARM.md): operacion del Swarm.
- [deploy/FRONTEND_DEPLOY.md](./deploy/FRONTEND_DEPLOY.md): despliegue del frontend en `vanguard.wissegt.com`.
- [env/.env](./env/.env): variables usadas por los servicios.
- [infrastructure/docker-compose.yml](./infrastructure/docker-compose.yml): Redis, RabbitMQ, Prometheus, Grafana y postgres-exporter.
- [infrastructure/HA_PATRONI.md](./infrastructure/HA_PATRONI.md): Patroni, Etcd, HAProxy y estado validado.
- [infrastructure/BACKUP_RESTORE.md](./infrastructure/BACKUP_RESTORE.md): respaldo/restauracion contra Patroni.
- [TEST.md](./TEST.md): pruebas rapidas del despliegue actual.

## Desplegar Microservicios

En la manager `vps`:

```bash
cd ~/Vanguard-U
docker stack deploy -c deploy/docker-stack.yml vanguard
docker service ls
```

Resultado esperado:

```text
vanguard_gateway-ms                  2/2
vanguard_users-ms                    2/2
vanguard_academic-ms                 2/2
vanguard_student-and-enrollment-ms   2/2
vanguard_billing-ms                  2/2
```

Validar API:

```bash
curl -m 10 http://127.0.0.1/actuator/health
curl -m 10 https://api.wissegt.com/actuator/health
```

Login de prueba:

```bash
curl -m 15 -X POST http://127.0.0.1/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"load_admin","password":"Demo123!"}'
```

## Desplegar Infraestructura Auxiliar

En `vps.wissegt.com`:

```bash
cd /root/infra-wave
docker compose up -d redis-cache rabbitmq postgres-exporter prometheus grafana
docker ps
```

No debe levantarse PostgreSQL antiguo en `vps.wissegt.com`.

Validar exporter:

```bash
curl -m 10 http://127.0.0.1:9187/metrics | grep pg_up
```

Debe devolver:

```text
pg_up 1
```

## Monitoreo

Prometheus consulta:

```text
postgres-exporter:9187
104.197.126.0:80/actuator/prometheus
104.197.126.0:8081/actuator/prometheus
104.197.126.0:8082/actuator/prometheus
104.197.126.0:8083/actuator/prometheus
104.197.126.0:8084/actuator/prometheus
```

Grafana usa Prometheus como datasource:

```text
http://prometheus:9090
```

## Pendientes Operativos

- Automatizar backups de PostgreSQL Patroni. Actualmente existen scripts/manual de respaldo, pero falta programarlos con `cron` u otro mecanismo.

## Documentos Historicos

- [CONFIGURACION_DISTRIBUIDA.md](./CONFIGURACION_DISTRIBUIDA.md) pertenece al despliegue antiguo por Tailscale. No es la ruta activa.
