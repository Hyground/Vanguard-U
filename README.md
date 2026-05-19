# Vanguard-U

Sistema académico integral basado en microservicios, diseñado para alta disponibilidad y escalabilidad.

## 📑 Guía de Documentación

Para facilitar la administración y el desarrollo, el proyecto se ha documentado de forma modular:

- **[CONFIGURACION_DISTRIBUIDA.md](./CONFIGURACION_DISTRIBUIDA.md)**: Guía paso a paso para el despliegue en múltiples máquinas usando **Tailscale**.
- **[Infraestructura](./infrastructure/DOCUMENTACION_INFRAESTRUCTURA.md)**: Detalles sobre PostgreSQL, Redis, RabbitMQ y Monitoreo.
- **[Gateway (Punto de Entrada)](./services/gateway-ms/DOCUMENTACION.md)**: Rutas y control de tráfico.

### Referencia de Microservicios (APIs y JSONs)
- **[Usuarios y Seguridad](./services/users-ms/DOCUMENTACION.md)**
- **[Gestión Académica](./services/academic-ms/DOCUMENTACION.md)**
- **[Estudiantes e Inscripciones](./services/student-and-enrollment-ms/DOCUMENTACION.md)**
- **[Facturación y Pagos](./services/billing-ms/DOCUMENTACION.md)**

## 🚀 Arquitectura Distribuida

El sistema está preparado para ejecutarse en 5 máquinas independientes conectadas por una red privada segura (Tailscale):

1. **Máquina Principal**: Orquestación de infraestructura (DB, Redis, RabbitMQ) y API Gateway.
2. **Máquina de Facturación**: Procesamiento de pagos.
3. **Máquina de Usuarios**: Seguridad y autenticación.
4. **Máquina Académica**: Catálogos y docentes.
5. **Máquina Estudiantil**: Inscripciones y vida académica.

## 🛠️ Tecnologías Principales

- **Lenguaje**: Java 21 (Spring Boot 3.x)
- **Base de Datos**: PostgreSQL (con replicación Master-Slave)
- **Caché**: Redis
- **Mensajería**: RabbitMQ (Comunicación asíncrona)
- **Monitoreo**: Prometheus & Grafana
- **Red**: Tailscale (VPN Mesh)

## 📡 Acceso al Sistema

Todo consumo externo debe pasar por el `gateway-ms` en el puerto `8080` de la máquina principal.

```http
GET http://100.70.253.58:8080/actuator/health
```

## Avance VPS Docker Swarm

Estado actual del laboratorio:

- Se esta preparando el despliegue en 4 VPS con Docker Engine.
- Las VPS estan en cuentas/proyectos/redes distintas de Google Cloud.
- Por esa razon, cuando se cree el Swarm se usaran IPs publicas, no IPs privadas `10.x.x.x`.
- Todavia no se ha ejecutado `docker swarm init` ni `docker swarm join`.
- Primero se esta validando que Docker quede instalado correctamente en cada VPS.
- Manager elegido para Swarm: `vps` con IP publica `104.197.126.0`.
- Workers previstos: `daniel-s`, `node2` y `vps4`.
- La VPS de infraestructura separada es `vps.wissegt.com`; ahi viven PostgreSQL, Redis, RabbitMQ, Prometheus y Grafana.
- DNS inicial creado: `api.wissegt.com` apunta al manager `104.197.126.0`.

VPS ya validadas:

| VPS | Sistema | IP privada | IP publica | Docker | Swarm |
| --- | --- | --- | --- | --- | --- |
| daniel-s | Debian GNU/Linux | 10.128.0.29 | 34.29.45.128 | OK, Docker 29.5.1 | inactive |
| node2 | Linux | 10.128.0.7 | 34.41.23.205 | OK, Docker 29.5.1 | inactive |
| vps | Debian GNU/Linux | 10.128.0.8 | 104.197.126.0 | OK, Docker 29.5.1 | inactive |
| vps4 | Ubuntu 22.04.5 LTS | 10.224.0.3 | 34.51.123.84 | OK, Docker 29.5.1 | inactive |

Comandos usados para validar cada VPS:

```bash
docker version
docker info | grep Swarm
hostname -I
curl -4 ifconfig.me
```

Pendiente:

- Abrir firewall entre las IPs publicas de las 4 VPS para `2377/tcp`, `7946/tcp`, `7946/udp` y `4789/udp`.
- Abrir `80/tcp` para el gateway.
- Inicializar Swarm solo cuando las 4 VPS esten listas.

Infraestructura externa al Swarm:

| Host | Rol |
| --- | --- |
| vps.wissegt.com | PostgreSQL master/replica, Redis, RabbitMQ, Prometheus y Grafana |

DNS configurado:

| Dominio | Tipo | Destino | Uso |
| --- | --- | --- | --- |
| api.wissegt.com | A | 104.197.126.0 | Entrada publica inicial al gateway en Swarm |
| vps.wissegt.com | A | 207.231.111.45 | Infraestructura externa: DB, Redis, RabbitMQ, Prometheus y Grafana |

Nota: para alta disponibilidad publica completa, `api.wissegt.com` puede tener tambien registros A hacia los otros nodos:

```text
34.29.45.128
34.41.23.205
34.51.123.84
```

Por ahora se deja apuntando solo al manager para simplificar la demo inicial.
