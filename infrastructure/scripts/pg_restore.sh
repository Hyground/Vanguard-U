#!/usr/bin/env sh
set -eu

DB_HOST="${DB_HOST:-34.68.197.98}"
DB_PORT="${DB_PORT:-5000}"
DB_NAME="${DB_NAME:-bdedu}"
DB_USER="${DB_USER:-bd2equipomari}"
BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 /path/to/backup.sql.gz" >&2
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE" >&2
  exit 1
fi

gunzip -c "$BACKUP_FILE" | PGPASSWORD="${DB_PASSWORD:-Kj82_mP91_Xz77_Rt}" psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME"

echo "Restore completed from: $BACKUP_FILE"
