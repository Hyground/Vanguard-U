# Vanguard K6 Lab

Aplicacion separada para ejecutar pruebas k6 contra `https://api.wissegt.com`.

No pertenece a `Vanguard-web`, `gateway-ms` ni `users-ms`. La idea es desarrollarla local y luego moverla a una VPS externa con dominio como `k6.wissegt.com`.

Para la actividad de observabilidad y estres, usar la guia especifica del proyecto:

```text
k6-lab/ACTIVIDAD_VANGUARD_U.md
```

## Local

Requisitos:

- Docker funcionando.
- Acceso a internet hacia `https://api.wissegt.com`.
- Docker socket disponible para que el panel pueda lanzar contenedores `grafana/k6`.

Levantar:

```bash
cd k6-lab
docker compose up --build
```

Abrir:

```text
http://localhost:3006
```

## Uso seguro

La pagina inicia con 10 peticiones. Presets disponibles:

- 10
- 1,000
- 10,000
- 50,000
- 100,000

Targets:

- Login
- Usuarios
- Estudiantes
- Inscripciones
- Pagos
- Todo

Para pruebas iniciales usa:

- `10` peticiones
- `10` VUs
- `15m` maximo

Sube a 1,000/10,000 solo cuando Grafana y logs esten visibles.

## Ruta recomendada hasta 50,000

No empieces con 50,000. Primero valida que la API, la base y los logs respondan de forma estable.

El laboratorio usa `constant-arrival-rate`: calcula cuantas iteraciones por segundo necesita para intentar terminar el volumen dentro del tiempo configurado.

1. Smoke: `10` peticiones, `10` VUs, `15m`.
2. Base: `1,000` peticiones, `25` VUs, `15m`.
3. Presion media: `10,000` peticiones, `75` VUs, `15m`.
4. Objetivo: `50,000` peticiones, `250` VUs, `15m`.

Referencias de tasa:

- `10,000` en `15m`: cerca de `12` iteraciones/s.
- `50,000` en `15m`: cerca de `56` iteraciones/s.
- Target `Todo` hace varias llamadas por iteracion, asi que genera mas requests HTTP reales que el numero configurado.

Durante cada corrida revisa:

- `Error rate`: debe mantenerse bajo; cualquier 5xx indica saturacion o bug.
- `P95`: si sube fuerte, hay cuello de botella aunque los requests terminen.
- `2xx / 4xx / 5xx`: los 401/403 suelen ser credenciales o token; los 5xx son backend/base.
- Logs de la API y metricas de DB: CPU, memoria, conexiones activas, locks y queries lentas.
- `dropped_iterations` en k6: si aparece, faltan VUs o la API esta demasiado lenta para la tasa pedida.

Para medir base de datos, prioriza targets con lectura de datos:

- `Estudiantes`
- `Inscripciones`
- `Pagos`
- `Todo`, solo cuando los targets individuales ya esten estables.

## Variables

En `docker-compose.yml`:

```yaml
BASE_URL=https://api.wissegt.com
LOAD_USERNAME=load_admin
LOAD_PASSWORD=Demo123!
```

## Notas de despliegue VPS

En una VPS externa:

```bash
cd k6-lab
docker compose up -d --build
```

Luego Caddy/Nginx puede apuntar:

```text
k6.wissegt.com -> localhost:3006
```

La VPS necesita montar Docker socket porque el backend lanza contenedores `grafana/k6`:

```yaml
volumes:
  - /var/run/docker.sock:/var/run/docker.sock
```

## Resultados

Cada corrida guarda un JSON en:

```text
k6-lab/runs/<run-id>.json
```

La UI muestra:

- estado,
- requests,
- error rate,
- p95,
- promedio,
- logs.
