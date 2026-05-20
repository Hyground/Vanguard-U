# Backup y Restauracion PostgreSQL

La base oficial de Vanguard-U vive en Patroni. Los respaldos deben hacerse por HAProxy contra el puerto de escritura:

```text
34.68.197.98:5000
```

No usar la PostgreSQL antigua de `vps.wissegt.com`; pertenecia a la arquitectura anterior y esta apagada.

## Respaldo Manual

Desde una maquina con acceso a `34.68.197.98:5000`:

```bash
mkdir -p /root/infra-wave/backups
PGPASSWORD='Kj82_mP91_Xz77_Rt' pg_dump \
  -h 34.68.197.98 \
  -p 5000 \
  -U bd2equipomari \
  -d bdedu \
  | gzip > /root/infra-wave/backups/bdedu-$(date +%Y%m%d-%H%M%S).sql.gz
```

## Restauracion Manual

Restaurar modifica la base activa. Usar solo con una razon clara y respaldo previo.

```bash
gunzip -c /root/infra-wave/backups/bdedu-YYYYMMDD-HHMMSS.sql.gz | \
PGPASSWORD='Kj82_mP91_Xz77_Rt' psql \
  -h 34.68.197.98 \
  -p 5000 \
  -U bd2equipomari \
  -d bdedu
```

## Validar

```bash
PGPASSWORD='Kj82_mP91_Xz77_Rt' psql \
  -h 34.68.197.98 \
  -p 5000 \
  -U bd2equipomari \
  -d bdedu \
  -c "select count(*) from information_schema.tables where table_schema='public';"
```

Esperado en la migracion actual:

```text
24 tablas
```

## Pendiente: Backup Automatico

Actualmente el respaldo documentado es manual. Falta implementar backup automatico programado para Patroni.

Recomendacion:

```text
Frecuencia: diario
Destino: carpeta local de backups y, si es posible, almacenamiento externo
Retencion: varios dias de respaldos
Validacion: probar restauracion periodicamente
```

Una opcion simple es ejecutar `infrastructure/scripts/pg_backup.sh` con `cron` desde una maquina con acceso a `34.68.197.98:5000`.
