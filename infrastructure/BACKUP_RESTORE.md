# Backup y restauracion PostgreSQL

Esta guia documenta la parte de BD de la demo. La replica ayuda en lecturas, pero el respaldo es lo que permite recuperacion real ante borrados o errores logicos.

## Objetivo

- Demostrar persistencia.
- Demostrar recuperacion tras borrado accidental.
- Demostrar que la replica no reemplaza al backup.

## Respaldo manual

```bash
cd /root/infra-wave
BACKUP_DIR=/root/infra-wave/backups sh infrastructure/scripts/pg_backup.sh
```

## Restauracion manual

```bash
sh infrastructure/scripts/pg_restore.sh /root/infra-wave/backups/bdedu-YYYYMMDD-HHMMSS.sql.gz
```

## Lectura tecnica

- `pg-master` es la fuente de verdad para escrituras.
- `pg-replica` sirve para lecturas de apoyo.
- El backup permite recuperar datos si un usuario borra filas o si una prueba rompe la consistencia.
- Para failover automatico real se necesita Patroni, repmgr o un servicio administrado.
