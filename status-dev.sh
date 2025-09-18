#!/bin/bash

# Lerian Protocol Board Status Monitor
# Provides comprehensive status information for all board services

# set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Emojis for status indicators
STATUS_RUNNING="🟢"
STATUS_STOPPED="🔴"
STATUS_ISSUE="🟡"
STATUS_HEALTHY="✅"
STATUS_UNHEALTHY="❌"
STATUS_WARNING="⚠️"

# Configuration
SCRIPT_START=$(date +%s)

# Load environment configuration
load_environment() {
    if [[ -f "protocol-assets/.env.dev" ]]; then
        export $(grep -v '^#' protocol-assets/.env.dev | xargs) 2>/dev/null || true
    fi

    # Load port configuration if available
    if [[ -f "logs/service-ports.env" ]]; then
        source logs/service-ports.env 2>/dev/null || true
    fi

    # Set defaults if not loaded
    BOARD_API_PORT=${BOARD_API_PORT:-3002}
    BOARD_EXECUTOR_PORT=${BOARD_EXECUTOR_PORT:-3102}
    BOARD_UI_PORT=${FRONTEND_PORT:-${BOARD_UI_PORT:-3009}}
    DB_HOST=${DB_HOST:-localhost}
    DB_PORT=${DB_PORT:-5701}
    DB_NAME=${DB_NAME:-lerian_protocol}
    DB_USER=${DB_USER:-midaz}
}

# Utility functions
get_current_time() {
    date '+%Y-%m-%d %H:%M:%S'
}

format_duration() {
    local seconds=$1
    local hours=$((seconds / 3600))
    local minutes=$(((seconds % 3600) / 60))
    local secs=$((seconds % 60))

    if [[ $hours -gt 0 ]]; then
        printf "%dh %dm %ds" $hours $minutes $secs
    elif [[ $minutes -gt 0 ]]; then
        printf "%dm %ds" $minutes $secs
    else
        printf "%ds" $secs
    fi
}

format_size() {
    local bytes=$1
    if [[ $bytes -gt 1048576 ]]; then
        printf "%.1fMB" $((bytes * 10 / 1048576))e-1
    elif [[ $bytes -gt 1024 ]]; then
        printf "%.1fKB" $((bytes * 10 / 1024))e-1
    else
        printf "%dB" $bytes
    fi
}

# Service status checking
check_service_status() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    local display_name=$2

    if [[ -f "$pid_file" ]]; then
        local pid=$(cat "$pid_file" 2>/dev/null)
        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            # Process is running, get uptime
            local start_time=$(stat -c %Y "$pid_file" 2>/dev/null || echo $SCRIPT_START)
            local uptime=$((SCRIPT_START - start_time))
            local formatted_uptime=$(format_duration $uptime)

            # Get memory usage
            local memory_kb=$(ps -o rss= -p "$pid" 2>/dev/null | tr -d ' ' || echo "0")
            local memory_bytes=$((memory_kb * 1024))
            local formatted_memory=$(format_size $memory_bytes)

            echo -e "   $display_name ${STATUS_RUNNING} ${GREEN}Running${NC} | PID: $pid | Uptime: $formatted_uptime | Memory: $formatted_memory"
            return 0
        else
            echo -e "   $display_name ${STATUS_STOPPED} ${RED}Stopped${NC} (stale PID file)"
            return 1
        fi
    else
        echo -e "   $display_name ${STATUS_STOPPED} ${RED}Stopped${NC} (no PID file)"
        return 1
    fi
}

get_service_port() {
    local service_name=$1
    case $service_name in
        "board-api") echo "$BOARD_API_PORT" ;;
        "board-executor") echo "$BOARD_EXECUTOR_PORT" ;;
        "board-ui") echo "$BOARD_UI_PORT" ;;
        *) echo "unknown" ;;
    esac
}

# Service status overview
print_service_status() {
    echo -e "${BOLD}${BLUE}📊 Service Status:${NC}"

    local api_status=1
    local executor_status=1
    local ui_status=1

    check_service_status "board-api" "Board API     " && api_status=0
    check_service_status "board-executor" "Board Executor" && executor_status=0
    check_service_status "board-ui" "Board UI      " && ui_status=0

    echo ""

    # Summary line
    local running_count=0
    [[ $api_status -eq 0 ]] && ((running_count++))
    [[ $executor_status -eq 0 ]] && ((running_count++))
    [[ $ui_status -eq 0 ]] && ((running_count++))

    if [[ $running_count -eq 3 ]]; then
        echo -e "${GREEN}✅ All services are running${NC}"
    elif [[ $running_count -eq 0 ]]; then
        echo -e "${RED}❌ No services are running${NC}"
    else
        echo -e "${YELLOW}⚠️  $running_count/3 services are running${NC}"
    fi

    echo ""
}

# Health check functionality
check_service_health() {
    local service_name=$1
    local url=$2
    local timeout=${3:-3}
    local display_name=$4

    local start_time=$(date +%s%3N)
    local response=$(curl -s -w "%{http_code}" --max-time "$timeout" "$url" 2>/dev/null || echo "000")
    local end_time=$(date +%s%3N)
    local response_time=$((end_time - start_time))

    local http_code="${response: -3}"
    local body="${response%???}"

    if [[ "$http_code" -eq 200 ]]; then
        echo -e "   $display_name: ${STATUS_HEALTHY} ${GREEN}Healthy${NC} (${response_time}ms)"
        return 0
    elif [[ "$http_code" -eq 000 ]]; then
        echo -e "   $display_name: ${STATUS_UNHEALTHY} ${RED}Unreachable${NC} (timeout)"
        return 1
    else
        echo -e "   $display_name: ${STATUS_WARNING} ${YELLOW}Issues${NC} (HTTP $http_code)"
        return 1
    fi
}

print_health_checks() {
    echo -e "${BOLD}${BLUE}🏥 Health Checks:${NC}"

    local api_health=1
    local executor_health=1
    local ui_health=1

    # Check if services are running first
    if [[ -f "logs/board-api.pid" ]] && kill -0 $(cat logs/board-api.pid) 2>/dev/null; then
        check_service_health "board-api" "http://localhost:$BOARD_API_PORT/health" 3 "Board API     " && api_health=0
    else
        echo -e "   Board API     : ${STATUS_STOPPED} ${RED}Service not running${NC}"
    fi

    if [[ -f "logs/board-executor.pid" ]] && kill -0 $(cat logs/board-executor.pid) 2>/dev/null; then
        check_service_health "board-executor" "http://localhost:$BOARD_EXECUTOR_PORT/health" 3 "Board Executor" && executor_health=0
    else
        echo -e "   Board Executor: ${STATUS_STOPPED} ${RED}Service not running${NC}"
    fi

    if [[ -f "logs/board-ui.pid" ]] && kill -0 $(cat logs/board-ui.pid) 2>/dev/null; then
        check_service_health "board-ui" "http://localhost:$BOARD_UI_PORT" 5 "Board UI      " && ui_health=0
    else
        echo -e "   Board UI      : ${STATUS_STOPPED} ${RED}Service not running${NC}"
    fi

    echo ""

    # Health summary
    local healthy_count=0
    [[ $api_health -eq 0 ]] && ((healthy_count++))
    [[ $executor_health -eq 0 ]] && ((healthy_count++))
    [[ $ui_health -eq 0 ]] && ((healthy_count++))

    if [[ $healthy_count -eq 3 ]]; then
        echo -e "${GREEN}✅ All services are healthy${NC}"
    elif [[ $healthy_count -eq 0 ]]; then
        echo -e "${RED}❌ No services are healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  $healthy_count/3 services are healthy${NC}"
    fi

    echo ""
}

# Port information
print_port_info() {
    echo -e "${BOLD}${BLUE}🔌 Port Configuration:${NC}"

    echo -e "   Board API:      ${CYAN}http://localhost:$BOARD_API_PORT${NC}"
    echo -e "   Board Executor: ${CYAN}http://localhost:$BOARD_EXECUTOR_PORT${NC}"
    echo -e "   Board UI:       ${CYAN}http://localhost:$BOARD_UI_PORT${NC}"

    echo ""

    # Check if ports are actually in use
    echo -e "${BOLD}${BLUE}📡 Port Status:${NC}"

    check_port_status() {
        local port=$1
        local service_name=$2

        if lsof -i:"$port" >/dev/null 2>&1; then
            echo -e "   Port $port: ${STATUS_RUNNING} ${GREEN}In use${NC} ($service_name)"
        else
            echo -e "   Port $port: ${STATUS_STOPPED} ${RED}Available${NC} ($service_name)"
        fi
    }

    check_port_status "$BOARD_API_PORT" "Board API"
    check_port_status "$BOARD_EXECUTOR_PORT" "Board Executor"
    check_port_status "$BOARD_UI_PORT" "Board UI"

    echo ""
}

# Database connectivity
print_database_status() {
    echo -e "${BOLD}${BLUE}💾 Database Status:${NC}"

    # Test PostgreSQL connection
    local db_status=1
    local db_info=""

    if command -v psql >/dev/null 2>&1; then
        local pg_check=$(PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" 2>/dev/null)
        if [[ $? -eq 0 ]]; then
            echo -e "   PostgreSQL:     ${STATUS_HEALTHY} ${GREEN}Connected${NC}"
            echo -e "   Host:           ${CYAN}$DB_HOST:$DB_PORT${NC}"
            echo -e "   Database:       ${CYAN}$DB_NAME${NC}"
            echo -e "   User:           ${CYAN}$DB_USER${NC}"
            db_status=0
        else
            echo -e "   PostgreSQL:     ${STATUS_UNHEALTHY} ${RED}Connection failed${NC}"
            echo -e "   Host:           ${CYAN}$DB_HOST:$DB_PORT${NC}"
            echo -e "   Database:       ${CYAN}$DB_NAME${NC}"
        fi
    else
        echo -e "   PostgreSQL:     ${STATUS_WARNING} ${YELLOW}psql not available${NC}"
        echo -e "   Host:           ${CYAN}$DB_HOST:$DB_PORT${NC}"
        echo -e "   Database:       ${CYAN}$DB_NAME${NC}"
        echo -e "   ${YELLOW}Note: Install postgresql-client to test database connectivity${NC}"
    fi

    echo ""
}

# Quick actions section
print_quick_actions() {
    echo -e "${BOLD}${BLUE}🔧 Quick Actions:${NC}"

    echo -e "   ${BOLD}Logs:${NC}"
    echo -e "     View API logs:      ${YELLOW}tail -f logs/board-api.log${NC}"
    echo -e "     View Executor logs: ${YELLOW}tail -f logs/board-executor.log${NC}"
    echo -e "     View UI logs:       ${YELLOW}tail -f logs/board-ui.log${NC}"
    echo -e "     View all logs:      ${YELLOW}tail -f logs/*.log${NC}"

    echo ""
    echo -e "   ${BOLD}Service Management:${NC}"
    echo -e "     Start services:     ${YELLOW}./start-dev.sh${NC}"
    echo -e "     Stop services:      ${YELLOW}./stop-dev.sh${NC}"
    echo -e "     Restart services:   ${YELLOW}./stop-dev.sh && ./start-dev.sh${NC}"

    echo ""
    echo -e "   ${BOLD}Access Points:${NC}"

    # Only show links for running services
    if [[ -f "logs/board-ui.pid" ]] && kill -0 $(cat logs/board-ui.pid) 2>/dev/null; then
        echo -e "     Main UI:            ${CYAN}http://localhost:$BOARD_UI_PORT${NC}"
    fi

    if [[ -f "logs/board-api.pid" ]] && kill -0 $(cat logs/board-api.pid) 2>/dev/null; then
        echo -e "     API Health:         ${CYAN}http://localhost:$BOARD_API_PORT/health${NC}"
        echo -e "     API Tasks:          ${CYAN}http://localhost:$BOARD_API_PORT/api/tasks${NC}"
    fi

    if [[ -f "logs/board-executor.pid" ]] && kill -0 $(cat logs/board-executor.pid) 2>/dev/null; then
        echo -e "     Executor Health:    ${CYAN}http://localhost:$BOARD_EXECUTOR_PORT/health${NC}"
    fi

    echo ""
}

# Header
print_header() {
    echo -e "${BOLD}${BLUE}🔍 Lerian Protocol Board Status${NC}"
    echo -e "${BLUE}================================${NC}"
    echo -e "${CYAN}Status checked at: $(get_current_time)${NC}"
    echo ""
}

# Main execution
main() {
    load_environment
    print_header

    print_service_status
    print_health_checks
    print_port_info
    print_database_status
    print_quick_actions

    # Summary
    echo -e "${BOLD}${GREEN}📋 Status check completed!${NC}"
}

# Run main function
main "$@"