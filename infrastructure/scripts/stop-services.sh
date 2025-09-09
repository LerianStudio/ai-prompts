#!/bin/bash

echo "Stopping Lerian Protocol services..."

PROTOCOL_DIR="$(dirname "$0")/../.."
cd "$PROTOCOL_DIR"

# Function to stop service by PID file
stop_service() {
  local service_name=$1
  local pid_file="infrastructure/data/pids/${service_name}.pid"

  if [[ -f "$pid_file" ]]; then
    local pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      echo "Stopping $service_name (PID: $pid)"
      kill "$pid"
      # Wait a moment for graceful shutdown
      sleep 2
      # Force kill if still running
      if kill -0 "$pid" 2>/dev/null; then
        echo "Force stopping $service_name (PID: $pid)"
        kill -9 "$pid" 2>/dev/null || true
      fi
      rm "$pid_file"
    else
      echo "$service_name not running (stale PID file)"
      rm "$pid_file"
    fi
  else
    echo "No PID file for $service_name"
  fi
}

# Function to stop processes by port
stop_by_port() {
  local port=$1
  local service_name=$2
  
  local pids=$(lsof -ti :$port 2>/dev/null || true)
  if [[ -n "$pids" ]]; then
    echo "Found $service_name processes on port $port: $pids"
    for pid in $pids; do
      echo "Stopping process $pid on port $port"
      kill "$pid" 2>/dev/null || true
      sleep 1
      # Force kill if still running
      if kill -0 "$pid" 2>/dev/null; then
        echo "Force stopping process $pid"
        kill -9 "$pid" 2>/dev/null || true
      fi
    done
  fi
}

# Stop all services by PID files
stop_service "board-api"
stop_service "board-ui" 
stop_service "board-mcp"

# Also stop by ports to ensure cleanup
echo "Ensuring all ports are cleaned up..."
stop_by_port 3020 "board-api"
stop_by_port 5173 "board-ui" 
stop_by_port 3021 "board-mcp"

# Clean up any remaining node processes related to our services
echo "Cleaning up any remaining service processes..."
pkill -f "board-api" 2>/dev/null || true
pkill -f "board-ui.*vite" 2>/dev/null || true
pkill -f "board-mcp" 2>/dev/null || true

echo "All services stopped and ports cleaned up"