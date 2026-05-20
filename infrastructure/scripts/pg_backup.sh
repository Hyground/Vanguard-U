#!/usr/bin/env sh
set -eu

DB_HOST="${DB_HOST:-34.68.197.98}"
DB_PORT="${DB_PORT:-5000}"
DB_NAME="${DB_NAME:-bdedu}"
DB_USER="${DB_USER:-bd2equipomari}"
BACKUP_DIR="${BACKUP_DIR:-/root/infra-wave/backups}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
OUTPUT_FILE="${BACKUP_DIR}/${DB_NAME}-${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

PGPASSWORD="${DB_PASSWORD:-Kj82_mP91_Xz77_Rt}" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  | gzip > "$OUTPUT_FILE"

echo "Backup created: $OUTPUT_FILE"
