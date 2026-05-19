# Deploy Vanguard-U

Esta carpeta contiene los archivos activos para desplegar los microservicios en Docker Swarm.

## Archivos

- [docker-stack.yml](./docker-stack.yml): definicion del stack Swarm.
- [GUIA_VPS_SWARM.md](./GUIA_VPS_SWARM.md): guia paso a paso para Google Cloud, firewall, Swarm, DNS, despliegue y failover.

## Modelo Actual

```text
api.wissegt.com
  -> 4 VPS Google Cloud en Docker Swarm
  -> gateway-ms
  -> users-ms / academic-ms / student-and-enrollment-ms / billing-ms
  -> vps.wissegt.com para PostgreSQL, Redis y RabbitMQ
```

Las imagenes se descargan desde Docker Hub:

```text
vanguard12s/gateway-ms:lab
vanguard12s/users-ms:lab
vanguard12s/academic-ms:lab
vanguard12s/student-and-enrollment-ms:lab
vanguard12s/billing-ms:lab
```

No se compila ni se construyen imagenes en las VPS del Swarm.

## Comando Principal

Ejecutar desde la VPS manager, dentro del repo:

```bash
docker stack deploy -c deploy/docker-stack.yml vanguard
```

Verificar:

```bash
docker service ls
docker service ps vanguard_gateway-ms
```

