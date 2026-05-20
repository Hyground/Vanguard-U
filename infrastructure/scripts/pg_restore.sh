#!/usr/bin/env sh
set -eu

CONTAINER_NAME="${CONTAINER_NAME:-pg-master}"
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

gunzip -c "$BACKUP_FILE" | docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME"

echo "Restore completed from: $BACKUP_FILE"
