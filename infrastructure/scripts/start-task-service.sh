#!/bin/bash

# Start Task Service for Lerian Protocol
# Starts the board-api service and optionally the board-ui service

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
SERVICE_DIR="$PROJECT_ROOT/services/board-api"
UI_DIR="$PROJECT_ROOT/services/board-ui"

# Configuration
DEFAULT_SERVICE_PORT=3020
DEFAULT_HOST="localhost"
DEFAULT_DB_PATH="$PROJECT_ROOT/infrastructure/data/databases/task-management.db"

SERVICE_PORT=${TASK_SERVICE_PORT:-$DEFAULT_SERVICE_PORT}
HOST=${TASK_SERVICE_HOST:-$DEFAULT_HOST}
DB_PATH=${TASK_SERVICE_DB_PATH:-$DEFAULT_DB_PATH}

# PID management
PIDS_DIR="$PROJECT_ROOT/infrastructure/data/pids"
SERVICE_PID_FILE="$PIDS_DIR/board-api.pid"
UI_PID_FILE="$PIDS_DIR/board-ui.pid"

# Logging
LOG_DIR="$PROJECT_ROOT/infrastructure/data/logs"
SERVICE_LOG="$LOG_DIR/board-api.log"
UI_LOG="$LOG_DIR/board-ui.log"

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${BOLD}🔄 $1${NC}"
}

cleanup_on_exit() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "Service startup failed, cleaning up..."
        cleanup_services
    fi
}

cleanup_services() {
    # Kill services if running
    if [ -f "$SERVICE_PID_FILE" ]; then
        local service_pid=$(cat "$SERVICE_PID_FILE")
        if kill -0 "$service_pid" 2>/dev/null; then
            log_info "Stopping board-api service (PID: $service_pid)"
            kill "$service_pid" 2>/dev/null || true
            sleep 2
            if kill -0 "$service_pid" 2>/dev/null; then
                kill -9 "$service_pid" 2>/dev/null || true
            fi
        fi
        rm -f "$SERVICE_PID_FILE"
    fi

    if [ -f "$UI_PID_FILE" ]; then
        local ui_pid=$(cat "$UI_PID_FILE")
        if kill -0 "$ui_pid" 2>/dev/null; then
            log_info "Stopping board-ui service (PID: $ui_pid)"
            kill "$ui_pid" 2>/dev/null || true
            sleep 2
            if kill -0 "$ui_pid" 2>/dev/null; then
                kill -9 "$ui_pid" 2>/dev/null || true
            fi
        fi
        rm -f "$UI_PID_FILE"
    fi
}

wait_for_service() {
    local url=$1
    local max_attempts=${2:-30}
    local attempt=1
    local wait_time=1

    log_step "Waiting for service at $url..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s -f "$url" >/dev/null 2>&1; then
            log_success "Service is healthy at $url"
            return 0
        fi

        log_info "Attempt $attempt/$max_attempts: Service not ready, waiting ${wait_time}s..."
        sleep $wait_time

        # Exponential backoff, max 5s
        wait_time=$((wait_time < 5 ? wait_time + 1 : 5))
        attempt=$((attempt + 1))
    done

    log_error "Service failed to become healthy at $url after $max_attempts attempts"
    return 1
}

setup_environment() {
    log_step "Setting up environment..."

    # Create required directories
    mkdir -p "$PIDS_DIR" "$LOG_DIR"

    # Ensure database directory exists
    mkdir -p "$(dirname "$DB_PATH")"

    # Check service directories
    if [ ! -d "$SERVICE_DIR" ]; then
        log_error "Board API service not found at $SERVICE_DIR"
        exit 1
    fi

    if [ ! -d "$UI_DIR" ]; then
        log_error "Board UI service not found at $UI_DIR"
        exit 1
    fi

    # Install dependencies if needed
    if [ ! -d "$SERVICE_DIR/node_modules" ]; then
        log_step "Installing board-api dependencies..."
        cd "$SERVICE_DIR" && npm install
        log_success "Board API dependencies installed"
    fi

    if [ ! -d "$UI_DIR/node_modules" ]; then
        log_step "Installing board-ui dependencies..."
        cd "$UI_DIR" && npm install
        log_success "Board UI dependencies installed"
    fi

    log_success "Environment setup completed"
}

run_migrations() {
    log_step "Running database migrations..."
    cd "$SERVICE_DIR"

    if [ -f "src/migrate.js" ]; then
        NODE_ENV=development DB_PATH="$DB_PATH" node src/migrate.js
        log_success "Database migrations completed"
    else
        log_warning "No migration script found, skipping..."
    fi
}

start_api_service() {
    log_step "Starting board-api service..."

    cd "$SERVICE_DIR"

    # Set environment variables
    export PORT="$SERVICE_PORT"
    export HOST="$HOST"
    export DB_PATH="$DB_PATH"
    export NODE_ENV=development

    if [ "$MODE" = "dev" ]; then
        # Development mode - start with watching
        log_info "Starting API service in development mode..."
        npm run dev > "$SERVICE_LOG" 2>&1 &
        local service_pid=$!
        echo "$service_pid" > "$SERVICE_PID_FILE"
        log_success "Board API service started in development mode (PID: $service_pid)"
    else
        # Background mode - start normally
        log_info "Starting API service in background mode..."
        npm start > "$SERVICE_LOG" 2>&1 &
        local service_pid=$!
        echo "$service_pid" > "$SERVICE_PID_FILE"
        log_success "Board API service started (PID: $service_pid)"
    fi

    # Wait for service to be healthy
    if ! wait_for_service "http://$HOST:$SERVICE_PORT/health"; then
        log_error "Board API service failed to become healthy"
        return 1
    fi
}

start_ui_service() {
    if [ "$MODE" = "dev" ]; then
        log_step "Starting board-ui service..."

        cd "$UI_DIR"

        # Set environment variables for UI
        export VITE_API_BASE_URL="http://$HOST:$SERVICE_PORT"
        export VITE_WS_URL="ws://$HOST:$SERVICE_PORT"

        log_info "Starting UI service in development mode..."
        npm run dev > "$UI_LOG" 2>&1 &
        local ui_pid=$!
        echo "$ui_pid" > "$UI_PID_FILE"
        log_success "Board UI service started in development mode (PID: $ui_pid)"

        # Give UI service time to start
        sleep 3
        log_info "UI service should be available at http://localhost:5173"
    else
        log_info "UI service not started in background mode"
    fi
}

print_status() {
    echo
    log_success "🚀 Task Services Started Successfully!"
    echo
    echo "   ${BOLD}Configuration:${NC}"
    echo "   ├── Mode: $MODE"
    echo "   ├── Board API: http://$HOST:$SERVICE_PORT"
    if [ "$MODE" = "dev" ]; then
        echo "   ├── Board UI: http://localhost:5173"
    fi
    echo "   └── Database: $DB_PATH"
    echo
    echo "   ${BOLD}Health Checks:${NC}"
    echo "   ├── API Health: curl http://$HOST:$SERVICE_PORT/health"
    echo "   └── List Tasks: curl http://$HOST:$SERVICE_PORT/api/tasks"
    echo
    if [ "$MODE" != "dev" ]; then
        echo "   ${BOLD}Logs:${NC}"
        echo "   ├── API Service: tail -f $SERVICE_LOG"
        echo "   └── UI Service: tail -f $UI_LOG"
        echo
    fi
}

# Main execution
main() {
    # Parse arguments
    MODE="background"  # default mode

    while [[ $# -gt 0 ]]; do
        case $1 in
            --dev)
                MODE="dev"
                shift
                ;;
            --background)
                MODE="background"
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo
                echo "Options:"
                echo "  --dev         Start in development mode (with UI, watching)"
                echo "  --background  Start in background mode (API only)"
                echo "  --help, -h    Show this help message"
                echo
                echo "Environment Variables:"
                echo "  TASK_SERVICE_PORT     Port for board API (default: $DEFAULT_SERVICE_PORT)"
                echo "  TASK_SERVICE_HOST     Host for services (default: $DEFAULT_HOST)"
                echo "  TASK_SERVICE_DB_PATH  Database path (default: relative to project)"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                log_info "Use --help for usage information"
                exit 1
                ;;
        esac
    done

    echo "🚀 Starting Lerian Protocol Task Services..."
    echo "   Mode: $MODE"
    echo "   API Port: $SERVICE_PORT"
    echo "   Host: $HOST"
    echo

    # Set up cleanup trap
    trap cleanup_on_exit EXIT

    # Run startup sequence
    setup_environment
    run_migrations
    start_api_service

    if [ "$MODE" = "dev" ]; then
        start_ui_service
    fi

    print_status

    # In dev mode, keep the script running
    if [ "$MODE" = "dev" ]; then
        log_info "Development mode: Press Ctrl+C to stop all services"
        # Wait for any of the background processes to exit
        wait
    fi
}

# Execute main function
main "$@"