#!/bin/bash

# Stop MCP Stack for Lerian Protocol
# Gracefully stops both board-service and board-mcp with proper cleanup

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# PID management
PIDS_DIR="$PROJECT_ROOT/infrastructure/data/pids"
STACK_PID_FILE="$PIDS_DIR/mcp-stack.pid"
SERVICE_PID_FILE="$PIDS_DIR/task-service.pid"
MCP_PID_FILE="$PIDS_DIR/board-mcp.pid"

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

stop_process() {
    local pid=$1
    local name=$2
    local force=${3:-false}
    
    if [ -z "$pid" ]; then
        return 0
    fi
    
    # Check if process exists
    if ! kill -0 "$pid" 2>/dev/null; then
        log_info "$name process (PID: $pid) is not running"
        return 0
    fi
    
    log_step "Stopping $name (PID: $pid)..."
    
    if [ "$force" = "true" ]; then
        kill -9 "$pid" 2>/dev/null || true
        log_success "$name force stopped"
        return 0
    fi
    
    # Try graceful shutdown first
    kill -TERM "$pid" 2>/dev/null || true
    
    # Wait for graceful shutdown
    local attempt=1
    local max_attempts=10
    
    while [ $attempt -le $max_attempts ]; do
        if ! kill -0 "$pid" 2>/dev/null; then
            log_success "$name stopped gracefully"
            return 0
        fi
        
        log_info "Waiting for $name to stop (attempt $attempt/$max_attempts)..."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    # Force kill if still running
    log_warning "$name did not stop gracefully, force stopping..."
    kill -9 "$pid" 2>/dev/null || true
    
    # Final check
    sleep 1
    if kill -0 "$pid" 2>/dev/null; then
        log_error "Failed to stop $name (PID: $pid)"
        return 1
    else
        log_success "$name force stopped"
        return 0
    fi
}

cleanup_pid_file() {
    local pid_file=$1
    local name=$2
    
    if [ -f "$pid_file" ]; then
        log_info "Cleaning up $name PID file"
        rm -f "$pid_file"
    fi
}

find_and_stop_processes() {
    local force=${1:-false}
    
    log_step "Searching for running MCP stack processes..."
    
    # Find board-service processes
    local service_pids=$(pgrep -f "board-service" 2>/dev/null || true)
    if [ -n "$service_pids" ]; then
        log_info "Found board-service processes: $service_pids"
        for pid in $service_pids; do
            stop_process "$pid" "board-service" "$force"
        done
    fi
    
    # Find board-mcp processes  
    local mcp_pids=$(pgrep -f "board-mcp" 2>/dev/null || true)
    if [ -n "$mcp_pids" ]; then
        log_info "Found board-mcp processes: $mcp_pids"
        for pid in $mcp_pids; do
            stop_process "$pid" "board-mcp" "$force"
        done
    fi
    
    # Also check for processes using our ports
    local service_port_pids=$(lsof -ti :3020 2>/dev/null || true)
    if [ -n "$service_port_pids" ]; then
        log_info "Found processes on service port 3020: $service_port_pids"
        for pid in $service_port_pids; do
            stop_process "$pid" "service-port-3020" "$force"
        done
    fi
    
    local mcp_port_pids=$(lsof -ti :3021 2>/dev/null || true)
    if [ -n "$mcp_port_pids" ]; then
        log_info "Found processes on MCP port 3021: $mcp_port_pids"
        for pid in $mcp_port_pids; do
            stop_process "$pid" "mcp-port-3021" "$force"
        done
    fi
}

stop_stack_from_pids() {
    local force=${1:-false}
    
    if [ ! -f "$STACK_PID_FILE" ]; then
        log_warning "No stack PID file found at $STACK_PID_FILE"
        return 1
    fi
    
    log_step "Stopping MCP stack from PID information..."
    
    # Read stack information
    source "$STACK_PID_FILE" 2>/dev/null || true
    
    if [ -n "$STARTED" ]; then
        log_info "Stack was started: $STARTED"
    fi
    
    if [ -n "$STACK_MODE" ]; then
        log_info "Stack mode: $STACK_MODE"
    fi
    
    # Clean up MCP interface configuration (if exists)
    if [ -f "$MCP_PID_FILE" ]; then
        log_info "Cleaning up MCP interface configuration..."
        cleanup_pid_file "$MCP_PID_FILE" "MCP interface"
    fi
    
    # Stop service using existing script if possible
    if [ -f "$SERVICE_PID_FILE" ]; then
        log_step "Stopping board service using existing script..."
        if [ "$force" = "true" ]; then
            # For force mode, use direct process termination
            SERVICE_PID=$(cat "$SERVICE_PID_FILE" 2>/dev/null || true)
            if [ -n "$SERVICE_PID" ]; then
                stop_process "$SERVICE_PID" "board-service" "$force"
            fi
            cleanup_pid_file "$SERVICE_PID_FILE" "service"
        else
            # Use existing stop script for graceful shutdown
            "$SCRIPT_DIR/stop-task-service.sh" 2>/dev/null || {
                log_warning "Existing stop script failed, using direct process termination"
                SERVICE_PID=$(cat "$SERVICE_PID_FILE" 2>/dev/null || true)
                if [ -n "$SERVICE_PID" ]; then
                    stop_process "$SERVICE_PID" "board-service" false
                fi
                cleanup_pid_file "$SERVICE_PID_FILE" "service"
            }
        fi
    fi
    
    # Clean up stack PID file
    cleanup_pid_file "$STACK_PID_FILE" "stack"
    
    return 0
}

interactive_stop() {
    find_and_stop_processes false
    
    # Check if anything is still running
    local remaining_service=$(pgrep -f "board-service" 2>/dev/null || true)
    local remaining_mcp=$(pgrep -f "board-mcp" 2>/dev/null || true)
    
    if [ -n "$remaining_service" ] || [ -n "$remaining_mcp" ]; then
        echo
        log_warning "Some processes are still running:"
        [ -n "$remaining_service" ] && log_warning "  Board service: $remaining_service"
        [ -n "$remaining_mcp" ] && log_warning "  Board MCP: $remaining_mcp"
        echo
        echo -n "Force stop remaining processes? (y/N): "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            find_and_stop_processes true
        fi
    fi
}

print_status() {
    echo
    log_success "🛑 Lerian Protocol MCP Stack Stopped"
    echo
    echo "   ${BOLD}Cleanup completed:${NC}"
    echo "   ├── All processes terminated"
    echo "   ├── PID files removed"
    echo "   └── Ports released"
    echo
    echo "   ${BOLD}To restart:${NC}"
    echo "   └── ./scripts/start-mcp-stack.sh"
    echo
}

# Main execution
main() {
    local force=false
    local interactive=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --force|-f)
                force=true
                shift
                ;;
            --interactive|-i)
                interactive=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo
                echo "Options:"
                echo "  --force, -f       Force stop all processes immediately"
                echo "  --interactive, -i Interactively choose which processes to stop"
                echo "  --help, -h        Show this help message"
                echo
                echo "Default behavior:"
                echo "  - Try to stop from PID files first (graceful)"
                echo "  - Fall back to process search if no PID files found"
                echo "  - Use SIGTERM first, then SIGKILL if necessary"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                log_info "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    echo "🛑 Stopping Lerian Protocol MCP Stack..."
    echo
    
    # Try to stop from PID files first
    if stop_stack_from_pids "$force"; then
        print_status
        exit 0
    fi
    
    # Fall back to process search
    log_info "PID files not found or incomplete, searching for running processes..."
    
    if [ "$interactive" = "true" ]; then
        interactive_stop
    else
        find_and_stop_processes "$force"
    fi
    
    print_status
}

# Execute main function
main "$@"