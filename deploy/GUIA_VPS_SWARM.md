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

Importante para este laboratorio:

```text
Las 4 VPS estan en cuentas/proyectos/redes distintas de Google Cloud.
Por eso Docker Swarm debe usar IPs publicas, no IPs privadas 10.x.x.x.
Cada companero debe crear la regla de firewall en su propio proyecto.
```

IPs publicas actuales del laboratorio:

```text
vps      -> 104.197.126.0  -> manager
node2    -> 34.41.23.205   -> worker
vps4     -> 34.51.123.84   -> worker
vps5     -> 35.208.149.96  -> worker
daniel-s -> 34.29.45.128   -> frontend/pagina, fuera del Swarm
```

En cada proyecto/cuenta de Google Cloud:

1. Ir a `Compute Engine > VM instances`.
2. Editar la VM.
3. En `Etiquetas de red`, agregar:

```text
docker-swarm
vanguard-http
```

4. Ir a `Red de VPC > Firewall > Crear regla de firewall`.
5. Crear la regla para Swarm:

```text
Nombre: allow-docker-swarm
Red: default
Direccion del trafico: Entrada
Accion en caso de coincidencia: Permitir
Destinos: Etiquetas de destino especificadas
Etiquetas de destino: docker-swarm
Filtro de origen: Rangos de IPv4
Rangos de IPv4 de origen:
104.197.126.0/32,34.41.23.205/32,34.51.123.84/32,35.208.149.96/32
```

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

Para HTTP se puede usar la regla automatica de Google Cloud `http-server` si la VM tiene marcada la opcion `Allow HTTP traffic`.

No incluir `daniel-s` en la regla de Swarm si queda solo como frontend. Para `daniel-s` basta abrir HTTP/HTTPS segun lo que use la pagina.

No abrir los puertos de Swarm a `0.0.0.0/0` salvo emergencia. Lo correcto es restringirlos a las 4 IPs publicas del Swarm con `/32`.

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

Estado actual:

```text
El Swarm ya fue creado.
Manager: vps -> 104.197.126.0
Workers unidos: node2, vps4, vps5
```

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

Estado actual:

```text
node2 -> Ready
vps4  -> Ready
vps5  -> Ready
```

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

Para `api.wissegt.com`, crear registros A.

Opcion demo:

```text
api.wissegt.com -> 104.197.126.0
api.wissegt.com -> 34.41.23.205
api.wissegt.com -> 34.51.123.84
api.wissegt.com -> 35.208.149.96
```

Como Swarm publica el puerto 80 en los nodos, el gateway puede responder desde cualquier VPS viva.

`daniel-s` queda fuera del Swarm para la pagina/frontend. `vanguard.wissegt.com` apunta a `34.29.45.128`.

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
  const res = http.get('http://api.wissegt.com/actuator/health');
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

## 14. Apagar Y Encender El Laboratorio

Para ahorrar credito se puede apagar todo el laboratorio. Mientras este apagado, `api.wissegt.com` no responde.

### Apagar

Desde la manager `vps`:

```bash
cd ~/Vanguard-U
docker stack rm vanguard
docker service ls
```

Esperar a que `docker service ls` ya no muestre servicios `vanguard_*`.

Luego apagar en Google Cloud:

```text
1. Workers: node2, vps4, vps5
2. Manager: vps
3. Frontend si aplica: daniel-s
4. Infraestructura vps.wissegt.com solo si se acepta apagar DB/Redis/RabbitMQ/Grafana
```

No apagar primero `vps` si todavia se quiere administrar el Swarm, porque es el unico manager.

### Encender

Encender en este orden:

```text
1. Infraestructura: vps.wissegt.com
2. Manager: vps
3. Workers: node2, vps4, vps5
4. Frontend: daniel-s
```

Validar desde la manager:

```bash
docker node ls
cd ~/Vanguard-U
docker stack deploy -c deploy/docker-stack.yml vanguard
docker service ls
curl http://api.wissegt.com/actuator/health
```

Resultado esperado:

```text
Los nodos vuelven a Ready.
Los servicios quedan 2/2.
La API responde {"status":"UP"}.
```

Si un nodo no vuelve:

```bash
sudo systemctl status docker
sudo systemctl start docker
docker info | grep Swarm
```

## 15. Explicacion Para El Ingeniero

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
