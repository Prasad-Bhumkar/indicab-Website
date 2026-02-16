#!/bin/bash

##############################################################################
# IndiCab VPS Deployment Script
# This script automates the deployment of IndiCab on a single VPS
# Usage: ./deploy.sh [start|stop|restart|logs|backup]
##############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Configuration
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.prod"
LOG_DIR="./logs"
BACKUP_DIR="/var/backups/indicab"

##############################################################################
# Helper Functions
##############################################################################

# Print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if Docker and Docker Compose are installed
check_requirements() {
    print_info "Checking requirements..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Check if environment file exists
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        print_error "Environment file $ENV_FILE not found."
        print_info "Please copy .env.production to $ENV_FILE and configure it."
        exit 1
    fi
    print_success "Environment file found"
}

# Check if required directories exist
check_directories() {
    print_info "Checking directories..."
    
    mkdir -p "$LOG_DIR"
    mkdir -p db-init
    mkdir -p ssl
    mkdir -p html
    
    print_success "Directories ready"
}

# Build Docker images
build_images() {
    print_info "Building Docker images..."
    
    print_info "Building backend image..."
    cd indicab-backend
    docker build -t indicab-backend:latest .
    cd ..
    print_success "Backend image built"
    
    print_info "Building frontend image..."
    cd indicab-frontend
    npm ci
    npm run build
    docker build -f Dockerfile.prod -t indicab-frontend:latest .
    cd ..
    print_success "Frontend image built"
}

# Start services
start_services() {
    print_info "Starting services..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    print_success "Services started"
    
    sleep 5
    
    print_info "Checking service status..."
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

# Stop services
stop_services() {
    print_warning "Stopping services..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
    
    print_success "Services stopped"
}

# Restart services
restart_services() {
    print_warning "Restarting services..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" restart
    
    print_success "Services restarted"
    
    sleep 5
    
    print_info "Service status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

# Show logs
show_logs() {
    local service=$1
    
    if [ -z "$service" ]; then
        print_info "Showing logs from all services (Ctrl+C to exit)..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f
    else
        print_info "Showing logs from $service (Ctrl+C to exit)..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f "$service"
    fi
}

# Backup database
backup_database() {
    print_info "Creating database backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/indicab_backup_$timestamp.sql"
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mysql mysqldump \
        -u indicab_user \
        -p"$(grep MYSQL_PASSWORD $ENV_FILE | cut -d '=' -f 2)" \
        --all-databases > "$backup_file"
    
    gzip "$backup_file"
    
    print_success "Database backed up: ${backup_file}.gz"
    
    # Clean old backups (keep last 30 days)
    find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
}

# Verify deployment
verify_deployment() {
    print_info "Verifying deployment..."
    
    # Check if services are running
    if ! docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "Up"; then
        print_error "Some services are not running!"
        docker-compose -f "$DOCKER_COMPOSE_FILE" ps
        exit 1
    fi
    
    print_success "All services are running"
    
    # Check API endpoint
    print_info "Testing API endpoint..."
    if curl -k -s https://localhost/api/service-cities > /dev/null 2>&1; then
        print_success "API endpoint is accessible"
    else
        print_warning "API endpoint not responding (this may be normal on first startup)"
    fi
    
    # Show service status
    print_info "Service status:"
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

# Clean up unused Docker resources
cleanup() {
    print_warning "Cleaning up Docker resources..."
    
    docker system prune -f
    
    print_success "Cleanup completed"
}

# Show usage
show_usage() {
    cat << EOF
${BLUE}IndiCab VPS Deployment Script${NC}

${YELLOW}Usage:${NC}
    $0 [COMMAND] [OPTIONS]

${YELLOW}Commands:${NC}
    build           Build Docker images
    start           Start all services
    stop            Stop all services
    restart         Restart all services
    logs [SERVICE]  Show logs (optionally for specific service)
    status          Show service status
    verify          Verify deployment
    backup          Backup database
    cleanup         Clean up Docker resources
    help            Show this help message

${YELLOW}Examples:${NC}
    $0 build                    # Build Docker images
    $0 start                    # Start all services
    $0 logs backend             # Show backend logs
    $0 restart                  # Restart all services
    $0 backup                   # Backup database
    $0 logs                     # Show all logs (Ctrl+C to exit)

${YELLOW}Environment:${NC}
    Make sure to configure .env.prod file before deployment

EOF
}

##############################################################################
# Main Script
##############################################################################

main() {
    cd "$SCRIPT_DIR"
    
    # Check if no arguments provided
    if [ $# -eq 0 ]; then
        show_usage
        exit 0
    fi
    
    local command=$1
    local service=$2
    
    case "$command" in
        build)
            check_requirements
            check_directories
            build_images
            ;;
        start)
            check_requirements
            check_env_file
            check_directories
            start_services
            verify_deployment
            ;;
        stop)
            check_requirements
            stop_services
            ;;
        restart)
            check_requirements
            restart_services
            verify_deployment
            ;;
        logs)
            check_requirements
            show_logs "$service"
            ;;
        status)
            check_requirements
            docker-compose -f "$DOCKER_COMPOSE_FILE" ps
            ;;
        verify)
            check_requirements
            verify_deployment
            ;;
        backup)
            check_requirements
            backup_database
            ;;
        cleanup)
            check_requirements
            cleanup
            ;;
        help|-h|--help)
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
