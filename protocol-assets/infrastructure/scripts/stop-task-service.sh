#!/bin/bash

# Stop Task Management Service for Lerian Protocol

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
PID_FILE="$PROJECT_ROOT/protocol-assets/infrastructure/data/pids/task-service.pid"

echo "🛑 Stopping Lerian Protocol Task Management Service..."

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "   Stopping service (PID: $PID)..."
        kill $PID
        
        # Wait for process to stop
        for i in {1..10}; do
            if ! ps -p $PID > /dev/null 2>&1; then
                break
            fi
            sleep 1
        done
        
        # Force kill if still running
        if ps -p $PID > /dev/null 2>&1; then
            echo "   Force stopping service..."
            kill -9 $PID
        fi
        
        rm -f "$PID_FILE"
        echo "✅ Service stopped successfully"
    else
        echo "   Service is not running (stale PID file)"
        rm -f "$PID_FILE"
    fi
else
    echo "   No PID file found. Service may not be running in background mode."
    
    # Try to find and stop any running task service processes
    PIDS=$(pgrep -f "board-service" || true)
    if [ -n "$PIDS" ]; then
        echo "   Found running task service processes: $PIDS"
        echo -n "   Stop them? (y/N): "
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            kill $PIDS
            echo "✅ Stopped running processes"
        fi
    else
        echo "   No running task service processes found"
    fi
fi