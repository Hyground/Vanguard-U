# Diagnostico Swarm y Patroni

Ejecutar estos comandos desde la VPS manager del Swarm (`vps`) salvo que se indique otra maquina.

## 1. Estado real del Swarm

```bash
docker node ls
docker service ls
docker service ps vanguard_gateway-ms --no-trunc
docker service ps vanguard_users-ms --no-trunc
docker service ps vanguard_academic-ms --no-trunc
docker service ps vanguard_student-and-enrollment-ms --no-trunc
docker service ps vanguard_billing-ms --no-trunc
```

Si un nodo aparece `Ready Active` pero sin tareas, el nodo esta vivo pero Swarm no movio servicios de regreso. Eso es normal: Docker Swarm reprograma tareas cuando un nodo cae, pero no rebalancea automaticamente cuando vuelve.

## 2. Rebalancear despues de revivir un nodo

```bash
docker service update --force vanguard_gateway-ms
docker service update --force vanguard_users-ms
docker service update --force vanguard_academic-ms
docker service update --force vanguard_student-and-enrollment-ms
docker service update --force vanguard_billing-ms
```

Validar otra vez:

```bash
docker service ps vanguard_gateway-ms
docker service ps vanguard_users-ms
docker service ps vanguard_academic-ms
docker service ps vanguard_student-and-enrollment-ms
docker service ps vanguard_billing-ms
```

## 3. Ver lo que consume la pagina web

```bash
curl -k -m 10 https://api.wissegt.com/api/swarm/state
curl -k -m 10 https://api.wissegt.com/api/patroni/state
curl -k -m 10 https://api.wissegt.com/actuator/health
```

Resultado actual observado:

```text
/api/swarm/state responde, y node2 esta Ready Active pero sin tareas.
/api/patroni/state responde DATABASE_UNREACHABLE.
/actuator/health responde UP.
```

## 4. Puertos y firewall entre Swarm y Patroni

Desde la manager `vps`:

```bash
nc -vz -w 5 34.68.197.98 5000
nc -vz -w 5 34.68.197.98 5001
nc -vz -w 5 34.45.194.127 8008
nc -vz -w 5 34.29.234.240 8008
curl -m 5 http://34.45.194.127:8008/cluster
curl -m 5 http://34.29.234.240:8008/cluster
```

Si `5000/5001` abren pero `8008` falla, la aplicacion puede seguir usando la base por HAProxy, pero la pantalla no puede saber quien es lider/replica de forma real. Abrir `8008/tcp` solo para las IPs del Swarm y de administracion.

## 5. Verificar lider real de PostgreSQL

Desde una maquina con `psql`:

```bash
PGPASSWORD='<DB_PASSWORD>' psql -h 34.68.197.98 -p 5000 -U bd2equipomari -d bdedu -c "select inet_server_addr(), pg_is_in_recovery();"
PGPASSWORD='<DB_PASSWORD>' psql -h 34.68.197.98 -p 5001 -U bd2equipomari -d bdedu -c "select inet_server_addr(), pg_is_in_recovery();"
```

Esperado:

```text
5000 -> pg_is_in_recovery = false
5001 -> pg_is_in_recovery = true
```

## 6. Ver Patroni desde los nodos BD

En `bd2` y `bd3`:

```bash
patronictl -c /etc/patroni/config.yml list
curl -m 5 http://127.0.0.1:8008/cluster
```

Si local funciona pero desde `vps` no funciona, es firewall/ruta. Si local tampoco funciona, revisar Patroni.

## 7. Reglas GCP que deben existir

Swarm entre nodos:

```text
2377/tcp
7946/tcp
7946/udp
4789/udp
```

Patroni/BD desde Swarm e IP administrativa:

```text
5000/tcp
5001/tcp
5432/tcp
8008/tcp
2379/tcp
2380/tcp
```

Origen minimo:

```text
104.197.126.0/32
34.41.23.205/32
34.51.123.84/32
35.208.149.96/32
207.231.111.45/32
```
