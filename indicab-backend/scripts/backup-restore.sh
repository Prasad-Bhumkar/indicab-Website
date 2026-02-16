#!/bin/bash

# IndiCab Database Backup and Restore Script
# Usage: ./backup-restore.sh [backup|restore] [db_name] [db_user] [db_password] [backup_file]

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/backup_restore_${DATE}.log"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[ERROR] $1" >> "$LOG_FILE"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    echo "[WARNING] $1" >> "$LOG_FILE"
}

# Function to display usage
usage() {
    echo "Usage: $0 [backup|restore] [database_name] [database_user] [database_password] [backup_file (for restore)]"
    echo ""
    echo "Examples:"
    echo "  Backup:  $0 backup indicab_website root my_password"
    echo "  Restore: $0 restore indicab_website root my_password ./backups/backup_20240215_120000.sql"
    exit 1
}

# Validate inputs
if [ $# -lt 4 ]; then
    print_error "Insufficient arguments provided"
    usage
fi

COMMAND=$1
DB_NAME=$2
DB_USER=$3
DB_PASSWORD=$4
BACKUP_FILE=${5:-""}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Initialize log file
echo "=== IndiCab Database Backup/Restore Log ===" > "$LOG_FILE"
echo "Command: $COMMAND" >> "$LOG_FILE"
echo "Database: $DB_NAME" >> "$LOG_FILE"
echo "User: $DB_USER" >> "$LOG_FILE"
echo "Date: $(date)" >> "$LOG_FILE"
echo "===========================================" >> "$LOG_FILE"

# Function to backup database
backup_database() {
    local output_file="${BACKUP_DIR}/${DB_NAME}_backup_${DATE}.sql"
    
    print_status "Starting database backup for: $DB_NAME"
    print_status "Output file: $output_file"
    
    # Check if mysqldump is installed
    if ! command -v mysqldump &> /dev/null; then
        print_error "mysqldump not found. Please install MySQL client utilities."
        exit 1
    fi
    
    # Perform backup with compression
    if mysqldump -u "$DB_USER" -p"$DB_PASSWORD" \
        --single-transaction \
        --quick \
        --lock-tables=false \
        --routines \
        --triggers \
        --events \
        "$DB_NAME" > "$output_file" 2>> "$LOG_FILE"; then
        
        # Compress the backup
        gzip "$output_file"
        output_file="${output_file}.gz"
        
        local file_size=$(du -h "$output_file" | cut -f1)
        print_status "Backup completed successfully!"
        print_status "Backup file: $output_file (Size: $file_size)"
        
        # Keep only last 7 backups
        print_status "Cleaning up old backups (keeping last 7)"
        ls -t ${BACKUP_DIR}/${DB_NAME}_backup_*.sql.gz | tail -n +8 | xargs -r rm
        
    else
        print_error "Backup failed. Check logs for details."
        exit 1
    fi
}

# Function to restore database
restore_database() {
    if [ -z "$BACKUP_FILE" ]; then
        print_error "Backup file path is required for restore operation"
        usage
    fi
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        exit 1
    fi
    
    print_warning "Starting database restore from: $BACKUP_FILE"
    print_warning "This will overwrite existing data in: $DB_NAME"
    echo -n "Are you sure? (yes/no): "
    read -r confirm
    
    if [ "$confirm" != "yes" ]; then
        print_status "Restore cancelled by user"
        exit 0
    fi
    
    # Check if mysql is installed
    if ! command -v mysql &> /dev/null; then
        print_error "mysql not found. Please install MySQL client utilities."
        exit 1
    fi
    
    # Decompress if needed
    local sql_file="$BACKUP_FILE"
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        print_status "Decompressing backup file..."
        sql_file="${BACKUP_FILE%.gz}"
        gunzip -k "$BACKUP_FILE" 2>> "$LOG_FILE"
    fi
    
    # Drop and recreate database
    print_status "Preparing database for restore..."
    mysql -u "$DB_USER" -p"$DB_PASSWORD" << EOF >> "$LOG_FILE" 2>&1
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF
    
    # Restore database
    print_status "Restoring database from backup..."
    if mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$sql_file" 2>> "$LOG_FILE"; then
        print_status "Restore completed successfully!"
        print_status "Database restored to: $DB_NAME"
    else
        print_error "Restore failed. Check logs for details."
        exit 1
    fi
    
    # Cleanup decompressed file if we decompressed it
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        rm -f "$sql_file"
    fi
}

# Main script execution
case "$COMMAND" in
    backup)
        backup_database
        ;;
    restore)
        restore_database
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        usage
        ;;
esac

print_status "Operation completed. Log file: $LOG_FILE"
