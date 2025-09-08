#!/bin/bash

echo "Removing legacy structure..."

PROTOCOL_DIR="$(dirname "$0")/../.."
cd "$PROTOCOL_DIR"

# Confirm new structure is working
if [[ ! -f "protocol-assets/services/board-api/package.json" ]]; then
  echo "❌ New structure not found. Migration incomplete."
  exit 1
fi

# Test new structure works
export USE_NEW_STRUCTURE=true
npm run services:test || {
  echo "❌ New structure tests failed. Cannot remove legacy."
  exit 1
}

echo "✅ New structure validated. Removing legacy files..."

# Remove old lib structure (but keep installer temporarily for compatibility)
rm -rf protocol-assets/lib/board-service
rm -rf protocol-assets/lib/components  
rm -rf protocol-assets/lib/services
rm -rf protocol-assets/lib/utils

# Remove symlinks
rm -f protocol-assets/data protocol-assets/scripts

# Remove old MCP config
rm -f protocol-assets/.mcp.json

# Rename new MCP config
mv protocol-assets/.mcp.new.json protocol-assets/.mcp.json

echo "✅ Legacy structure removed successfully"