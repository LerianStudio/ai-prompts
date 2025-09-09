#!/bin/bash

# MCP Stack Status Check for Lerian Protocol
# Shows comprehensive status of board-service and board-mcp components

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# PID management
PIDS_DIR="$PROJECT_ROOT/infrastructure/data/pids"
STACK_PID_FILE="$PIDS_DIR/mcp-stack.pid"
SERVICE_PID_FILE="$PIDS_DIR/task-service.pid"
MCP_PID_FILE="$PIDS_DIR/board-mcp.pid"

# Logs
LOG_DIR="$PROJECT_ROOT/infrastructure/data/logs"
SERVICE_LOG="$LOG_DIR/task-service.log"
MCP_LOG="$LOG_DIR/board-mcp.log"

# Default ports
DEFAULT_SERVICE_PORT=3020
DEFAULT_MCP_PORT=3021
DEFAULT_HOST="localhost"

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'
DIM='\033[2m'

# Status icons
ICON_RUNNING="🟢"
ICON_STOPPED="🔴"
ICON_WARNING="🟡"
ICON_UNKNOWN="⚪"
ICON_INFO="ℹ️"
ICON_SUCCESS="✅"
ICON_ERROR="❌"

# Helper functions
log_info() {
    echo -e "${BLUE}${ICON_INFO} $1${NC}"
}

log_success() {
    echo -e "${GREEN}${ICON_SUCCESS} $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}${ICON_ERROR} $1${NC}"
}

print_header() {
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}${CYAN}    Lerian Protocol MCP Stack Status${NC}"
    echo -e "${BOLD}${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo
}

print_section() {
    echo -e "${BOLD}${BLUE}▶ $1${NC}"
}

print_subsection() {
    echo -e "${CYAN}  $1${NC}"
}

get_process_status() {
    local pid=$1
    local name=$2
    
    if [ -z "$pid" ]; then
        echo -e "  ${ICON_UNKNOWN} $name: ${DIM}No PID information${NC}"
        return 1
    fi
    
    if kill -0 "$pid" 2>/dev/null; then
        local cpu_usage=$(ps -o pcpu= -p "$pid" 2>/dev/null | tr -d ' ' || echo "N/A")
        local mem_usage=$(ps -o pmem= -p "$pid" 2>/dev/null | tr -d ' ' || echo "N/A")
        local start_time=$(ps -o lstart= -p "$pid" 2>/dev/null | sed 's/^ *//' || echo "N/A")
        
        echo -e "  ${ICON_RUNNING} $name: ${GREEN}Running${NC} (PID: $pid)"
        echo -e "    ${DIM}├── CPU: ${cpu_usage}%${NC}"
        echo -e "    ${DIM}├── Memory: ${mem_usage}%${NC}"
        echo -e "    ${DIM}└── Started: $start_time${NC}"
        return 0
    else
        echo -e "  ${ICON_STOPPED} $name: ${RED}Stopped${NC} (PID: $pid - process not found)"
        return 1
    fi
}

check_port_status() {
    local port=$1
    local name=$2
    local host=${3:-localhost}
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        local pid=$(lsof -ti :$port 2>/dev/null | head -n1)
        echo -e "  ${ICON_RUNNING} Port $port: ${GREEN}In Use${NC} (PID: $pid)"
        
        # Try to identify the process
        local process_name=$(ps -o comm= -p "$pid" 2>/dev/null || echo "unknown")
        echo -e "    ${DIM}└── Process: $process_name${NC}"
        return 0
    else
        echo -e "  ${ICON_STOPPED} Port $port: ${RED}Available${NC}"
        return 1
    fi
}

check_service_health() {
    local url=$1
    local name=$2
    
    if curl -s -f "$url" >/dev/null 2>&1; then
        local response=$(curl -s "$url" 2>/dev/null)
        echo -e "  ${ICON_SUCCESS} $name Health: ${GREEN}Healthy${NC}"
        if [ -n "$response" ]; then
            echo -e "    ${DIM}└── Response: $response${NC}"
        fi
        return 0
    else
        echo -e "  ${ICON_ERROR} $name Health: ${RED}Unhealthy${NC}"
        echo -e "    ${DIM}└── URL: $url${NC}"
        return 1
    fi
}

show_stack_info() {
    print_section "Stack Information"
    
    if [ -f "$STACK_PID_FILE" ]; then
        echo -e "  ${ICON_INFO} Stack PID file found: ${GREEN}$STACK_PID_FILE${NC}"
        
        # Read stack information
        source "$STACK_PID_FILE" 2>/dev/null || true
        
        if [ -n "$STARTED" ]; then
            echo -e "    ${DIM}├── Started: $STARTED${NC}"
        fi
        
        if [ -n "$STACK_MODE" ]; then
            echo -e "    ${DIM}├── Mode: $STACK_MODE${NC}"
        fi
        
        if [ -n "$SERVICE_PORT" ]; then
            echo -e "    ${DIM}├── Service Port: $SERVICE_PORT${NC}"
        fi
        
        if [ -n "$MCP_PORT" ]; then
            echo -e "    ${DIM}├── MCP Port: $MCP_PORT${NC}"
        fi
        
        if [ -n "$HOST" ]; then
            echo -e "    ${DIM}└── Host: $HOST${NC}"
        fi
    else
        echo -e "  ${ICON_WARNING} Stack PID file: ${YELLOW}Not found${NC}"
        echo -e "    ${DIM}└── Stack may not be running or was started manually${NC}"
    fi
    echo
}

show_process_status() {
    print_section "Process Status"
    
    # Board Service
    local service_pid=""
    if [ -f "$SERVICE_PID_FILE" ]; then
        service_pid=$(cat "$SERVICE_PID_FILE" 2>/dev/null || true)
    fi
    
    get_process_status "$service_pid" "Board Service"
    
    # Board MCP
    local mcp_pid=""
    if [ -f "$MCP_PID_FILE" ]; then
        mcp_pid=$(cat "$MCP_PID_FILE" 2>/dev/null || true)
    fi
    
    get_process_status "$mcp_pid" "Board MCP Server"
    
    # Check for other processes
    local other_service_pids=$(pgrep -f "board-service" 2>/dev/null | grep -v "^$service_pid$" 2>/dev/null || true)
    local other_mcp_pids=$(pgrep -f "board-mcp" 2>/dev/null | grep -v "^$mcp_pid$" 2>/dev/null || true)
    
    if [ -n "$other_service_pids" ]; then
        echo -e "  ${ICON_WARNING} Other Board Service processes: ${YELLOW}$other_service_pids${NC}"
    fi
    
    if [ -n "$other_mcp_pids" ]; then
        echo -e "  ${ICON_WARNING} Other Board MCP processes: ${YELLOW}$other_mcp_pids${NC}"
    fi
    
    echo
}

show_port_status() {
    print_section "Port Status"
    
    # Get configured ports from stack info
    local service_port=$DEFAULT_SERVICE_PORT
    local mcp_port=$DEFAULT_MCP_PORT
    
    if [ -f "$STACK_PID_FILE" ]; then
        source "$STACK_PID_FILE" 2>/dev/null || true
        service_port=${SERVICE_PORT:-$DEFAULT_SERVICE_PORT}
        mcp_port=${MCP_PORT:-$DEFAULT_MCP_PORT}
    fi
    
    check_port_status "$service_port" "Board Service"
    check_port_status "$mcp_port" "Board MCP"
    
    echo
}

show_health_status() {
    print_section "Health Checks"
    
    # Get configured host and port
    local host=$DEFAULT_HOST
    local service_port=$DEFAULT_SERVICE_PORT
    
    if [ -f "$STACK_PID_FILE" ]; then
        source "$STACK_PID_FILE" 2>/dev/null || true
        host=${HOST:-$DEFAULT_HOST}
        service_port=${SERVICE_PORT:-$DEFAULT_SERVICE_PORT}
    fi
    
    check_service_health "http://$host:$service_port/health" "Board Service"
    
    # Try to get task count
    if curl -s -f "http://$host:$service_port/api/tasks" >/dev/null 2>&1; then
        local task_count=$(curl -s "http://$host:$service_port/api/tasks" | jq length 2>/dev/null || echo "N/A")
        echo -e "  ${ICON_INFO} Task API: ${GREEN}Accessible${NC}"
        echo -e "    ${DIM}└── Tasks: $task_count${NC}"
    else
        echo -e "  ${ICON_WARNING} Task API: ${YELLOW}Not accessible${NC}"
    fi
    
    echo
}

show_log_status() {
    print_section "Log Files"
    
    if [ -f "$SERVICE_LOG" ]; then
        local service_log_size=$(du -h "$SERVICE_LOG" 2>/dev/null | cut -f1)
        local service_log_lines=$(wc -l < "$SERVICE_LOG" 2>/dev/null || echo "0")
        echo -e "  ${ICON_SUCCESS} Service Log: ${GREEN}$SERVICE_LOG${NC}"
        echo -e "    ${DIM}├── Size: $service_log_size${NC}"
        echo -e "    ${DIM}└── Lines: $service_log_lines${NC}"
    else
        echo -e "  ${ICON_WARNING} Service Log: ${YELLOW}Not found${NC}"
    fi
    
    if [ -f "$MCP_LOG" ]; then
        local mcp_log_size=$(du -h "$MCP_LOG" 2>/dev/null | cut -f1)
        local mcp_log_lines=$(wc -l < "$MCP_LOG" 2>/dev/null || echo "0")
        echo -e "  ${ICON_SUCCESS} MCP Log: ${GREEN}$MCP_LOG${NC}"
        echo -e "    ${DIM}├── Size: $mcp_log_size${NC}"
        echo -e "    ${DIM}└── Lines: $mcp_log_lines${NC}"
    else
        echo -e "  ${ICON_WARNING} MCP Log: ${YELLOW}Not found${NC}"
    fi
    
    echo
}

show_quick_actions() {
    print_section "Quick Actions"
    
    echo -e "  ${BOLD}Common Commands:${NC}"
    echo -e "    ${DIM}├── Start Stack:${NC} ./scripts/start-mcp-stack.sh"
    echo -e "    ${DIM}├── Stop Stack:${NC}  ./scripts/stop-mcp-stack.sh"
    echo -e "    ${DIM}├── Dev Mode:${NC}    ./scripts/start-mcp-stack.sh --dev"
    echo -e "    ${DIM}└── Force Stop:${NC}  ./scripts/stop-mcp-stack.sh --force"
    echo
    
    if [ -f "$SERVICE_LOG" ] || [ -f "$MCP_LOG" ]; then
        echo -e "  ${BOLD}Log Commands:${NC}"
        [ -f "$SERVICE_LOG" ] && echo -e "    ${DIM}├── Service Logs:${NC} tail -f $SERVICE_LOG"
        [ -f "$MCP_LOG" ] && echo -e "    ${DIM}└── MCP Logs:${NC}     tail -f $MCP_LOG"
        echo
    fi
}

get_overall_status() {
    # Determine overall stack status
    local service_running=false
    local mcp_running=false
    
    if [ -f "$SERVICE_PID_FILE" ]; then
        local service_pid=$(cat "$SERVICE_PID_FILE" 2>/dev/null || true)
        if [ -n "$service_pid" ] && kill -0 "$service_pid" 2>/dev/null; then
            service_running=true
        fi
    fi
    
    if [ -f "$MCP_PID_FILE" ]; then
        local mcp_pid=$(cat "$MCP_PID_FILE" 2>/dev/null || true)
        if [ -n "$mcp_pid" ] && kill -0 "$mcp_pid" 2>/dev/null; then
            mcp_running=true
        fi
    fi
    
    if $service_running && $mcp_running; then
        echo -e "${GREEN}${ICON_RUNNING} Stack Status: Fully Running${NC}"
        return 0
    elif $service_running; then
        echo -e "${YELLOW}${ICON_WARNING} Stack Status: Partially Running (Service Only)${NC}"
        return 1
    elif $mcp_running; then
        echo -e "${YELLOW}${ICON_WARNING} Stack Status: Partially Running (MCP Only)${NC}"
        return 1
    else
        echo -e "${RED}${ICON_STOPPED} Stack Status: Stopped${NC}"
        return 2
    fi
}

# Main execution
main() {
    local detailed=true
    local watch=false
    local watch_interval=5
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --brief|-b)
                detailed=false
                shift
                ;;
            --watch|-w)
                watch=true
                shift
                ;;
            --interval|-i)
                watch_interval="$2"
                shift 2
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo
                echo "Options:"
                echo "  --brief, -b       Show brief status only"
                echo "  --watch, -w       Watch mode (refresh every 5s)"
                echo "  --interval, -i N  Watch interval in seconds (default: 5)"
                echo "  --help, -h        Show this help message"
                echo
                echo "Examples:"
                echo "  $0                Show detailed status"
                echo "  $0 --brief        Show brief status"
                echo "  $0 --watch        Monitor status (refresh every 5s)"
                echo "  $0 -w -i 2        Monitor status (refresh every 2s)"
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                log_info "Use --help for usage information"
                exit 1
                ;;
        esac
    done
    
    if [ "$watch" = "true" ]; then
        # Watch mode
        while true; do
            clear
            print_header
            get_overall_status
            
            if [ "$detailed" = "true" ]; then
                echo
                show_stack_info
                show_process_status
                show_port_status
                show_health_status
            fi
            
            echo -e "${DIM}Refreshing every ${watch_interval}s... (Press Ctrl+C to stop)${NC}"
            sleep "$watch_interval"
        done
    else
        # Single run mode
        print_header
        local exit_code=0
        get_overall_status || exit_code=$?
        
        if [ "$detailed" = "true" ]; then
            echo
            show_stack_info
            show_process_status
            show_port_status
            show_health_status
            show_log_status
            show_quick_actions
        fi
        
        exit $exit_code
    fi
}

# Execute main function
main "$@"