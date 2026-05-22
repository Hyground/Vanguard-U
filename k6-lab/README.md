# Vanguard K6 Lab

Aplicacion separada para ejecutar pruebas k6 contra `https://api.wissegt.com`.

No pertenece a `Vanguard-web`, `gateway-ms` ni `users-ms`. La idea es desarrollarla local y luego moverla a una VPS externa con dominio como `k6.wissegt.com`.

## Local

Requisitos:

- Docker funcionando.
- Acceso a internet hacia `https://api.wissegt.com`.

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
- `1` VU
- `2m` maximo

Sube a 1,000/10,000 solo cuando Grafana y logs esten visibles.

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
