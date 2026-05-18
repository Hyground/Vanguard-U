# Plan Temporal - Alta Disponibilidad Vanguard-U En VPS

## Decision Actual

El laboratorio se centrara en VPS Linux, no en PCs Windows con Docker Desktop.

Motivo: el objetivo principal es alta disponibilidad real de microservicios. Para eso se necesita que Docker Swarm pueda mover servicios entre nodos cuando una maquina cae. En Windows con Docker Desktop hubo bloqueo porque Docker no podia anunciar correctamente la IP de red externa. En VPS Ubuntu, Docker Engine corre directamente sobre Linux y Swarm funciona de forma mas limpia.

## Objetivo De La Demo

Demostrar:

```text
1. Los microservicios corren en varias VPS.
2. El gateway entra por un endpoint publico.
3. Los servicios se comunican por nombre interno, no por IP fija.
4. Si una VPS cae, Swarm recrea los servicios en otra VPS disponible.
5. Se monitorea el comportamiento con Prometheus y Grafana.
6. Se ejecuta carga con k6, por ejemplo 50,000 peticiones totales.
```

## Arquitectura Objetivo

```text
Usuarios / k6
   |
   v
IP publica de cualquier nodo Swarm con puerto 80
   |
   v
gateway-ms
   |
   v
Red overlay Docker Swarm
   |
   +--> users-ms
   +--> academic-ms
   +--> student-and-enrollment-ms
   +--> billing-ms

Microservicios
   |
   v
vps.wissegt.com
   +--> PostgreSQL master  :5432
   +--> PostgreSQL replica :5433
   +--> Redis              :6379
   +--> RabbitMQ           :5672

Monitoreo
   +--> Prometheus
   +--> Grafana

Pruebas de carga
   +--> k6
```

## Separacion De Responsabilidades

### VPS De Aplicacion

Estas VPS forman el cluster Swarm.

Responsabilidades:

- Ejecutar Docker Engine.
- Descargar imagenes desde Docker Hub.
- Correr los microservicios.
- Reubicar servicios si una VPS cae.

No deben contener:

- Codigo fuente del proyecto.
- Maven.
- PostgreSQL principal.
- RabbitMQ principal.
- Redis principal.

### VPS De Infraestructura

Actualmente:

```text
vps.wissegt.com
```

Responsabilidades:

- PostgreSQL master.
- PostgreSQL replica.
- Redis.
- RabbitMQ.

Tambien puede alojar Prometheus y Grafana para la demo.

### Maquina De Pruebas

Puede ser:

```text
tu PC
una VPS aparte
una de las VPS del laboratorio
```

Responsabilidad:

- Ejecutar k6 contra el gateway.

Para 50,000 peticiones totales, se recomienda correr k6 desde una VPS para que el internet local no sea el cuello de botella.

## Donde Debe Vivir Grafana

Para la demo, la opcion recomendada es:

```text
Grafana + Prometheus en vps.wissegt.com
```

Motivos:

- Ya es la VPS de infraestructura.
- No compite directamente con los microservicios del Swarm.
- Si una VPS de aplicacion cae, el monitoreo sigue vivo.
- Permite explicar claramente: apps por un lado, infraestructura/observabilidad por otro.

Alternativa aceptable:

```text
Grafana + Prometheus en una quinta VPS pequena
```

No recomendado para la demo:

```text
Grafana dentro del mismo stack de microservicios
```

Motivo: si se cae o se satura el cluster durante la prueba de carga, tambien se puede afectar el monitoreo. Para explicar al ingeniero, conviene que el monitoreo este separado.

## Donde Debe Vivir k6

k6 no necesita estar siempre prendido.

Opciones:

```text
1. Desde una VPS aparte: recomendado para prueba de 50,000 peticiones.
2. Desde tu PC: sirve, pero tu internet puede alterar los resultados.
3. Desde vps.wissegt.com: posible, pero puede mezclar carga de prueba con infraestructura.
```

Recomendacion:

```text
k6 en una VPS temporal.
```

Despues de la prueba se puede apagar o borrar esa VPS.

## Imagenes Docker Ya Preparadas

Las imagenes ya fueron construidas y publicadas en Docker Hub:

```text
vanguard12s/gateway-ms:lab
vanguard12s/users-ms:lab
vanguard12s/academic-ms:lab
vanguard12s/student-and-enrollment-ms:lab
vanguard12s/billing-ms:lab
```

Estas imagenes sirven para las VPS. En las VPS no se compila el proyecto; solo se descargan las imagenes.

Flujo en cada nodo:

```text
Docker Swarm recibe el stack
  -> decide en que VPS corre cada servicio
  -> la VPS descarga la imagen desde Docker Hub
  -> Docker levanta el contenedor
```

## Stack Actual

El archivo principal es:

```text
deploy/docker-stack.yml
```

Debe usar:

```text
image: vanguard12s/<servicio>:lab
```

Y el gateway debe apuntar a nombres internos:

```text
USERS_MS_URL=http://users-ms:8081
ACADEMIC_MS_URL=http://academic-ms:8082
STUDENT_MS_URL=http://student-and-enrollment-ms:8083
BILLING_MS_URL=http://billing-ms:8084
```

Regla clave:

```text
El gateway no debe apuntar a IPs de VPS.
El gateway apunta a nombres de servicio.
Docker Swarm resuelve esos nombres dentro de la red overlay.
```

## Variables De Infraestructura

Archivo:

```text
env/.env
```

Valores esperados:

```properties
DB_HOST=vps.wissegt.com
DB_PORT=5432
DB_WRITE_HOST=vps.wissegt.com
DB_WRITE_PORT=5432
DB_READ_HOST=vps.wissegt.com
DB_READ_PORT=5433
DB_NAME=bdedu
DB_USERNAME=bd2equipomari
DB_PASSWORD=<password>

REDIS_HOST=vps.wissegt.com
REDIS_PORT=6379
REDIS_PASSWORD=<password>

RABBITMQ_HOST=vps.wissegt.com
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=vanguard_user
RABBITMQ_PASSWORD=<password>
```

Nota: las credenciales no deberian exponerse publicamente. Para la demo pueden estar en `.env`, pero para una entrega mas seria conviene usar secretos de Docker o variables configuradas en el servidor.

## Cluster Swarm En 4 VPS

Modelo recomendado:

```text
VPS1 -> manager
VPS2 -> worker
VPS3 -> worker
VPS4 -> worker
```

Para una demo mas resistente:

```text
VPS1 -> manager
VPS2 -> manager
VPS3 -> manager
VPS4 -> worker
```

Con 3 managers, si un manager cae, el cluster mantiene quorum.

Para una prueba simple, un manager y tres workers alcanza para demostrar reubicacion de servicios, pero no alta disponibilidad completa del control plane.

## Requisitos Por VPS

Sistema:

```text
Ubuntu 22.04 o 24.04
Docker Engine
acceso a internet
puertos Swarm abiertos entre VPS
```

Puertos entre nodos:

```text
2377/tcp  -> control Swarm
7946/tcp  -> comunicacion entre nodos
7946/udp  -> comunicacion entre nodos
4789/udp  -> red overlay
```

Puerto publico para usuarios:

```text
80/tcp -> gateway
```

Para RabbitMQ/Redis/PostgreSQL, solo las VPS de aplicacion deberian poder conectarse a `vps.wissegt.com`.

## Crear El Swarm

En VPS1:

```bash
docker swarm init --advertise-addr <IP_PUBLICA_VPS1>
docker swarm join-token worker
```

En VPS2, VPS3 y VPS4:

```bash
docker swarm join --token <TOKEN> <IP_PUBLICA_VPS1>:2377
```

Validar desde VPS1:

```bash
docker node ls
```

Resultado esperado:

```text
4 nodos activos
```

Opcional, promover VPS2 y VPS3 a managers:

```bash
docker node promote <NODO_VPS2>
docker node promote <NODO_VPS3>
```

## Desplegar El Sistema

Desde VPS1:

```bash
docker stack deploy -c deploy/docker-stack.yml vanguard
```

Ver servicios:

```bash
docker service ls
```

Ver donde quedo cada servicio:

```bash
docker service ps vanguard_gateway-ms
docker service ps vanguard_users-ms
docker service ps vanguard_academic-ms
docker service ps vanguard_student-and-enrollment-ms
docker service ps vanguard_billing-ms
```

## Replicas Recomendadas Para VPS Pequenas

Si las VPS son gratis o muy pequenas:

```text
gateway-ms: 2 replicas
users-ms: 1 replica
academic-ms: 1 replica
student-and-enrollment-ms: 1 replica
billing-ms: 1 replica
```

Motivo: Spring Boot consume memoria. Dos replicas de todo pueden saturar VPS pequenas.

Para demostrar failover, basta con una replica por servicio y matar la VPS donde corre una replica. Swarm debe levantarla en otro nodo disponible.

Si las VPS tienen mas RAM:

```text
gateway-ms: 2 replicas
users-ms: 2 replicas
academic-ms: 2 replicas
student-and-enrollment-ms: 2 replicas
billing-ms: 2 replicas
```

## Limites De Memoria Y Java

En VPS pequenas se debe limitar Java.

Recomendado por servicio:

```yaml
environment:
  - JAVA_TOOL_OPTIONS=-XX:MaxRAMPercentage=60 -XX:InitialRAMPercentage=30
deploy:
  resources:
    limits:
      memory: 512M
    reservations:
      memory: 256M
```

Para gateway puede ser similar.

Si una VPS tiene solo 1 GB RAM, no conviene correr muchos servicios en el mismo nodo.

## Healthchecks

Cada microservicio expone Actuator.

Endpoints:

```text
/actuator/health
/actuator/prometheus
```

Swarm debe usar healthchecks para saber si un contenedor esta sano.

Ejemplo:

```yaml
healthcheck:
  test: ["CMD", "wget", "-qO-", "http://localhost:8081/actuator/health"]
  interval: 30s
  timeout: 5s
  retries: 3
  start_period: 60s
```

Nota: si la imagen no trae `wget` o `curl`, se debe ajustar el Dockerfile o usar otro metodo.

## Monitoreo Con Prometheus Y Grafana

Prometheus debe consultar:

```text
http://<gateway>:8080/actuator/prometheus
http://<users>:8081/actuator/prometheus
http://<academic>:8082/actuator/prometheus
http://<student>:8083/actuator/prometheus
http://<billing>:8084/actuator/prometheus
```

En Swarm, si Prometheus vive fuera del cluster, hay dos opciones:

```text
1. Exponer temporalmente los puertos de cada microservicio.
2. Publicar Prometheus como servicio dentro del Swarm.
```

Para la demo se recomienda una opcion simple:

```text
Prometheus + Grafana en vps.wissegt.com
microservicios exponiendo sus puertos temporalmente para scraping
```

Si se quiere una arquitectura mas limpia:

```text
Prometheus dentro del Swarm
Grafana en vps.wissegt.com o dentro del Swarm
Prometheus scrapea servicios por nombre interno
```

Para explicar al ingeniero:

```text
Prometheus recolecta metricas.
Grafana visualiza las metricas.
k6 genera trafico.
Swarm mantiene los servicios vivos.
```

Metricas importantes:

```text
latencia
errores HTTP 5xx
uso de memoria
uso de CPU
estado de replicas
tiempo de recuperacion despues de caida
```

## Prueba De 50,000 Peticiones Con k6

Definicion recomendada:

```text
50,000 peticiones totales, no 50,000 peticiones por segundo.
```

Ejemplo de prueba:

```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    fixed_requests: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 50000,
      maxDuration: '10m',
    },
  },
};

export default function () {
  const res = http.get('http://<IP_PUBLICA_GATEWAY>/actuator/health');
  check(res, {
    'status 200': (r) => r.status === 200,
  });
}
```

Luego se pueden probar endpoints reales:

```text
/api/v1/auth/**
/api/v1/users/**
/api/v1/courses/**
/api/v1/students/**
/api/v1/billing/**
```

No iniciar con endpoints que escriben masivamente en la base de datos sin preparar datos y limites.

## Pruebas De Failover

### Prueba 1 - Matar Un Contenedor

En un nodo:

```bash
docker ps
docker kill <container_id>
```

Validar:

```bash
docker service ps vanguard_users-ms
```

Resultado esperado:

```text
Swarm crea otro contenedor para mantener la replica declarada.
```

### Prueba 2 - Apagar Una VPS Worker

Apagar VPS2 desde Google Cloud.

Validar en VPS1:

```bash
docker node ls
docker service ps vanguard_users-ms
docker service ps vanguard_gateway-ms
```

Resultado esperado:

```text
El nodo aparece Down.
Los servicios que estaban ahi se recrean en otros nodos disponibles.
```

### Prueba 3 - Durante Carga k6

Ejecutar k6 y apagar una VPS worker durante la prueba.

Medir:

```text
cuantos errores hubo
cuanto tardo en recuperarse
si el gateway siguio respondiendo
si Grafana muestra la caida
```

## Que Se Debe Explicar Al Ingeniero

Puntos clave:

```text
1. Docker Swarm es el orquestador.
2. Docker Hub guarda las imagenes.
3. Las VPS descargan imagenes, no compilan codigo.
4. El gateway usa nombres internos de servicio.
5. Swarm recrea servicios si un nodo falla.
6. La base, Redis y RabbitMQ viven en vps.wissegt.com.
7. Prometheus recolecta metricas.
8. Grafana muestra las metricas.
9. k6 genera carga para validar comportamiento.
```

Frase simple:

```text
No levantamos contenedores manualmente por maquina.
Declaramos servicios en un stack.
Docker Swarm mantiene ese estado deseado.
```

## Pendientes Antes De La Demo

Guia operativa:

```text
deploy/GUIA_VPS_SWARM.md
```

1. Crear las 4 VPS Ubuntu.
2. Instalar Docker Engine en cada VPS.
3. Configurar firewall de Google Cloud.
4. Crear el Swarm.
5. Subir o clonar el repo en la VPS manager solo para tener `deploy/docker-stack.yml` y `env/.env`.
6. Ejecutar `docker stack deploy`.
7. Verificar que cada servicio arranca.
8. Configurar Prometheus y Grafana.
9. Preparar script k6.
10. Probar failover con una VPS apagada.

## Decision Recomendada

Para la demo:

```text
4 VPS Google Cloud Ubuntu
Docker Swarm con IP publica
Docker Hub como registry
vps.wissegt.com como infraestructura
Prometheus + Grafana en vps.wissegt.com
k6 desde VPS temporal
```

No usar Tailscale en esta fase, salvo que el firewall entre VPS se vuelva demasiado incomodo.
