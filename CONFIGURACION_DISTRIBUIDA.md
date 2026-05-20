# Configuracion Distribuida Historica

Este documento reemplaza la guia antigua de Tailscale.

La ruta activa del proyecto ya no es levantar microservicios manualmente en maquinas separadas. La arquitectura actual es:

```text
Docker Swarm -> microservicios
Patroni      -> PostgreSQL HA
vps.wissegt.com -> Redis, RabbitMQ, Prometheus, Grafana
```

Documentos vigentes:

- [README.md](./README.md)
- [deploy/GUIA_VPS_SWARM.md](./deploy/GUIA_VPS_SWARM.md)
- [infrastructure/HA_PATRONI.md](./infrastructure/HA_PATRONI.md)
- [infrastructure/DOCUMENTACION_INFRAESTRUCTURA.md](./infrastructure/DOCUMENTACION_INFRAESTRUCTURA.md)

No usar las IPs Tailscale antiguas para la demo actual.
