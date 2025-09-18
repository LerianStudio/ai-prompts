#!/bin/bash

# Enhanced service orchestration with health checks and error handling
set -euo pipefail  # Exit on error, undefined vars, pipe failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Load environment configuration
if [[ -f "protocol-assets/.env.dev" ]]; then
    echo -e "${CYAN}📁 Loading environment from protocol-assets/.env.dev${NC}"
    export $(grep -v '^#' protocol-assets/.env.dev | xargs)
else
    echo -e "${YELLOW}⚠️  .env.dev not found, using fallback ports${NC}"
fi

# Configuration
MAX_PORT_RETRIES=5
HEALTH_CHECK_TIMEOUT=30
HEALTH_CHECK_INTERVAL=2
PORT_RANGE_START=3020
PORT_RANGE_END=3100

# Service ports (load from env or use fallbacks)
BOARD_API_PORT=${BOARD_API_PORT:-3021}
BOARD_EXECUTOR_PORT=${BOARD_EXECUTOR_PORT:-3025}
BOARD_UI_PORT=${FRONTEND_PORT:-${BOARD_UI_PORT:-3007}}

echo -e "${BLUE}🚀 Starting Lerian Protocol Development Stack (Enhanced)${NC}"
echo -e "${CYAN}   Using dynamic port allocation with health verification${NC}"
echo ""

# Enhanced error handling
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    cleanup_on_error
    exit 1
}

# Cleanup function for error cases
cleanup_on_error() {
    echo -e "${YELLOW}🧹 Cleaning up services due to error...${NC}"
    if [[ -f logs/board-api.pid ]]; then
        kill $(cat logs/board-api.pid) 2>/dev/null || true
        rm -f logs/board-api.pid
    fi
    if [[ -f logs/board-executor.pid ]]; then
        kill $(cat logs/board-executor.pid) 2>/dev/null || true
        rm -f logs/board-executor.pid
    fi
    if [[ -f logs/board-ui.pid ]]; then
        kill $(cat logs/board-ui.pid) 2>/dev/null || true
        rm -f logs/board-ui.pid
    fi
}

# Trap to ensure cleanup on script exit
trap cleanup_on_error ERR INT TERM

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i:$port >/dev/null 2>&1; then
        return 1
    fi
    return 0
}

# Function to find next available port
find_available_port() {
    local start_port=$1
    local max_retries=${2:-$MAX_PORT_RETRIES}

    for ((i=0; i<max_retries; i++)); do
        local test_port=$((start_port + i))
        if [[ $test_port -gt $PORT_RANGE_END ]]; then
            return 1
        fi
        if check_port $test_port; then
            echo $test_port
            return 0
        fi
    done
    return 1
}

# Smart port allocation
echo -e "${BLUE}🔍 Configuring service ports...${NC}"

# Allocate Board API port
if ! check_port $BOARD_API_PORT; then
    echo -e "${YELLOW}   Port $BOARD_API_PORT in use, finding alternative...${NC}"
    NEW_PORT=$(find_available_port $BOARD_API_PORT)
    if [[ $? -ne 0 ]]; then
        error_exit "Cannot find available port for Board API near $BOARD_API_PORT"
    fi
    BOARD_API_PORT=$NEW_PORT
    echo -e "${GREEN}   Board API allocated to port $BOARD_API_PORT${NC}"
else
    echo -e "${GREEN}   Board API will use port $BOARD_API_PORT${NC}"
fi

# Allocate Board Executor port
if ! check_port $BOARD_EXECUTOR_PORT; then
    echo -e "${YELLOW}   Port $BOARD_EXECUTOR_PORT in use, finding alternative...${NC}"
    NEW_PORT=$(find_available_port $BOARD_EXECUTOR_PORT)
    if [[ $? -ne 0 ]]; then
        error_exit "Cannot find available port for Board Executor near $BOARD_EXECUTOR_PORT"
    fi
    BOARD_EXECUTOR_PORT=$NEW_PORT
    echo -e "${GREEN}   Board Executor allocated to port $BOARD_EXECUTOR_PORT${NC}"
else
    echo -e "${GREEN}   Board Executor will use port $BOARD_EXECUTOR_PORT${NC}"
fi

# Allocate Board UI port
if ! check_port $BOARD_UI_PORT; then
    echo -e "${YELLOW}   Port $BOARD_UI_PORT in use, finding alternative...${NC}"
    NEW_PORT=$(find_available_port $BOARD_UI_PORT)
    if [[ $? -ne 0 ]]; then
        error_exit "Cannot find available port for Board UI near $BOARD_UI_PORT"
    fi
    BOARD_UI_PORT=$NEW_PORT
    echo -e "${GREEN}   Board UI allocated to port $BOARD_UI_PORT${NC}"
else
    echo -e "${GREEN}   Board UI will use port $BOARD_UI_PORT${NC}"
fi

echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Create log directory first
mkdir -p logs

# Install dependencies for all services with error checking
api_install_pid=""
executor_install_pid=""
ui_install_pid=""

if [[ -d "protocol-assets/services/board-api" ]]; then
    (cd protocol-assets/services/board-api && npm install --silent > ../../../logs/install-api.log 2>&1) &
    api_install_pid=$!
else
    echo -e "${YELLOW}   ⚠️  Board API directory not found, skipping${NC}"
fi

if [[ -d "protocol-assets/services/board-executor" ]]; then
    (cd protocol-assets/services/board-executor && npm install --silent > ../../../logs/install-executor.log 2>&1) &
    executor_install_pid=$!
else
    echo -e "${YELLOW}   ⚠️  Board Executor directory not found, skipping${NC}"
fi

if [[ -d "protocol-assets/services/board-ui" ]]; then
    (cd protocol-assets/services/board-ui && npm install --silent > ../../../logs/install-ui.log 2>&1) &
    ui_install_pid=$!
else
    echo -e "${YELLOW}   ⚠️  Board UI directory not found, skipping${NC}"
fi

# Wait for installations and check results
install_failed=false

if [[ -n "$api_install_pid" ]]; then
    if ! wait $api_install_pid; then
        echo -e "${RED}   ❌ Board API dependency installation failed${NC}"
        echo -e "${YELLOW}      Check logs/install-api.log for details${NC}"
        install_failed=true
    else
        echo -e "${GREEN}   ✅ Board API dependencies installed${NC}"
    fi
fi

if [[ -n "$executor_install_pid" ]]; then
    if ! wait $executor_install_pid; then
        echo -e "${RED}   ❌ Board Executor dependency installation failed${NC}"
        echo -e "${YELLOW}      Check logs/install-executor.log for details${NC}"
        install_failed=true
    else
        echo -e "${GREEN}   ✅ Board Executor dependencies installed${NC}"
    fi
fi

if [[ -n "$ui_install_pid" ]]; then
    if ! wait $ui_install_pid; then
        echo -e "${RED}   ❌ Board UI dependency installation failed${NC}"
        echo -e "${YELLOW}      Check logs/install-ui.log for details${NC}"
        install_failed=true
    else
        echo -e "${GREEN}   ✅ Board UI dependencies installed${NC}"
    fi
fi

if [[ "$install_failed" == "true" ]]; then
    error_exit "Dependency installation failed for one or more services"
fi

echo -e "${GREEN}✅ All dependencies installed successfully${NC}"
echo ""

echo -e "${BLUE}🔄 Starting services with health monitoring...${NC}"

# Function to wait for service health
wait_for_service_health() {
    local service_name=$1
    local health_url=$2
    local timeout=${3:-$HEALTH_CHECK_TIMEOUT}
    local interval=${4:-$HEALTH_CHECK_INTERVAL}

    echo -e "${CYAN}   ⏳ Waiting for $service_name to be healthy...${NC}"

    local elapsed=0
    while [[ $elapsed -lt $timeout ]]; do
        if curl -s --connect-timeout 2 --max-time 5 "$health_url" >/dev/null 2>&1; then
            echo -e "${GREEN}   ✅ $service_name is healthy and responding${NC}"
            return 0
        fi
        sleep $interval
        elapsed=$((elapsed + interval))
        echo -ne "${YELLOW}   ⏳ $service_name health check... ${elapsed}s/${timeout}s\r${NC}"
    done

    echo -e "${RED}   ❌ $service_name failed to become healthy within ${timeout}s${NC}"
    return 1
}

# Start Board API with dynamic port configuration
if [[ -d "protocol-assets/services/board-api" ]]; then
    echo -e "${YELLOW}   Starting Board API on port $BOARD_API_PORT...${NC}"
    cd protocol-assets/services/board-api

    # Dynamic CORS origins based on allocated ports
    CORS_ORIGINS="http://localhost:$BOARD_UI_PORT,http://localhost:$BOARD_API_PORT"
    CORS_ORIGINS="$CORS_ORIGINS,http://127.0.0.1:$BOARD_UI_PORT,http://127.0.0.1:$BOARD_API_PORT"

    ALLOWED_ORIGINS="$CORS_ORIGINS" PORT=$BOARD_API_PORT npm run dev > ../../../logs/board-api.log 2>&1 &
    API_PID=$!
    cd ../../..

    # Wait for API to be healthy
    if ! wait_for_service_health "Board API" "http://localhost:$BOARD_API_PORT/health"; then
        error_exit "Board API failed to start properly"
    fi
else
    echo -e "${YELLOW}   ⚠️  Skipping Board API (directory not found)${NC}"
    API_PID=""
fi

# Start Board Executor
if [[ -d "protocol-assets/services/board-executor" ]]; then
    echo -e "${YELLOW}   Starting Board Executor on port $BOARD_EXECUTOR_PORT...${NC}"
    cd protocol-assets/services/board-executor
    PROJECT_ROOT="$(pwd)/../../.." PORT=$BOARD_EXECUTOR_PORT npm run dev > ../../../logs/board-executor.log 2>&1 &
    EXECUTOR_PID=$!
    cd ../../..

    # Wait for Executor to be healthy
    if ! wait_for_service_health "Board Executor" "http://localhost:$BOARD_EXECUTOR_PORT/health"; then
        error_exit "Board Executor failed to start properly"
    fi
else
    echo -e "${YELLOW}   ⚠️  Skipping Board Executor (directory not found)${NC}"
    EXECUTOR_PID=""
fi

# Start Board UI
if [[ -d "protocol-assets/services/board-ui" ]]; then
    echo -e "${YELLOW}   Starting Board UI on port $BOARD_UI_PORT...${NC}"
    cd protocol-assets/services/board-ui
    VITE_API_PORT=$BOARD_API_PORT VITE_WS_PORT=$BOARD_API_PORT BOARD_API_PORT=$BOARD_API_PORT npm run dev > ../../../logs/board-ui.log 2>&1 &
    UI_PID=$!
    cd ../../..

    # Wait for UI to be healthy (check if Vite dev server is running)
    if ! wait_for_service_health "Board UI" "http://localhost:$BOARD_UI_PORT" 15; then
        echo -e "${YELLOW}   ⚠️  Board UI may take longer to start (Vite compilation)${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Skipping Board UI (directory not found)${NC}"
    UI_PID=""
fi

# Save PIDs for cleanup
[[ -n "$API_PID" ]] && echo $API_PID > logs/board-api.pid
[[ -n "$EXECUTOR_PID" ]] && echo $EXECUTOR_PID > logs/board-executor.pid
[[ -n "$UI_PID" ]] && echo $UI_PID > logs/board-ui.pid

# Save port configuration for other scripts
echo "BOARD_API_PORT=$BOARD_API_PORT" > logs/service-ports.env
echo "BOARD_EXECUTOR_PORT=$BOARD_EXECUTOR_PORT" >> logs/service-ports.env
echo "BOARD_UI_PORT=$BOARD_UI_PORT" >> logs/service-ports.env

echo ""
echo -e "${GREEN}✅ All services started successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Service Information:${NC}"
[[ -n "$API_PID" ]] && echo -e "   Board API:      ${GREEN}http://localhost:$BOARD_API_PORT${NC} (PID: $API_PID)"
[[ -n "$EXECUTOR_PID" ]] && echo -e "   Board Executor: ${GREEN}http://localhost:$BOARD_EXECUTOR_PORT${NC} (PID: $EXECUTOR_PID)"
[[ -n "$UI_PID" ]] && echo -e "   Board UI:       ${GREEN}http://localhost:$BOARD_UI_PORT${NC} (PID: $UI_PID)"
echo ""
echo -e "${BLUE}📝 Logs & Management:${NC}"
echo -e "   API Logs:      ${YELLOW}tail -f logs/board-api.log${NC}"
echo -e "   Executor Logs: ${YELLOW}tail -f logs/board-executor.log${NC}"
echo -e "   UI Logs:       ${YELLOW}tail -f logs/board-ui.log${NC}"
echo -e "   All Logs:      ${CYAN}tail -f logs/*.log${NC}"
echo ""
echo -e "${BLUE}🛑 Service Management:${NC}"
echo -e "   Stop All:      ${YELLOW}./stop-dev.sh${NC}"
echo -e "   Check Status:  ${CYAN}./status-dev.sh${NC} (if available)"
echo -e "   Port Config:   ${MAGENTA}cat logs/service-ports.env${NC}"
echo ""
echo -e "${GREEN}🎉 System Ready! Access your services:${NC}"
[[ -n "$UI_PID" ]] && echo -e "   🌐 Main UI:    ${CYAN}http://localhost:$BOARD_UI_PORT${NC}"
[[ -n "$API_PID" ]] && echo -e "   🔧 API:        ${CYAN}http://localhost:$BOARD_API_PORT${NC}"
[[ -n "$EXECUTOR_PID" ]] && echo -e "   ⚡ Executor:    ${CYAN}http://localhost:$BOARD_EXECUTOR_PORT${NC}"

echo ""
echo -e "${BLUE}🔍 Final health verification...${NC}"

# Final comprehensive health checks
healthy_services=0
total_services=0

if [[ -n "$API_PID" ]]; then
    total_services=$((total_services + 1))
    if curl -s --connect-timeout 3 "http://localhost:$BOARD_API_PORT/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Board API: Healthy and responding${NC}"
        healthy_services=$((healthy_services + 1))
    else
        echo -e "${RED}❌ Board API: Not responding properly${NC}"
        echo -e "${YELLOW}   Check logs/board-api.log for details${NC}"
    fi
fi

if [[ -n "$EXECUTOR_PID" ]]; then
    total_services=$((total_services + 1))
    if curl -s --connect-timeout 3 "http://localhost:$BOARD_EXECUTOR_PORT/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Board Executor: Healthy and responding${NC}"
        healthy_services=$((healthy_services + 1))
    else
        echo -e "${RED}❌ Board Executor: Not responding properly${NC}"
        echo -e "${YELLOW}   Check logs/board-executor.log for details${NC}"
    fi
fi

if [[ -n "$UI_PID" ]]; then
    total_services=$((total_services + 1))
    if curl -s --connect-timeout 3 "http://localhost:$BOARD_UI_PORT" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Board UI: Healthy and accessible${NC}"
        healthy_services=$((healthy_services + 1))
    else
        echo -e "${YELLOW}⚠️  Board UI: May still be starting (Vite dev server)${NC}"
        echo -e "${CYAN}   Try accessing http://localhost:$BOARD_UI_PORT in a few moments${NC}"
    fi
fi

echo ""
if [[ $healthy_services -eq $total_services ]]; then
    echo -e "${GREEN}🎯 All services are healthy! System fully ready for development.${NC}"
else
    echo -e "${YELLOW}⚠️  $healthy_services/$total_services services are healthy. Check logs for issues.${NC}"
fi

# Disable error trap since we're done
trap - ERR INT TERM