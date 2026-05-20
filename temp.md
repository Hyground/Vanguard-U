# Documento Temporal Historico

Este archivo ya no es la guia operativa del proyecto.

La arquitectura activa esta documentada en:

- [README.md](./README.md)
- [deploy/GUIA_VPS_SWARM.md](./deploy/GUIA_VPS_SWARM.md)
- [infrastructure/HA_PATRONI.md](./infrastructure/HA_PATRONI.md)
- [infrastructure/DOCUMENTACION_INFRAESTRUCTURA.md](./infrastructure/DOCUMENTACION_INFRAESTRUCTURA.md)

Resumen actual:

```text
Docker Swarm -> microservicios
Patroni/HAProxy -> PostgreSQL
vps.wissegt.com -> Redis, RabbitMQ, Prometheus, Grafana
```

No usar los pasos antiguos de PostgreSQL en `vps.wissegt.com`.
