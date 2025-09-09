#!/bin/bash

# Service orchestration for new structure
set -e

PROTOCOL_DIR="$(dirname "$0")/../.."
cd "$PROTOCOL_DIR"

echo "Starting Lerian Protocol services..."

# Create PID and logs directory if they don't exist
mkdir -p infrastructure/data/pids
mkdir -p infrastructure/data/logs

# Function to check if port is in use
check_port() {
  local port=$1
  local service_name=$2
  
  if lsof -i :$port >/dev/null 2>&1; then
    echo "⚠️  Warning: Port $port is already in use by another process"
    echo "   This may interfere with $service_name"
    echo "   Consider stopping the existing process or using a different port"
  fi
}

# Check ports before starting
check_port 3020 "Board API"
check_port 5173 "Board UI"  
check_port 3021 "Board MCP"

# Start board API
echo "🚀 Starting Board API service..."
cd services/board-api
if [ ! -d "node_modules" ]; then
  echo "   Installing dependencies..."
  npm install > ../../infrastructure/data/logs/board-api-install.log 2>&1
fi
npm run dev > ../../infrastructure/data/logs/board-api.log 2>&1 &
BOARD_API_PID=$!
cd ../..

# Start board UI  
echo "🎨 Starting Board UI service..."
cd services/board-ui
if [ ! -d "node_modules" ]; then
  echo "   Installing dependencies..."
  npm install > ../../infrastructure/data/logs/board-ui-install.log 2>&1
fi
npm run dev > ../../infrastructure/data/logs/board-ui.log 2>&1 &
BOARD_UI_PID=$!
cd ../..

# Start board MCP
echo "🔧 Starting Board MCP service..."
cd services/board-mcp
if [ ! -d "node_modules" ]; then
  echo "   Installing dependencies..."
  npm install > ../../infrastructure/data/logs/board-mcp-install.log 2>&1
fi
npm start > ../../infrastructure/data/logs/board-mcp.log 2>&1 &
BOARD_MCP_PID=$!
cd ../..

# Save PIDs immediately
echo "$BOARD_API_PID" > infrastructure/data/pids/board-api.pid
echo "$BOARD_UI_PID" > infrastructure/data/pids/board-ui.pid
echo "$BOARD_MCP_PID" > infrastructure/data/pids/board-mcp.pid

# Wait a moment for services to initialize
sleep 3

echo ""
echo "✅ Services started:"
echo "   📊 Board API: PID $BOARD_API_PID (http://localhost:3020)"
echo "   🎨 Board UI: PID $BOARD_UI_PID (http://localhost:5173)" 
echo "   🔧 Board MCP: PID $BOARD_MCP_PID"
echo ""
echo "📁 Logs available at:"
echo "   - API: infrastructure/data/logs/board-api.log"
echo "   - UI: infrastructure/data/logs/board-ui.log"
echo "   - MCP: infrastructure/data/logs/board-mcp.log"
echo ""
echo "🛑 To stop all services: 'npm run mcp:stop'"
echo ""

# Wait a bit more and verify services are running
sleep 2
echo "🔍 Verifying services..."

# Verify board-api
if kill -0 "$BOARD_API_PID" 2>/dev/null; then
  echo "   ✅ board-api running (PID: $BOARD_API_PID)"
else
  echo "   ❌ board-api failed to start"
fi

# Verify board-ui
if kill -0 "$BOARD_UI_PID" 2>/dev/null; then
  echo "   ✅ board-ui running (PID: $BOARD_UI_PID)"
else
  echo "   ❌ board-ui failed to start"
fi

# Special verification for board-mcp (MCP server behavior is different)
if [ -n "$BOARD_MCP_PID" ]; then
  # Check if the process is still running OR if it spawned a child process
  if kill -0 "$BOARD_MCP_PID" 2>/dev/null || pgrep -P "$BOARD_MCP_PID" >/dev/null 2>&1 || pgrep -f "node.*src/server.js" >/dev/null 2>&1; then
    echo "   ✅ board-mcp running (MCP server started successfully)"
    
    # Additional verification: check if server.js process exists
    mcp_running=$(pgrep -f "node.*src/server.js" | head -1)
    if [ -n "$mcp_running" ]; then
      echo "   📋 MCP server process: PID $mcp_running"
    fi
  else
    # Check logs for successful startup
    if grep -q "MCP server started successfully" infrastructure/data/logs/board-mcp.log 2>/dev/null; then
      echo "   ✅ board-mcp running (verified via logs)"
    else
      echo "   ❌ board-mcp failed to start"
    fi
  fi
else
  echo "   ❌ board-mcp PID not captured"
fi

echo ""
echo "🌐 Access the application:"
echo "   • UI: http://localhost:5173"
echo "   • API: http://localhost:3020"