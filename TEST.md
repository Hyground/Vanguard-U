# Pruebas Rapidas

Este archivo contiene comandos actuales para validar el despliegue Swarm + Patroni.

## API

Desde la manager `vps`:

```bash
curl -m 10 http://127.0.0.1/actuator/health
```

Desde fuera:

```bash
curl -m 10 http://api.wissegt.com/actuator/health
```

## Login

```bash
curl -m 15 -X POST http://127.0.0.1/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"load_admin","password":"Demo123!"}'
```

## Servicios Swarm

```bash
docker service ls
docker service ps vanguard_gateway-ms
docker service ps vanguard_users-ms
docker service ps vanguard_academic-ms
docker service ps vanguard_student-and-enrollment-ms
docker service ps vanguard_billing-ms
```

## Base De Datos Patroni

Desde una maquina con acceso a `bd1`:

```bash
PGPASSWORD='Kj82_mP91_Xz77_Rt' psql -h 34.68.197.98 -p 5000 -U bd2equipomari -d bdedu -c "select inet_server_addr(), pg_is_in_recovery();"
PGPASSWORD='Kj82_mP91_Xz77_Rt' psql -h 34.68.197.98 -p 5001 -U bd2equipomari -d bdedu -c "select inet_server_addr(), pg_is_in_recovery();"
```

Esperado:

```text
5000 -> false
5001 -> true
```

## Monitoreo

En `vps.wissegt.com`:

```bash
curl -m 10 http://127.0.0.1:9187/metrics | grep pg_up
curl -m 10 http://127.0.0.1:9090/-/ready
```
