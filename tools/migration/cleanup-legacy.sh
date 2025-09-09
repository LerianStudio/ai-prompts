#!/bin/bash

echo "🧹 Cleaning up legacy structure..."

PROTOCOL_DIR="$(dirname "$0")/../.."
cd "$PROTOCOL_DIR"

echo "Removing backward compatibility symlinks..."
rm -f data protocol-assets/data protocol-assets/scripts

echo "Removing legacy lib directories..."
rm -rf protocol-assets/lib

echo "Removing migration backups..."
rm -rf protocol-assets.backup.*
rm -f protocol-assets-backup-*.tar.gz

echo "Removing legacy scripts..."
rm -f protocol-assets/infrastructure/scripts/start-mcp-stack.sh
rm -f protocol-assets/infrastructure/scripts/stop-mcp-stack.sh  
rm -f protocol-assets/infrastructure/scripts/mcp-stack-status.sh
rm -f protocol-assets/infrastructure/scripts/start-task-service.sh
rm -f protocol-assets/infrastructure/scripts/stop-task-service.sh

echo "Cleaning up migration tools..."
rm -f protocol-assets/tools/migration/test-services.sh
rm -f protocol-assets/tools/migration/validate-structure.sh
rm -f protocol-assets/tools/migration/check-dependencies.sh
rm -f protocol-assets/tools/migration/final-validation.sh
rm -f protocol-assets/tools/migration/remove-legacy.sh
rm -f protocol-assets/tools/migration/cleanup-legacy.sh

echo "✅ Legacy cleanup complete!"
echo ""
echo "🎯 Clean modern structure:"
echo "├── services/           # Independent services"  
echo "├── shared/             # Shared libraries"
echo "├── infrastructure/     # Runtime & deployment"
echo "├── tools/              # Development tools"
echo "├── frontend/           # Frontend assets"
echo "└── backend/            # Backend assets"
echo ""
echo "🚀 Ready for production!"