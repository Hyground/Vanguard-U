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

- `docker-stack.yml`: despliegue distribuido con Docker Swarm.
- Healthchecks por servicio.
- Variables de entorno por servicio.

## Fase Actual

La fase actual es subir y probar en la nube, no validar en una sola computadora.

Objetivo:

```text
Imágenes Docker por microservicio
  -> registry accesible por los nodos
  -> cluster Swarm en la nube
  -> gateway-ms como entrada estable
  -> réplicas reubicables entre máquinas
```

## Archivos Ya Presentes

Todos los microservicios ya tienen su Dockerfile en `services/`:

- `services/gateway-ms/Dockerfile`
- `services/users-ms/Dockerfile`
- `services/academic-ms/Dockerfile`
- `services/student-and-enrollment-ms/Dockerfile`
- `services/billing-ms/Dockerfile`

## Validacion En Nube

La validacion principal debe hacerse ya sobre la nube.

Modelo recomendado:

```text
Nodo manager
Nodo worker
Nodo worker
Nodo worker
```

El manager coordina el cluster, pero no debe ser la unica maquina ejecutando servicios.

El stack debe definir replicas, por ejemplo:

```text
gateway-ms: 2 replicas
users-ms: 2 replicas
academic-ms: 2 replicas
student-and-enrollment-ms: 2 replicas
billing-ms: 2 replicas
```

Docker Swarm decide en que nodo ejecuta cada replica y puede reubicarla si una maquina cae.

## Proyecto, JARs E Imagenes

El proyecto completo puede quedarse en la computadora de desarrollo o manager.
Los nodos de la nube no necesitan el repositorio completo; necesitan Docker y acceso a las imagenes.

Flujo recomendado:

1. Compilar los JAR en la computadora principal.
2. Construir imagenes Docker por microservicio.
3. Publicar o distribuir las imagenes al registry o a los nodos del cluster.
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
