# Mapa Temporal - Alta Disponibilidad Vanguard-U

## Decision Inicial

El primer paso debe ser la alta disponibilidad de los microservicios.

Motivo: actualmente los servicios se levantan uno por uno con Maven y dependen de IPs fijas de Tailscale. Eso funciona para prueba manual, pero no para recuperacion automatica. Antes de tocar la base de datos, conviene lograr que los servicios puedan moverse entre PCs sin que el gateway tenga que conocer la IP exacta donde quedo cada uno.

La base de datos tambien es parte de la meta, pero debe entrar como segunda fase porque requiere promocion de replicas, control de consistencia y un endpoint estable para escrituras.

## Arquitectura Objetivo Del Laboratorio

```text
4 PCs conectadas por Tailscale
        |
        v
Docker Swarm para microservicios
        |
        v
Gateway consume servicios por nombre, no por IP
        |
        v
PostgreSQL HA con Patroni + HAProxy
```

## Regla Principal

No se debe depender de IPs fijas de microservicios.

Las IPs de Tailscale sirven para conectar las maquinas. No deben ser la forma principal en que el gateway encuentra cada servicio.

Modelo actual manual:

```text
gateway -> http://100.x.x.x:8081
gateway -> http://100.x.x.x:8082
gateway -> http://100.x.x.x:8083
gateway -> http://100.x.x.x:8084
```

Modelo recomendado con Swarm:

```text
gateway -> http://users-ms:8081
gateway -> http://academic-ms:8082
gateway -> http://student-and-enrollment-ms:8083
gateway -> http://billing-ms:8084
```

Docker Swarm sabe en que PC esta cada contenedor. Si un servicio cae y se levanta en otra PC, el nombre del servicio sigue siendo el mismo.

## Mapa De Las 4 PCs

### PC1

Responsabilidades:

- Docker Swarm manager.
- Gateway.
- Posible HAProxy para entrada a la base de datos.
- Posible PostgreSQL nodo 1.

### PC2

Responsabilidades:

- Docker Swarm worker.
- Replicas de microservicios.
- Posible PostgreSQL nodo 2.

### PC3

Responsabilidades:

- Docker Swarm worker.
- Replicas de microservicios.
- Posible PostgreSQL nodo 3.

### PC4

Responsabilidades:

- Docker Swarm worker.
- Replicas de microservicios.
- Monitoreo o servicios auxiliares.
- Opcionalmente Redis/RabbitMQ si se decide mover infraestructura.

## Fase 1 - Microservicios Con Alta Disponibilidad

Objetivo: que los microservicios se reinicien solos y puedan correr en cualquier PC disponible.

Trabajo necesario:

1. Crear rama de laboratorio.

```powershell
git checkout -b lab/alta-disponibilidad
```

2. Usar Docker Swarm sobre Tailscale.

```text
PC1 -> manager
PC2 -> worker
PC3 -> worker
PC4 -> worker
```

3. Construir imagenes Docker por microservicio.

```powershell
.\scripts\build-images.ps1 -Registry <registry> -Tag lab
```

4. Publicar imagenes en un registry accesible por las 4 PCs.

5. Ajustar `deploy/docker-stack.yml`.

Puntos minimos:

- Usar nombres internos de servicio.
- Definir replicas.
- Definir `restart_policy`.
- Agregar healthchecks usando `/actuator/health`.
- Evitar IPs quemadas de Tailscale dentro del gateway.

6. Desplegar stack.

```powershell
docker stack deploy -c deploy/docker-stack.yml vanguard
```

7. Probar caidas.

```powershell
docker service ls
docker service ps vanguard_users-ms
docker kill <container>
```

Resultado esperado:

```text
Contenedor cae
  -> Swarm detecta que falta una replica
  -> Swarm levanta otra
  -> gateway sigue llamando users-ms:8081
```

## Fase 2 - Base De Datos Con Alta Disponibilidad

Objetivo: que si cae PostgreSQL principal, una replica pueda convertirse en principal.

La replica actual no necesariamente toma el mando sola. Una replica PostgreSQL normal suele estar en modo lectura. Para failover automatico se necesita un sistema adicional.

Componentes recomendados:

```text
Patroni -> decide quien es primary
etcd o Consul -> consenso
HAProxy -> endpoint estable para microservicios
PostgreSQL -> datos
```

Modelo:

```text
microservicios
   -> HAProxy DB
      -> primary actual para escrituras
      -> replicas para lecturas
```

Variables recomendadas:

```properties
DB_WRITE_HOST=haproxy-db
DB_WRITE_PORT=5432
DB_READ_HOST=haproxy-db
DB_READ_PORT=5433
```

Comportamiento esperado:

```text
PostgreSQL primary cae
  -> Patroni detecta la caida
  -> Patroni promueve una replica
  -> HAProxy redirige escrituras al nuevo primary
  -> microservicios siguen usando el mismo host y puerto
```

## Por Que No Empezar Por La BD

La BD es el objetivo mas importante, pero tambien es la parte con mas riesgo conceptual.

Si primero se resuelve microservicios:

- Se valida que Tailscale une bien las PCs.
- Se valida que Swarm descubre servicios por nombre.
- Se valida reinicio automatico.
- Se elimina la dependencia de IPs duras en el gateway.
- Se prepara el terreno para que la BD use tambien un endpoint estable.

Despues, la BD se agrega con el mismo principio:

```text
Los clientes no persiguen IPs.
Los clientes usan un nombre estable.
Una capa especializada decide donde esta el servicio activo.
```

## Decision Final Recomendada

Orden de trabajo:

```text
1. Microservicios con Docker Swarm sobre Tailscale.
2. Healthchecks y pruebas de caida de contenedores.
3. Pruebas de caida de una PC worker.
4. PostgreSQL HA con Patroni + HAProxy.
5. Prueba de caida del primary de PostgreSQL.
6. Actualizar README principal solo cuando el flujo ya funcione.
```

Esta ruta permite avanzar por capas y probar cada fallo de forma clara.

## Preparacion De Cada PC

Si las PCs usan Windows, Docker Desktop sirve para este laboratorio.

Requisitos por PC:

- Docker Desktop instalado.
- Docker Desktop usando Linux containers.
- Tailscale instalado e iniciado.
- La PC visible desde las otras PCs por Tailscale.
- El firewall permitiendo trafico necesario entre nodos.
- Acceso al registry donde estaran las imagenes Docker.

Validar en cada PC:

```powershell
docker version
docker info
tailscale status
```

Si `docker info` responde correctamente, Docker esta listo en esa PC.

## Puertos A Considerar

Para Docker Swarm entre PCs se deben permitir estos puertos entre las IPs de Tailscale:

```text
2377/tcp  -> administracion del cluster Swarm
7946/tcp  -> comunicacion entre nodos
7946/udp  -> comunicacion entre nodos
4789/udp  -> red overlay de contenedores
```

Para el sistema:

```text
8080/tcp -> gateway-ms
8081/tcp -> users-ms, solo si se expone fuera de Swarm
8082/tcp -> academic-ms, solo si se expone fuera de Swarm
8083/tcp -> student-and-enrollment-ms, solo si se expone fuera de Swarm
8084/tcp -> billing-ms, solo si se expone fuera de Swarm
```

En el modelo recomendado, solo el gateway debe exponerse para clientes externos. Los otros microservicios deben comunicarse por la red interna de Swarm.

## Inicializacion De Swarm

En la PC1, que sera manager, usar la IP de Tailscale de esa PC:

```powershell
docker swarm init --advertise-addr <IP_TAILSCALE_PC1>
```

Ese comando devuelve un `docker swarm join ...`.

En PC2, PC3 y PC4 se ejecuta el comando `join` que entrega PC1:

```powershell
docker swarm join --token <TOKEN> <IP_TAILSCALE_PC1>:2377
```

Validar desde PC1:

```powershell
docker node ls
```

Resultado esperado:

```text
PC1 -> manager
PC2 -> worker
PC3 -> worker
PC4 -> worker
```

## Imagenes Docker

Cada microservicio debe tener su propia imagen.

El flujo recomendado es construir y publicar desde una sola PC:

```powershell
.\scripts\build-images.ps1 -Registry <registry> -Tag lab -Push
```

Ejemplo de nombres esperados:

```text
<registry>/gateway-ms:lab
<registry>/users-ms:lab
<registry>/academic-ms:lab
<registry>/student-and-enrollment-ms:lab
<registry>/billing-ms:lab
```

Las 4 PCs deben poder descargar esas imagenes:

```powershell
docker pull <registry>/gateway-ms:lab
```

Si no hay registry, el laboratorio se complica porque cada PC tendria que tener las imagenes cargadas manualmente. Es mejor usar Docker Hub, GHCR o un registry privado.

## Ajuste Esperado Del Stack

El archivo `deploy/docker-stack.yml` debe quedar usando imagenes publicadas y nombres internos.

La idea general es:

```yaml
gateway-ms:
  image: <registry>/gateway-ms:lab
  ports:
    - "8080:8080"
  environment:
    - USERS_MS_URL=http://users-ms:8081
    - ACADEMIC_MS_URL=http://academic-ms:8082
    - STUDENT_MS_URL=http://student-and-enrollment-ms:8083
    - BILLING_MS_URL=http://billing-ms:8084

users-ms:
  image: <registry>/users-ms:lab

academic-ms:
  image: <registry>/academic-ms:lab

student-and-enrollment-ms:
  image: <registry>/student-and-enrollment-ms:lab

billing-ms:
  image: <registry>/billing-ms:lab
```

Regla:

```text
El gateway apunta a nombres de servicio.
Los nombres de servicio los resuelve Docker Swarm.
Las IPs de Tailscale solo conectan las PCs.
```

## Prueba Minima Antes De BD HA

Antes de tocar Patroni/PostgreSQL HA, probar esto:

1. Desplegar stack.

```powershell
docker stack deploy -c deploy/docker-stack.yml vanguard
```

2. Ver servicios.

```powershell
docker service ls
```

3. Ver donde quedo cada replica.

```powershell
docker service ps vanguard_gateway-ms
docker service ps vanguard_users-ms
docker service ps vanguard_academic-ms
docker service ps vanguard_student-and-enrollment-ms
docker service ps vanguard_billing-ms
```

4. Matar un contenedor de prueba.

```powershell
docker ps
docker kill <container_id>
```

5. Confirmar que Swarm levanta otro.

```powershell
docker service ps vanguard_users-ms
```

Si esto funciona, ya existe alta disponibilidad basica de microservicios.

## Decision Sobre Docker Desktop

Para este laboratorio, si: usar Docker Desktop en cada PC es aceptable.

Condiciones:

- Todas las PCs deben estar en la misma tailnet.
- Docker debe estar corriendo antes de unir la PC al Swarm.
- Las PCs deben poder comunicarse por los puertos de Swarm.
- No se debe depender de IPs locales de WiFi o LAN.
- Para comandos de Swarm se debe usar la IP de Tailscale.

Si despues se quiere llevar esto a produccion, conviene mover los nodos a Linux server o VPS. Pero para probar alta disponibilidad en laboratorio, Docker Desktop + Tailscale es suficiente.

## Explicacion Simple De Swarm

Docker normal levanta contenedores en una sola maquina.

Ejemplo:

```text
PC1 levanta users-ms
PC2 levanta academic-ms
PC3 levanta billing-ms
```

Si `users-ms` cae en PC1, Docker de PC2 no sabe nada. Cada Docker trabaja solo.

Docker Swarm junta varias maquinas y las trata como un grupo.

Ejemplo:

```text
PC1 + PC2 + PC3 = un cluster Swarm
```

Dentro del cluster se crean servicios:

```text
users-ms con 2 replicas
academic-ms con 2 replicas
billing-ms con 2 replicas
gateway-ms con 1 o 2 replicas
```

Swarm decide en que PC corre cada replica. Si una replica cae, Swarm crea otra.

Idea central:

```text
Nosotros no levantamos contenedor por contenedor.
Nosotros declaramos servicios.
Swarm mantiene esos servicios vivos.
```

## Registry Docker

Un registry es el lugar donde se guardan las imagenes Docker para que todas las PCs puedan descargarlas.

Sin registry:

```text
PC1 tiene la imagen
PC2 no la tiene
PC3 no la tiene
```

Con registry:

```text
PC1 sube imagenes al registry
PC2 descarga imagenes del registry
PC3 descarga imagenes del registry
```

Opcion mas simple para el laboratorio:

```text
Docker Hub
https://hub.docker.com
```

Pasos:

1. Entrar a `https://hub.docker.com`.
2. Crear cuenta o iniciar sesion.
3. Usar el usuario de Docker Hub como `<registry>`.

Ejemplo, si el usuario fuera `miusuario`:

```powershell
docker login
.\scripts\build-images.ps1 -Registry miusuario -Tag lab -Push
```

Eso publicaria imagenes como:

```text
miusuario/gateway-ms:lab
miusuario/users-ms:lab
miusuario/academic-ms:lab
miusuario/student-and-enrollment-ms:lab
miusuario/billing-ms:lab
```

Luego en cualquier PC:

```powershell
docker pull miusuario/gateway-ms:lab
```

Si ese `pull` funciona en PC2 y PC3, el registry esta listo.

## Plan Temporal Con 3 PCs

Ahora mismo hay 3 PCs:

```text
PC1 -> esta PC actual, manager Swarm temporal
PC2 -> worker temporal
PC3 -> worker temporal
```

Mas adelante se agrega PC4.

La configuracion temporal debe servir para pruebas, no como configuracion final.

### Paso 1 - En Las 3 PCs

Instalar y abrir:

```text
Docker Desktop
Tailscale
```

Validar:

```powershell
docker version
docker info
tailscale status
```

Las 3 PCs deben aparecer en `tailscale status`.

### Paso 2 - Ver IP De Tailscale

En cada PC:

```powershell
tailscale ip -4
```

Anotar:

```text
PC1_TAILSCALE_IP=...
PC2_TAILSCALE_IP=...
PC3_TAILSCALE_IP=...
```

### Paso 3 - Crear El Swarm En PC1

En PC1:

```powershell
docker swarm init --advertise-addr <PC1_TAILSCALE_IP>
```

Si funciona, Docker devuelve un comando parecido a:

```powershell
docker swarm join --token <TOKEN> <PC1_TAILSCALE_IP>:2377
```

Ese comando se copia y se ejecuta en PC2 y PC3.

### Paso 4 - Unir PC2 Y PC3

En PC2:

```powershell
docker swarm join --token <TOKEN> <PC1_TAILSCALE_IP>:2377
```

En PC3:

```powershell
docker swarm join --token <TOKEN> <PC1_TAILSCALE_IP>:2377
```

### Paso 5 - Validar Desde PC1

En PC1:

```powershell
docker node ls
```

Resultado esperado:

```text
3 nodos visibles
PC1 como Leader/Manager
PC2 como Worker
PC3 como Worker
```

## Nota Importante Sobre Docker Desktop Y Tailscale

Docker Desktop en Windows corre Docker dentro de una maquina Linux interna.

En algunos equipos puede pasar que Docker Swarm no logre usar bien la IP de Tailscale del Windows host. Si ocurre alguno de estos problemas:

```text
docker swarm init no acepta la IP de Tailscale
los workers no pueden unirse
los servicios no se comunican entre PCs
la red overlay no funciona
```

Entonces el plan B recomendado es:

```text
usar Ubuntu/WSL2 con Docker Engine y Tailscale dentro de WSL2
o usar VPS/Linux para los nodos del cluster
```

Para comenzar, se prueba con Docker Desktop porque es lo mas rapido. Si falla por red, no es problema del proyecto; es una limitacion comun de Docker Desktop + redes VPN.

## Lo Que Se Debe Hacer Ahora

Orden exacto para este momento:

```text
1. Crear cuenta en Docker Hub.
2. Hacer docker login en esta PC.
3. Construir y subir imagenes con scripts/build-images.ps1.
4. Instalar Docker Desktop y Tailscale en PC2 y PC3.
5. Confirmar que PC2 y PC3 pueden hacer docker pull de una imagen.
6. Crear Swarm en PC1 con IP de Tailscale.
7. Unir PC2 y PC3 como workers.
8. Corregir deploy/docker-stack.yml para usar el usuario real del registry.
9. Desplegar el stack.
10. Probar caida de un contenedor.
```

Cada IP, usuario de registry o cambio temporal debe anotarse aqui para poder corregirlo despues.
