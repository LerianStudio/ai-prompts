#!/bin/bash

echo "Lerian Protocol Services Status:"
echo "================================="

PROTOCOL_DIR="$(dirname "$0")/../.."
cd "$PROTOCOL_DIR"

# Function to check service status
check_service() {
  local service_name=$1
  local pid_file="infrastructure/data/pids/${service_name}.pid"
  local port=$2

  if [[ -f "$pid_file" ]]; then
    local pid=$(cat "$pid_file")
    if kill -0 "$pid" 2>/dev/null; then
      echo "✅ $service_name: Running (PID: $pid)"
      if [[ -n "$port" ]]; then
        if curl -s "http://localhost:$port/health" >/dev/null 2>&1; then
          echo "   └─ Health check: PASS"
        else
          echo "   └─ Health check: FAIL"
        fi
      fi
    else
      echo "❌ $service_name: Not running (stale PID file)"
    fi
  else
    echo "❌ $service_name: Not running"
  fi
}

check_service "board-api" "3020"
check_service "board-ui" "5173"
check_service "board-mcp"

echo ""
echo "Use 'npm run mcp:start' to start services"
echo "Use 'npm run mcp:stop' to stop services"