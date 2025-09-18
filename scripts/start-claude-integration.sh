#!/bin/bash

# Start Claude Code Integration Services
# This script starts all services needed for Claude Code integration

set -e

echo "🚀 Starting Claude Code Integration Services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
  local port=$1
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Function to wait for service to be ready
wait_for_service() {
  local port=$1
  local service_name=$2
  local max_attempts=30
  local attempt=1

  echo -e "${YELLOW}Waiting for ${service_name} to start on port ${port}...${NC}"

  while [ $attempt -le $max_attempts ]; do
    if check_port $port; then
      echo -e "${GREEN}✅ ${service_name} is ready on port ${port}${NC}"
      return 0
    fi

    echo -e "${BLUE}Attempt ${attempt}/${max_attempts} - ${service_name} not ready yet...${NC}"
    sleep 2
    attempt=$((attempt + 1))
  done

  echo -e "${RED}❌ ${service_name} failed to start within ${max_attempts} attempts${NC}"
  return 1
}

# Set default ports
BOARD_API_PORT=${BOARD_API_PORT:-3001}
MCP_SERVER_PORT=${MCP_SERVER_PORT:-3002}
FRONTEND_PORT=${FRONTEND_PORT:-5173}

echo "📋 Service Configuration:"
echo "  - Board API (with integrated executor): http://localhost:${BOARD_API_PORT}"
echo "  - MCP Server: http://localhost:${MCP_SERVER_PORT}"
echo "  - Frontend: http://localhost:${FRONTEND_PORT}"
echo ""

# Check if ports are available
echo "🔍 Checking port availability..."

if check_port $BOARD_API_PORT; then
  echo -e "${RED}❌ Port ${BOARD_API_PORT} is already in use${NC}"
  exit 1
fi

if check_port $MCP_SERVER_PORT; then
  echo -e "${RED}❌ Port ${MCP_SERVER_PORT} is already in use${NC}"
  exit 1
fi

if check_port $FRONTEND_PORT; then
  echo -e "${YELLOW}⚠️  Port ${FRONTEND_PORT} is already in use (frontend might be running)${NC}"
fi

echo -e "${GREEN}✅ Ports are available${NC}"
echo ""

# Start Board API
echo "🔥 Starting Board API..."
cd services/board-api
BOARD_API_PORT=$BOARD_API_PORT npm start &
BOARD_API_PID=$!
cd ../..

# Wait for Board API to be ready
if ! wait_for_service $BOARD_API_PORT "Board API"; then
  echo -e "${RED}❌ Failed to start Board API${NC}"
  kill $BOARD_API_PID 2>/dev/null || true
  exit 1
fi

# Start MCP Server
echo "🛠️  Starting MCP Server..."
cd services/board-mcp
BOARD_API_URL="http://localhost:${BOARD_API_PORT}" \
MCP_SERVER_PORT=$MCP_SERVER_PORT \
npm start &
MCP_PID=$!
cd ../..

# Wait for MCP Server to be ready
if ! wait_for_service $MCP_SERVER_PORT "MCP Server"; then
  echo -e "${RED}❌ Failed to start MCP Server${NC}"
  kill $BOARD_API_PID $MCP_PID 2>/dev/null || true
  exit 1
fi

# Store PIDs for cleanup
echo $BOARD_API_PID > .board-api.pid
echo $MCP_PID > .mcp-server.pid

echo ""
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo ""
echo "📚 Usage Guide:"
echo "  1. The MCP server is now available to Claude Code"
echo "  2. Run 'claude \"List my tasks\"' to test the integration"
echo "  3. Claude Code can now create, update, and execute tasks"
echo "  4. Task execution is now integrated directly into the Board API"
echo ""
echo "🛠️  Available Claude Commands:"
echo "  - claude \"Create a task to implement user authentication\""
echo "  - claude \"List all tasks with status pending\""
echo "  - claude \"Update task [id] status to in_progress\""
echo "  - claude \"Execute task [id] with custom prompt\""
echo ""
echo "📊 Service Status:"
echo "  - Board API: http://localhost:${BOARD_API_PORT}/health"
echo "  - MCP Server: http://localhost:$((MCP_SERVER_PORT + 1))/health"
echo "  - Frontend: http://localhost:${FRONTEND_PORT} (if running)"
echo ""
echo "⛔ To stop services, run: ./scripts/stop-claude-integration.sh"

# Keep script running to show logs (optional)
if [ "${1:-}" = "--follow" ]; then
  echo ""
  echo -e "${BLUE}📝 Following service logs... (Press Ctrl+C to stop)${NC}"
  echo ""
  trap 'kill $BOARD_API_PID $MCP_PID 2>/dev/null || true; exit 0' INT TERM
  wait
fi