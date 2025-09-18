#!/bin/bash

# Stop Claude Code Integration Services
# This script stops all running integration services

echo "🛑 Stopping Claude Code Integration Services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to stop service by PID file
stop_service() {
  local pid_file=$1
  local service_name=$2

  if [ -f "$pid_file" ]; then
    local pid=$(cat "$pid_file")
    if ps -p $pid > /dev/null 2>&1; then
      echo -e "${YELLOW}Stopping ${service_name} (PID: ${pid})...${NC}"
      kill $pid

      # Wait for process to stop
      local attempts=0
      while ps -p $pid > /dev/null 2>&1 && [ $attempts -lt 10 ]; do
        sleep 1
        attempts=$((attempts + 1))
      done

      if ps -p $pid > /dev/null 2>&1; then
        echo -e "${RED}Force killing ${service_name}...${NC}"
        kill -9 $pid
      fi

      echo -e "${GREEN}✅ ${service_name} stopped${NC}"
    else
      echo -e "${YELLOW}${service_name} was not running${NC}"
    fi

    rm -f "$pid_file"
  else
    echo -e "${YELLOW}No PID file found for ${service_name}${NC}"
  fi
}

# Stop services
stop_service ".board-api.pid" "Board API"
stop_service ".mcp-server.pid" "MCP Server"

# Clean up any remaining processes by port
echo "🧹 Cleaning up any remaining processes..."

# Kill processes on default ports
for port in 3001 3002; do
  local pid=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    echo -e "${YELLOW}Killing process on port ${port} (PID: ${pid})...${NC}"
    kill $pid 2>/dev/null || true
  fi
done

echo -e "${GREEN}🎉 All services stopped successfully!${NC}"
echo ""
echo "💡 Tips:"
echo "  - Frontend (port 5173) was left running if it was started separately"
echo "  - Database services were not affected"
echo "  - To restart services, run: ./scripts/start-claude-integration.sh"