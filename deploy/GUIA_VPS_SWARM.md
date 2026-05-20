# Guia VPS Swarm

Guia operativa para levantar Vanguard-U en Docker Swarm con la base de datos actual en Patroni.

## Arquitectura

```text
Usuarios / k6 / frontend
  -> api.wissegt.com
  -> Docker Swarm en 4 VPS
  -> gateway-ms
  -> microservicios
  -> PostgreSQL Patroni por bd1
  -> Redis/RabbitMQ en vps.wissegt.com
```

## VPS Del Swarm

| Nombre | IP publica | Rol |
| --- | --- | --- |
| vps | `104.197.126.0` | manager |
| node2 | `34.41.23.205` | worker |
| vps4 | `34.51.123.84` | worker |
| vps5 | `35.208.149.96` | worker |

## Base De Datos

Los microservicios no se conectan directo a `bd2` ni `bd3`.

```text
DB_WRITE_HOST=34.68.197.98
DB_WRITE_PORT=5000
DB_READ_HOST=34.68.197.98
DB_READ_PORT=5001
```

HAProxy en `bd1` decide el nodo real:

```text
5000 -> lider Patroni
5001 -> replica Patroni
```

Estado validado:

```text
bd2 -> Leader / running
bd3 -> Replica / streaming / lag 0
```

Redis y RabbitMQ siguen en:

```text
REDIS_HOST=vps.wissegt.com
RABBITMQ_HOST=vps.wissegt.com
```

## Firewall

### Swarm

En las 4 VPS del Swarm usar tags:

```text
docker-swarm
vanguard-http
```

Regla `allow-docker-swarm`:

```text
Origen:
104.197.126.0/32
34.41.23.205/32
34.51.123.84/32
35.208.149.96/32

Puertos:
2377/tcp
7946/tcp
7946/udp
4789/udp
```

Entrada publica al gateway:

```text
Puerto: 80/tcp
Destino: vanguard-http o http-server
Origen: 0.0.0.0/0
```

### Patroni

En los proyectos donde viven `bd1`, `bd2`, `bd3`, la regla `allow-patroni-internal` debe permitir:

```text
Origen:
34.68.197.98/32
34.45.194.127/32
34.29.234.240/32
104.197.126.0/32
34.41.23.205/32
34.51.123.84/32
35.208.149.96/32
207.231.111.45/32

Puertos:
2379/tcp
2380/tcp
5432/tcp
8008/tcp
5000/tcp
5001/tcp
```

## Despliegue

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

Ver tareas:

```bash
docker service ps vanguard_gateway-ms
docker service ps vanguard_users-ms
docker service ps vanguard_academic-ms
docker service ps vanguard_student-and-enrollment-ms
docker service ps vanguard_billing-ms
```

Logs:

```bash
docker service logs --tail 100 vanguard_gateway-ms
```

## Validaciones

Health del gateway:

```bash
curl -m 10 http://127.0.0.1/actuator/health
```

Health por dominio:

```bash
curl -m 10 http://api.wissegt.com/actuator/health
```

Login:

```bash
curl -m 15 -X POST http://127.0.0.1/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"load_admin","password":"Demo123!"}'
```

Conectividad a Patroni desde la manager:

```bash
nc -vz -w 5 34.68.197.98 5000
nc -vz -w 5 34.68.197.98 5001
```

Confirmar rutas PostgreSQL:

```bash
PGPASSWORD='Kj82_mP91_Xz77_Rt' psql -h 34.68.197.98 -p 5000 -U bd2equipomari -d bdedu -c "select inet_server_addr(), pg_is_in_recovery();"
PGPASSWORD='Kj82_mP91_Xz77_Rt' psql -h 34.68.197.98 -p 5001 -U bd2equipomari -d bdedu -c "select inet_server_addr(), pg_is_in_recovery();"
```

Esperado:

```text
5000 -> pg_is_in_recovery = false
5001 -> pg_is_in_recovery = true
```

## Reinicio Limpio Del Stack

```bash
cd ~/Vanguard-U
docker stack rm vanguard
docker service ls
docker stack deploy -c deploy/docker-stack.yml vanguard
docker service ls
```

## DNS

`api.wissegt.com` puede apuntar a las 4 VPS del Swarm:

```text
104.197.126.0
34.41.23.205
34.51.123.84
35.208.149.96
```

Frontend:

```text
vanguard.wissegt.com -> 34.29.45.128
```

Infraestructura auxiliar:

```text
vps.wissegt.com -> 207.231.111.45
grafana.wissegt.com -> 207.231.111.45
```

## Monitoreo

Prometheus y Grafana viven en `vps.wissegt.com`.

```text
Prometheus -> http://vps.wissegt.com:9090
Grafana    -> http://vps.wissegt.com:3000
```

Prometheus consulta:

```text
postgres-exporter:9187
104.197.126.0:80/actuator/prometheus
104.197.126.0:8081/actuator/prometheus
104.197.126.0:8082/actuator/prometheus
104.197.126.0:8083/actuator/prometheus
104.197.126.0:8084/actuator/prometheus
```

## Pruebas De Failover

Microservicio:

```bash
docker service ps vanguard_users-ms
docker kill <CONTAINER_ID>
docker service ps vanguard_users-ms
```

PostgreSQL:

```bash
patronictl -c /etc/patroni/config.yml list
```

Si se detiene el lider, Patroni debe promover la replica y HAProxy debe seguir respondiendo por `34.68.197.98:5000`.

## Apagar Y Encender

Apagar aplicacion:

```bash
cd ~/Vanguard-U
docker stack rm vanguard
```

Orden recomendado para apagar VPS:

```text
1. Workers: node2, vps4, vps5
2. Manager: vps
3. Frontend si aplica
4. Infraestructura auxiliar si se acepta apagar Redis/RabbitMQ/Grafana
5. Base Patroni: bd3, bd2, bd1
```

Orden recomendado para encender:

```text
1. bd1, bd2, bd3
2. vps.wissegt.com
3. Manager: vps
4. Workers: node2, vps4, vps5
5. Frontend
```

Validar despues de encender:

```bash
docker node ls
docker service ls
curl -m 10 http://127.0.0.1/actuator/health
```
