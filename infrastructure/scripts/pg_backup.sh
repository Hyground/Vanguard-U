#!/usr/bin/env sh
set -eu

CONTAINER_NAME="${CONTAINER_NAME:-pg-master}"
DB_NAME="${DB_NAME:-bdedu}"
DB_USER="${DB_USER:-bd2equipomari}"
BACKUP_DIR="${BACKUP_DIR:-/backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTPUT_FILE="${BACKUP_DIR}/${DB_NAME}-${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

docker exec "$CONTAINER_NAME" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$OUTPUT_FILE"

echo "Backup created: $OUTPUT_FILE"
