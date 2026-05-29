#!/bin/bash
# backup.sh - Exports MySQL database schema and records as timestamped backups

BACKUP_DIR="database/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/stock_backup_$TIMESTAMP.sql"

echo "=========================================================="
echo "Initializing MySQL Database backup snapshot..."
echo "=========================================================="
# Load environment variables from backend/.env if it exists
if [ -f "backend/.env" ]; then
  # Load active variables ignoring comments
  export $(grep -v '^#' backend/.env | xargs)
fi

DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-}
DB_NAME=${DB_NAME:-stock_prediction}
DB_HOST=${DB_HOST:-localhost}

echo "Database Host: $DB_HOST"
echo "Database User: $DB_USER"
echo "Database Name: $DB_NAME"

if [ -z "$DB_PASSWORD" ]; then
  mysqldump -h "$DB_HOST" -u "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
else
  mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
  echo "Backup successfully exported to $BACKUP_FILE"
  # Compress backup file
  gzip "$BACKUP_FILE"
  echo "Compressed snapshot created."
else
  echo "Error occurred during MySQL database backup."
fi
