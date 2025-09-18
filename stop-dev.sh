#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛑 Stopping Lerian Protocol Development Stack${NC}"
echo ""

# Function to kill process by PID file
kill_service() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"

    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${YELLOW}   Stopping $service_name (PID: $pid)...${NC}"
            kill "$pid"
            # Wait a moment for graceful shutdown
            sleep 2
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                echo -e "${YELLOW}   Force stopping $service_name...${NC}"
                kill -9 "$pid" 2>/dev/null
            fi
            echo -e "${GREEN}   ✅ $service_name stopped${NC}"
        else
            echo -e "${YELLOW}   ⚠️  $service_name was not running${NC}"
        fi
        rm -f "$pid_file"
    else
        echo -e "${YELLOW}   ⚠️  No PID file for $service_name${NC}"
    fi
}

# Stop services
kill_service "board-api"
kill_service "board-executor"
kill_service "board-ui"

echo ""

# Also kill any remaining processes on the ports
echo -e "${BLUE}🔍 Checking for remaining processes...${NC}"

# Kill processes on specific ports
for port in 3021 3025 3007; do
    pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo -e "${YELLOW}   Killing remaining processes on port $port...${NC}"
        echo $pids | xargs kill -9 2>/dev/null
    fi
done

echo ""
echo -e "${GREEN}✅ All services stopped successfully!${NC}"
echo ""
echo -e "${BLUE}📝 Logs are preserved in:${NC}"
echo -e "   ${YELLOW}logs/board-api.log${NC}"
echo -e "   ${YELLOW}logs/board-executor.log${NC}"
echo -e "   ${YELLOW}logs/board-ui.log${NC}"
echo ""
echo -e "${BLUE}🚀 To start again: ${YELLOW}./start-dev.sh${NC}"