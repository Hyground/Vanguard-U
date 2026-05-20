# Deploy Vanguard-U

Esta carpeta contiene el despliegue activo de microservicios en Docker Swarm.

## Archivos

- [docker-stack.yml](./docker-stack.yml): definicion del stack Swarm.
- [GUIA_VPS_SWARM.md](./GUIA_VPS_SWARM.md): guia operativa para firewall, despliegue, validacion y failover.
- [FRONTEND_DEPLOY.md](./FRONTEND_DEPLOY.md): despliegue del frontend en `vanguard.wissegt.com`.

## Modelo Actual

```text
api.wissegt.com
  -> Docker Swarm
  -> gateway-ms
  -> users-ms / academic-ms / student-and-enrollment-ms / billing-ms
  -> PostgreSQL Patroni por 34.68.197.98:5000/5001
  -> Redis y RabbitMQ en vps.wissegt.com
```

El gateway no se conecta a PostgreSQL. Los microservicios de negocio usan:

```text
DB_WRITE_HOST=34.68.197.98
DB_WRITE_PORT=5000
DB_READ_HOST=34.68.197.98
DB_READ_PORT=5001
REDIS_HOST=vps.wissegt.com
RABBITMQ_HOST=vps.wissegt.com
```

## Imagenes

Las VPS no compilan el proyecto. Docker Swarm descarga:

```text
vanguard12s/gateway-ms:lab
vanguard12s/users-ms:lab
vanguard12s/academic-ms:lab
vanguard12s/student-and-enrollment-ms:lab
vanguard12s/billing-ms:lab
```

## Comandos

Desde la manager `vps`:

```bash
cd ~/Vanguard-U
docker stack deploy -c deploy/docker-stack.yml vanguard
docker service ls
```

Reiniciar limpio:

```bash
docker stack rm vanguard
docker service ls
docker stack deploy -c deploy/docker-stack.yml vanguard
```

Validar:

```bash
curl -m 10 http://127.0.0.1/actuator/health
curl -m 10 https://api.wissegt.com/actuator/health
docker service ps vanguard_gateway-ms
```
