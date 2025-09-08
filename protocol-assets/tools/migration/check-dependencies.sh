#!/bin/bash

echo "Checking migration dependencies..."

# Check if required directories exist
check_directory() {
  local dir=$1
  local description=$2
  
  if [[ -d "$dir" ]]; then
    echo "✅ $description: $dir"
  else
    echo "❌ $description missing: $dir"
    return 1
  fi
}

# Check current structure
echo "Current structure validation:"
check_directory "protocol-assets/lib/board-service" "Board service directory"
check_directory "protocol-assets/lib/board-mcp" "Board MCP directory"
check_directory "protocol-assets/lib/installer" "Installer directory"
check_directory "protocol-assets/lib/sync" "Sync directory"

# Check for key files
check_file() {
  local file=$1
  local description=$2
  
  if [[ -f "$file" ]]; then
    echo "✅ $description: $file"
  else
    echo "❌ $description missing: $file"
    return 1
  fi
}

echo ""
echo "Key files validation:"
check_file "protocol-assets/lib/board-service/package.json" "Board service package.json"
check_file "protocol-assets/lib/board-mcp/package.json" "Board MCP package.json"
check_file "package.json" "Root package.json"

# Check for node modules
if [[ -d "protocol-assets/lib/board-service/node_modules" ]]; then
  echo "✅ Board service dependencies installed"
else
  echo "⚠️ Board service dependencies not installed - run 'npm install' in protocol-assets/lib/board-service/"
fi

echo ""
echo "Dependency check complete!"