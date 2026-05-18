# Guia De Despliegue En VPS Con Docker Swarm

## Objetivo

Levantar Vanguard-U en 4 VPS Ubuntu usando Docker Swarm para tener failover de microservicios.

Arquitectura:

```text
Tu PC
  -> k6

4 VPS Google Cloud
  -> Docker Swarm
  -> microservicios

vps.wissegt.com
  -> PostgreSQL master
  -> PostgreSQL replica
  -> Redis
  -> RabbitMQ
  -> Prometheus
  -> Grafana
```

## 1. Crear Las VPS

Crear 4 VPS Ubuntu:

```text
VPS1 -> manager Swarm
VPS2 -> worker
VPS3 -> worker
VPS4 -> worker
```

Recomendado:

```text
Ubuntu 22.04 o 24.04
minimo 1 GB RAM para prueba
mejor 2 GB RAM o mas
```

Anotar:

```text
IP_PUBLICA_VPS1=
IP_PUBLICA_VPS2=
IP_PUBLICA_VPS3=
IP_PUBLICA_VPS4=
```

## 2. Firewall En Google Cloud

Abrir entre las 4 VPS:

```text
2377/tcp
7946/tcp
7946/udp
4789/udp
```

Abrir para usuarios/k6:

```text
80/tcp
```

Para demo rapida puede abrirse a `0.0.0.0/0`, pero lo correcto es restringir los puertos Swarm solo a las IPs publicas de las otras VPS.

## 3. Instalar Docker En Cada VPS

Ejecutar en VPS1, VPS2, VPS3 y VPS4:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Cerrar sesion SSH y volver a entrar.

Validar:

```bash
docker version
docker info
```

## 4. Preparar La VPS Manager

En VPS1 clonar o copiar el proyecto:

```bash
git clone <URL_DEL_REPO>
cd Vanguard-U
```

Si no se clona todo el proyecto, minimo deben existir:

```text
deploy/docker-stack.yml
env/.env
```

Validar que el stack use las imagenes:

```text
vanguard12s/gateway-ms:lab
vanguard12s/users-ms:lab
vanguard12s/academic-ms:lab
vanguard12s/student-and-enrollment-ms:lab
vanguard12s/billing-ms:lab
```

Validar que `env/.env` apunte a:

```text
vps.wissegt.com
```

## 5. Crear El Swarm

En VPS1:

```bash
docker swarm init --advertise-addr <IP_PUBLICA_VPS1>
```

Obtener comando para workers:

```bash
docker swarm join-token worker
```

Copiar el comando que devuelve Docker.

## 6. Unir Workers

En VPS2, VPS3 y VPS4 ejecutar el comando que devolvio VPS1:

```bash
docker swarm join --token <TOKEN> <IP_PUBLICA_VPS1>:2377
```

Validar desde VPS1:

```bash
docker node ls
```

Debe mostrar 4 nodos.

## 7. Desplegar Vanguard-U

En VPS1, dentro del repo:

```bash
docker stack deploy -c deploy/docker-stack.yml vanguard
```

Ver servicios:

```bash
docker service ls
```

Ver tareas:

```bash
docker service ps vanguard_gateway-ms
docker service ps vanguard_users-ms
docker service ps vanguard_academic-ms
docker service ps vanguard_student-and-enrollment-ms
docker service ps vanguard_billing-ms
```

Ver logs de un servicio:

```bash
docker service logs -f vanguard_gateway-ms
```

## 8. DNS Del Dominio

Para `vanguard.wissegt.com`, crear registros A.

Opcion demo:

```text
vanguard.wissegt.com -> IP_PUBLICA_VPS1
vanguard.wissegt.com -> IP_PUBLICA_VPS2
vanguard.wissegt.com -> IP_PUBLICA_VPS3
vanguard.wissegt.com -> IP_PUBLICA_VPS4
```

Como Swarm publica el puerto 80 en los nodos, el gateway puede responder desde cualquier VPS viva.

## 9. Preparar vps.wissegt.com

Confirmar que esten vivos:

```text
PostgreSQL master  :5432
PostgreSQL replica :5433
Redis              :6379
RabbitMQ           :5672
Prometheus         :9090
Grafana            :3000
```

Desde una VPS del Swarm probar conectividad:

```bash
nc -vz vps.wissegt.com 5432
nc -vz vps.wissegt.com 5433
nc -vz vps.wissegt.com 6379
nc -vz vps.wissegt.com 5672
```

Si `nc` no existe:

```bash
sudo apt install -y netcat-openbsd
```

## 10. Prometheus Y Grafana

Prometheus vive en:

```text
vps.wissegt.com:9090
```

Grafana vive en:

```text
vps.wissegt.com:3000
```

Para la demo se deben monitorear:

```text
/actuator/health
/actuator/prometheus
```

Metricas a mostrar:

```text
latencia
errores HTTP
memoria
CPU
servicios vivos
recuperacion despues de caida
```

## 11. k6 Desde Tu PC

Instalar k6 en tu PC o usar Docker.

Script ejemplo `k6-50000.js`:

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
  const res = http.get('http://vanguard.wissegt.com/actuator/health');
  check(res, {
    'status 200': (r) => r.status === 200,
  });
}
```

Ejecutar:

```bash
k6 run k6-50000.js
```

Si se usa Docker:

```bash
docker run --rm -i grafana/k6 run - < k6-50000.js
```

## 12. Prueba De Failover

### Matar Un Contenedor

En cualquier VPS:

```bash
docker ps
docker kill <CONTAINER_ID>
```

Validar en VPS1:

```bash
docker service ps vanguard_users-ms
```

Resultado esperado:

```text
Swarm crea otro contenedor.
```

### Apagar Una VPS Worker

Apagar VPS2 desde Google Cloud.

Validar en VPS1:

```bash
docker node ls
docker service ps vanguard_gateway-ms
docker service ps vanguard_users-ms
```

Resultado esperado:

```text
El nodo aparece Down.
Los servicios se recrean en VPS disponibles.
```

### Durante k6

Ejecutar k6 y apagar una VPS worker.

Observar:

```text
errores temporales
tiempo de recuperacion
servicios movidos por Swarm
metricas en Grafana
```

## 13. Comandos Utiles

Estado del cluster:

```bash
docker node ls
```

Servicios:

```bash
docker service ls
```

Tareas por servicio:

```bash
docker service ps <SERVICIO>
```

Logs:

```bash
docker service logs -f <SERVICIO>
```

Actualizar stack:

```bash
docker stack deploy -c deploy/docker-stack.yml vanguard
```

Bajar stack:

```bash
docker stack rm vanguard
```

## 14. Explicacion Para El Ingeniero

Resumen:

```text
Docker Hub guarda las imagenes.
Docker Swarm orquesta las VPS.
El manager recibe el deploy.
Los workers ejecutan contenedores.
El gateway recibe las peticiones.
Los microservicios se comunican por nombres internos.
La base, Redis y RabbitMQ viven en vps.wissegt.com.
Prometheus recolecta metricas.
Grafana muestra metricas.
k6 genera 50,000 peticiones totales.
```

Frase clave:

```text
No levantamos servicios manualmente por maquina.
Declaramos el estado deseado en docker-stack.yml.
Swarm mantiene ese estado y recrea servicios si un nodo falla.
```
