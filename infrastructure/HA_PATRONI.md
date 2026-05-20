# Alta Disponibilidad PostgreSQL Con Patroni

Este documento describe el cluster PostgreSQL activo de Vanguard-U.

## Nodos

| Nodo | IP publica | Rol |
| --- | --- | --- |
| bd1 | `34.68.197.98` | Etcd + HAProxy |
| bd2 | `34.45.194.127` | PostgreSQL lider actual |
| bd3 | `34.29.234.240` | PostgreSQL replica de Patroni |

## Rutas De Conexion

Los microservicios no se conectan directo a `bd2` ni `bd3`.

```text
Escrituras -> 34.68.197.98:5000
Lecturas   -> 34.68.197.98:5001
```

HAProxy en `bd1` decide el nodo real:

```text
5000 -> nodo Patroni con rol primary
5001 -> nodo Patroni con rol replica
```

Variables usadas por los microservicios:

```text
DB_HOST=34.68.197.98
DB_PORT=5000
DB_WRITE_HOST=34.68.197.98
DB_WRITE_PORT=5000
DB_READ_HOST=34.68.197.98
DB_READ_PORT=5001
```

## Estado Validado

- `bd1` ejecuta Etcd y HAProxy.
- `bd2` quedo como lider de PostgreSQL.
- `bd3` quedo como replica en estado `streaming` con lag `0`.
- La base original `bdedu` fue migrada desde la PostgreSQL vieja al cluster Patroni.
- La base migrada contiene 24 tablas en el esquema `public`.
- Login validado con `load_admin` / `Demo123!`.
- La PostgreSQL vieja de `vps.wissegt.com` fue apagada.
- `postgres-exporter` en `vps.wissegt.com` apunta a `34.68.197.98:5000` y devuelve `pg_up 1`.

## Firewall

Regla recomendada: `allow-patroni-internal`.

Tag de destino:

```text
vanguard-db-ha
```

Origenes permitidos:

```text
34.68.197.98/32
34.45.194.127/32
34.29.234.240/32
104.197.126.0/32
34.41.23.205/32
34.51.123.84/32
35.208.149.96/32
207.231.111.45/32
```

Puertos:

```text
2379/tcp  Etcd cliente
2380/tcp  Etcd peer
5432/tcp  PostgreSQL entre nodos
8008/tcp  Patroni REST API
5000/tcp  HAProxy escritura
5001/tcp  HAProxy lectura
```

## Validaciones

En cualquier maquina con acceso a `bd1`:

```bash
PGPASSWORD='Kj82_mP91_Xz77_Rt' psql -h 34.68.197.98 -p 5000 -U bd2equipomari -d bdedu -c "select inet_server_addr(), pg_is_in_recovery();"
PGPASSWORD='Kj82_mP91_Xz77_Rt' psql -h 34.68.197.98 -p 5001 -U bd2equipomari -d bdedu -c "select inet_server_addr(), pg_is_in_recovery();"
```

Esperado:

```text
5000 -> pg_is_in_recovery = false
5001 -> pg_is_in_recovery = true
```

En `bd2` o `bd3`:

```bash
patronictl -c /etc/patroni/config.yml list
```

Esperado:

```text
bd2  Leader   running
bd3  Replica  streaming
```

## Servicios Que Siguen Fuera De Patroni

```text
Redis    -> vps.wissegt.com:6379
RabbitMQ -> vps.wissegt.com:5672
Grafana  -> vps.wissegt.com:3000
Prometheus -> vps.wissegt.com:9090
```
