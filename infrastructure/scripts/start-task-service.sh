#!/bin/bash

# Start Task Management Service for Lerian Protocol
# This script starts the task management service that replaces the file-based board system

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
SERVICE_DIR="$PROJECT_ROOT/services/board-api"

# Configuration defaults
DEFAULT_PORT=3020
DEFAULT_HOST="localhost"
DEFAULT_DB_PATH="$PROJECT_ROOT/infrastructure/data/databases/task-management.db"

# Load .env file if it exists (new environment system)
ENV_FILE="$SERVICE_DIR/.env"
if [ -f "$ENV_FILE" ]; then
    echo "📋 Loading environment configuration from .env..."
    set -a  # automatically export all variables
    source "$ENV_FILE"
    set +a
    echo "✅ Environment configuration loaded"
fi

# Use environment variables with fallbacks
PORT=${PORT:-$DEFAULT_PORT}
HOST=${HOST:-$DEFAULT_HOST}  
DB_PATH=${DB_PATH:-$DEFAULT_DB_PATH}

echo "🚀 Starting Lerian Protocol Task Management Service..."
echo "   Port: $PORT"
echo "   Host: $HOST"
echo "   Database: $DB_PATH"
echo

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed or not in PATH"
    echo "   Please install Node.js 18+ to run the task management service"
    exit 1
fi

# Check if service directory exists
if [ ! -d "$SERVICE_DIR" ]; then
    echo "❌ Error: Task management service not found at $SERVICE_DIR"
    echo "   Please ensure the service has been set up correctly"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "$SERVICE_DIR/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$SERVICE_DIR" && npm install
    echo "✅ Dependencies installed"
fi

# Create database directory if it doesn't exist
DB_DIR=$(dirname "$DB_PATH")
mkdir -p "$DB_DIR"

# Check if another service is running on the port
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Warning: Port $PORT is already in use"
    echo "   Another service may be running. Set PORT in .env or use environment variable."
    echo "   Example: PORT=3003 ./scripts/start-task-service.sh"
    exit 1
fi

# Export environment variables
export PORT="$PORT"
export HOST="$HOST"
export DB_PATH="$DB_PATH"

echo "🔄 Starting service..."
cd "$SERVICE_DIR"

# Start the service
if [ "$1" = "--dev" ]; then
    echo "   Running in development mode with file watching..."
    npm run dev
elif [ "$1" = "--background" ]; then
    echo "   Starting in background mode..."
    nohup npm start > /dev/null 2>&1 &
    mkdir -p "$PROJECT_ROOT/infrastructure/data/pids"
    echo $! > "$PROJECT_ROOT/infrastructure/data/pids/task-service.pid"
    echo "✅ Service started in background (PID: $(cat "$PROJECT_ROOT/infrastructure/data/pids/task-service.pid"))"
    echo "   Service available at: http://$HOST:$PORT"
    echo "   Health check: curl http://$HOST:$PORT/health"
    echo "   Stop with: ./scripts/stop-task-service.sh"
else
    echo "   Starting in production mode..."
    npm start
fi