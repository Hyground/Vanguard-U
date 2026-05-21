# Vanguard-U load tests

Scripts k6 para generar carga externa contra `api.wissegt.com` y observar el impacto en Grafana.

## Linea base

```bash
docker run --rm -i -e BASE_URL=https://api.wissegt.com grafana/k6 run - < load-tests/vanguard-read-baseline.js
```

## Estres progresivo

```bash
docker run --rm -i -e BASE_URL=https://api.wissegt.com grafana/k6 run - < load-tests/vanguard-stress.js
```

## Dashboards a observar

- `Vanguard-U Microservices`: trafico, latencia, errores HTTP, CPU/JVM.
- `Vanguard-U PostgreSQL`: conexiones, transacciones, sesiones, locks y actividad de datos.
