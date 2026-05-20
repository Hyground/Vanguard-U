# Vanguard-U

Sistema academico integral basado en microservicios Spring Boot, desplegado para laboratorio de alta disponibilidad con Docker Swarm en VPS de Google Cloud.

## Documentacion Principal

- [deploy/GUIA_VPS_SWARM.md](./deploy/GUIA_VPS_SWARM.md): guia operativa actual para VPS, firewall, Docker Swarm, DNS, despliegue y pruebas.
- [deploy/docker-stack.yml](./deploy/docker-stack.yml): stack usado por Docker Swarm para levantar los microservicios.
- [infrastructure/DOCUMENTACION_INFRAESTRUCTURA.md](./infrastructure/DOCUMENTACION_INFRAESTRUCTURA.md): PostgreSQL, Redis, RabbitMQ, Prometheus y Grafana.
- [services/gateway-ms/DOCUMENTACION.md](./services/gateway-ms/DOCUMENTACION.md): gateway y rutas de entrada.
- [CONFIGURACION_DISTRIBUIDA.md](./CONFIGURACION_DISTRIBUIDA.md): documento historico de despliegue con Tailscale. No es la ruta activa del laboratorio Swarm.

## Arquitectura Actual

```text
Frontend / k6 / usuarios
  -> api.wissegt.com
  -> Docker Swarm en 4 VPS Google Cloud
  -> gateway-ms
  -> microservicios por red overlay
  -> vps.wissegt.com para PostgreSQL, Redis y RabbitMQ
```

Infraestructura separada:

```text
vps.wissegt.com      -> 207.231.111.45 -> DB, Redis, RabbitMQ, Prometheus, Grafana
grafana.wissegt.com  -> 207.231.111.45 -> Grafana
```

Frontend:

```text
vanguard.wissegt.com -> 34.29.45.128 -> daniel-s, pagina/frontend, fuera del Swarm
```

## Estado Del Swarm

Cluster Swarm actual:

| VPS | IP publica | Rol | Estado |
| --- | --- | --- | --- |
| vps | 104.197.126.0 | manager | Ready, Leader |
| node2 | 34.41.23.205 | worker | Ready |
| vps4 | 34.51.123.84 | worker | Ready |
| vps5 | 35.208.149.96 | worker | Ready |

Validacion ejecutada en manager:

```bash
docker node ls
```

Resultado esperado:

```text
node2  Ready  Active
vps    Ready  Active  Leader
vps4   Ready  Active
vps5   Ready  Active
```

## Imagenes Docker

Las VPS no compilan el proyecto. Docker Swarm descarga las imagenes desde Docker Hub:

```text
vanguard12s/gateway-ms:lab
vanguard12s/users-ms:lab
vanguard12s/academic-ms:lab
vanguard12s/student-and-enrollment-ms:lab
vanguard12s/billing-ms:lab
```

El archivo [deploy/docker-stack.yml](./deploy/docker-stack.yml) ya apunta a esas imagenes.

## Firewall Google Cloud

Como las VPS estan en cuentas/proyectos/redes distintas, Swarm usa IPs publicas.

En cada VPS del Swarm deben existir estas etiquetas de red:

```text
docker-swarm
vanguard-http
```

En cada proyecto/cuenta de Google Cloud donde vive una VPS del Swarm debe existir una regla:

```text
Nombre: allow-docker-swarm
Direccion: Entrada / Ingress
Destino: VMs con etiqueta docker-swarm
Origen:
104.197.126.0/32
34.41.23.205/32
34.51.123.84/32
35.208.149.96/32

Puertos:
tcp:2377
tcp:7946
udp:7946
udp:4789
```

Para entrada publica al gateway:

```text
Origen: 0.0.0.0/0
Puerto: tcp:80
Destino: VMs con etiqueta vanguard-http o http-server
```

No incluir `daniel-s` en la regla de Swarm si queda solo como frontend. Para `daniel-s` basta abrir HTTP/HTTPS segun lo que use la pagina.

## DNS

Registros actuales o esperados:

| Dominio | Tipo | Destino | Uso |
| --- | --- | --- | --- |
| api.wissegt.com | A | 104.197.126.0 | Gateway Swarm |
| api.wissegt.com | A | 34.41.23.205 | Gateway Swarm |
| api.wissegt.com | A | 34.51.123.84 | Gateway Swarm |
| api.wissegt.com | A | 35.208.149.96 | Gateway Swarm |
| vanguard.wissegt.com | A | 34.29.45.128 | Pagina/frontend en daniel-s |
| vps.wissegt.com | A | 207.231.111.45 | Infraestructura externa |
| grafana.wissegt.com | A | 207.231.111.45 | Grafana |

## Siguiente Paso

Desde la manager `vps`, con el repo disponible:

```bash
cd Vanguard-U
docker stack deploy -c deploy/docker-stack.yml vanguard
```

Verificar servicios:

```bash
docker service ls
docker service ps vanguard_gateway-ms
docker service ps vanguard_users-ms
docker service ps vanguard_academic-ms
docker service ps vanguard_student-and-enrollment-ms
docker service ps vanguard_billing-ms
```

Si una imagen no descarga, probar manualmente:

```bash
docker pull vanguard12s/gateway-ms:lab
```

## Flujo De Demo

1. Confirmar `docker node ls` con 4 nodos Ready.
2. Desplegar `docker stack deploy`.
3. Confirmar `docker service ls`.
4. Probar `http://api.wissegt.com/actuator/health`.
5. Ejecutar carga con k6.
6. Apagar o detener un worker y mostrar que Swarm reubica servicios.
7. Mostrar metricas en Grafana.

## Apagar Y Encender El Laboratorio

Para ahorrar credito se puede apagar el laboratorio completo. Esto causa caida total de `api.wissegt.com` mientras las VPS esten apagadas.

Antes de apagar, desde la manager `vps`:

```bash
cd ~/Vanguard-U
docker service ls
docker stack rm vanguard
```

Esperar a que desaparezcan los servicios:

```bash
docker service ls
```

Orden recomendado para apagar en Google Cloud:

```text
1. Workers del Swarm: node2, vps4, vps5
2. Manager del Swarm: vps
3. Frontend si tambien se quiere ahorrar: daniel-s
4. Infraestructura vps.wissegt.com solo si se acepta apagar DB/Redis/RabbitMQ/Grafana
```

Orden recomendado para encender:

```text
1. Infraestructura vps.wissegt.com
2. Manager del Swarm: vps
3. Workers del Swarm: node2, vps4, vps5
4. Frontend: daniel-s
```

Despues de encender, entrar a la manager `vps` y validar:

```bash
docker node ls
cd ~/Vanguard-U
docker stack deploy -c deploy/docker-stack.yml vanguard
docker service ls
curl http://api.wissegt.com/actuator/health
```

## Monitoreo Actual

Prometheus y Grafana deben vivir en la VPS de infraestructura `vps.wissegt.com`, no dentro del Swarm de aplicaciones.

```text
Prometheus -> http://vps.wissegt.com:9090
Grafana    -> http://vps.wissegt.com:3000
```

El Swarm solo publica endpoints de metricas para que Prometheus los consulte:

```text
gateway-ms                  -> 104.197.126.0:80/actuator/prometheus
users-ms                    -> 104.197.126.0:8081/actuator/prometheus
academic-ms                 -> 104.197.126.0:8082/actuator/prometheus
student-and-enrollment-ms   -> 104.197.126.0:8083/actuator/prometheus
billing-ms                  -> 104.197.126.0:8084/actuator/prometheus
```

Por seguridad, los puertos `8081-8084` deben abrirse en firewall solo desde la IP de infraestructura:

```text
207.231.111.45/32
```

Grafana:

```text
Usuario: admin
Password: admin
Datasource Prometheus: http://prometheus:9090
```

Resultado esperado:

```text
Los 4 nodos del Swarm vuelven a Ready.
Los servicios vuelven a 2/2.
api.wissegt.com responde UP.
```

Si algun worker vuelve como `Down`, revisar que la VM este encendida y que Docker este activo:

```bash
sudo systemctl status docker
sudo systemctl start docker
```
