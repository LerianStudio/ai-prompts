#!/bin/bash

echo "Validating new structure..."

validate_service() {
  local service_name=$1
  local service_path="protocol-assets/services/$service_name"

  if [[ -d "$service_path" ]]; then
    echo "✅ $service_name service directory exists"

    if [[ -f "$service_path/package.json" ]]; then
      echo "✅ $service_name has package.json"
    else
      echo "❌ $service_name missing package.json"
      return 1
    fi

    if [[ -d "$service_path/src" ]]; then
      echo "✅ $service_name has src directory"
    else
      echo "❌ $service_name missing src directory"
      return 1
    fi
  else
    echo "❌ $service_name service directory missing"
    return 1
  fi
}

# Validate services
validate_service "board-api"
validate_service "board-ui"
validate_service "board-mcp"

# Validate shared components
if [[ -d "protocol-assets/shared/lib" ]]; then
  echo "✅ Shared libraries directory exists"
else
  echo "❌ Shared libraries directory missing"
  exit 1
fi

# Validate infrastructure
if [[ -d "protocol-assets/infrastructure/data" ]]; then
  echo "✅ Infrastructure data directory exists"
else
  echo "❌ Infrastructure data directory missing"
  exit 1
fi

echo ""
echo "Structure validation complete!"