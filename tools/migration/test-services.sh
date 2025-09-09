#!/bin/bash

echo "Testing service integration..."

PROTOCOL_DIR="$(dirname "$0")/../.."
cd "$PROTOCOL_DIR"

# Start services with new structure
export USE_NEW_STRUCTURE=true
./infrastructure/scripts/start-services.sh &
SERVICES_PID=$!

sleep 10

# Test board-api health
echo "Testing Board API..."
curl -f http://localhost:3020/health || exit 1

# Test board-ui build
echo "Testing Board UI..."
cd services/board-ui
npm install >/dev/null 2>&1
npm run build || exit 1
cd ../..

# Test MCP server
echo "Testing MCP server..."
cd services/board-mcp
npm install >/dev/null 2>&1
node src/index.js health || exit 1
cd ../..

# Cleanup
kill $SERVICES_PID

echo "All service tests passed!"