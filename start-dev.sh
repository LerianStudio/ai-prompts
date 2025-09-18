#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Lerian Protocol Development Stack${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -i:$port >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Port $port is already in use${NC}"
        return 1
    fi
    return 0
}

# Check required ports
echo -e "${BLUE}🔍 Checking ports...${NC}"
check_port 3021 || echo -e "${YELLOW}   Board API (3021) - may conflict${NC}"
check_port 3025 || echo -e "${YELLOW}   Board Executor (3025) - may conflict${NC}"
check_port 3007 || echo -e "${YELLOW}   Board UI (3007) - may conflict${NC}"

echo ""
echo -e "${BLUE}📦 Installing dependencies...${NC}"

# Install dependencies for all services
(cd services/board-api && npm install --silent) &
(cd services/board-executor && npm install --silent) &
(cd services/board-ui && npm install --silent) &
wait

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Create log directory
mkdir -p logs

echo -e "${BLUE}🔄 Starting services...${NC}"

# Start Board API
echo -e "${YELLOW}   Starting Board API on port 3021...${NC}"
cd services/board-api
ALLOWED_ORIGINS="http://localhost:3007,http://localhost:3009,http://localhost:3021,http://127.0.0.1:3007,http://127.0.0.1:3009,http://127.0.0.1:3021" PORT=3021 npm run dev > ../../logs/board-api.log 2>&1 &
API_PID=$!
cd ../..

# Start Board Executor
echo -e "${YELLOW}   Starting Board Executor on port 3025...${NC}"
cd services/board-executor
PORT=3025 npm run dev > ../../logs/board-executor.log 2>&1 &
EXECUTOR_PID=$!
cd ../..

# Start Board UI
echo -e "${YELLOW}   Starting Board UI...${NC}"
cd services/board-ui
VITE_API_PORT=3021 VITE_WS_PORT=3021 BOARD_API_PORT=3021 npm run dev > ../../logs/board-ui.log 2>&1 &
UI_PID=$!
cd ..

# Save PIDs for cleanup
mkdir -p logs
echo $API_PID > logs/board-api.pid
echo $EXECUTOR_PID > logs/board-executor.pid
echo $UI_PID > logs/board-ui.pid

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo -e "${BLUE}📋 Service Information:${NC}"
echo -e "   Board API:      ${GREEN}http://localhost:3021${NC} (PID: $API_PID)"
echo -e "   Board Executor: ${GREEN}http://localhost:3025${NC} (PID: $EXECUTOR_PID)"
echo -e "   Board UI:       ${GREEN}http://localhost:3007${NC} (PID: $UI_PID)"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo -e "   API:      ${YELLOW}tail -f logs/board-api.log${NC}"
echo -e "   Executor: ${YELLOW}tail -f logs/board-executor.log${NC}"
echo -e "   UI:       ${YELLOW}tail -f logs/board-ui.log${NC}"
echo ""
echo -e "${BLUE}🛑 To stop all services:${NC}"
echo -e "   ${YELLOW}./stop-dev.sh${NC}"
echo ""
echo -e "${GREEN}🎉 Ready! Visit http://localhost:3007 to use the board${NC}"

# Wait a moment for services to start
sleep 3

# Check if services are responding
echo -e "${BLUE}🔍 Health checks...${NC}"

if curl -s http://localhost:3021/api/tasks >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Board API: Healthy${NC}"
else
    echo -e "${RED}❌ Board API: Not responding${NC}"
fi

if curl -s http://localhost:3025/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Board Executor: Healthy${NC}"
else
    echo -e "${RED}❌ Board Executor: Not responding${NC}"
fi

echo ""
echo -e "${BLUE}🎯 System ready for development!${NC}"