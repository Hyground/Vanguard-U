# Despliegue De Microservicios

Esta carpeta documenta el despliegue de los microservicios con Docker.

No mezclar estos archivos con `infrastructure/docker-compose.yml`, porque ese compose es para PostgreSQL/Redis local.

## Modelo Objetivo

```text
Cliente
  -> gateway-ms
  -> replicas de microservicios
  -> PostgreSQL en la nube
```

Cada microservicio debe tener su propia imagen Docker:

- `vanguard-gateway-ms`
- `vanguard-users-ms`
- `vanguard-academic-ms`
- `vanguard-student-and-enrollment-ms`
- `vanguard-billing-ms`

No se debe crear una sola imagen con todos los microservicios.

## Archivos Pendientes

- `docker-compose.local.yml`: prueba local en una sola computadora.
- `docker-stack.yml`: despliegue distribuido con Docker Swarm.
- Dockerfile para `users-ms`.
- Dockerfile para `academic-ms`.
- Dockerfile para `student-and-enrollment-ms`.
- Healthchecks por servicio.
- Variables de entorno por servicio.

## Prueba En Una Sola Computadora

Primero se debe probar localmente:

```text
gateway-ms: 1 replica
users-ms: 2 replicas
academic-ms: 2 replicas
student-and-enrollment-ms: 2 replicas
billing-ms: 2 replicas
```

Objetivo de la prueba:

- matar una replica
- confirmar que otra replica responde
- confirmar que gateway sigue enrutando

## Docker Swarm En 4 Computadoras

Modelo recomendado:

```text
PC A: manager
PC B: worker
PC C: worker
PC D: worker
```

El manager coordina el cluster, pero no debe ser la unica computadora que ejecuta servicios.

El stack debe definir replicas, por ejemplo:

```text
gateway-ms: 2 replicas
users-ms: 2 replicas
academic-ms: 2 replicas
student-and-enrollment-ms: 2 replicas
billing-ms: 2 replicas
```

Docker Swarm decide en que computadora ejecuta cada replica.

## Proyecto, JARs E Imagenes

El proyecto completo debe vivir en la computadora de desarrollo o manager.
Las otras computadoras no necesitan el proyecto completo.

Flujo recomendado:

1. Compilar los JAR en la computadora principal.
2. Construir imagenes Docker por microservicio.
3. Distribuir las imagenes a las computadoras del cluster.
4. Desplegar con `docker stack deploy`.

## PostgreSQL

La base principal vive en la nube.
Los microservicios se conectan usando variables:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`

Las replicas de PostgreSQL no deben configurarse dentro de cada microservicio.
Si se necesita replicacion de base de datos, se define en PostgreSQL o en el proveedor cloud.

## Redis

Redis no reemplaza PostgreSQL.

Usos posibles:

- cache de catalogos academicos
- rate limiting en gateway
- tokens temporales
- validaciones frecuentes
- bloqueos o datos efimeros

No usar Redis como almacenamiento principal para pagos, notas, inscripciones o datos criticos.

## Carga Mayor A 5,000 Peticiones

Antes de prometer soporte para mas de 5,000 peticiones se debe hacer:

- pruebas de carga
- indices en PostgreSQL
- ajuste de pools de conexion
- timeouts
- healthchecks
- metricas
- cache Redis solo donde las pruebas demuestren beneficio
