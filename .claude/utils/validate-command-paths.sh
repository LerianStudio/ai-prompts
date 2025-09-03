#!/bin/bash

# validate-command-paths.sh
# Validates that all command paths in documentation use proper namespacing

set -euo pipefail

# Configuration
COMMANDS_DIR=".claude/commands/shared"
EXIT_CODE=0

echo "🔍 Validating command path consistency in $COMMANDS_DIR"
echo "=================================================="

# Check if commands directory exists
if [[ ! -d "$COMMANDS_DIR" ]]; then
    echo "❌ Commands directory not found: $COMMANDS_DIR"
    exit 1
fi

# Find all markdown files with command paths
echo "📋 Analyzing command documentation files..."

# Look for shortened paths (missing namespace)
PROBLEMATIC_FILES=$(cd "$COMMANDS_DIR" 2>/dev/null && find . -name "*.md" -exec grep -l "^/[a-zA-Z-]\+[^:]" {} \; 2>/dev/null | sort | uniq || true)

if [[ -n "$PROBLEMATIC_FILES" ]]; then
    echo ""
    echo "❌ VALIDATION FAILED: Found non-namespaced command paths"
    echo "=================================================="
    
    while IFS= read -r file; do
        if [[ -n "$file" ]]; then
            echo ""
            echo "📁 File: $file"
            echo "   Problematic paths:"
            cd "$COMMANDS_DIR" && grep -n "^/[a-zA-Z-]\+[^:]" "$file" 2>/dev/null | sed 's/^/   • Line /' || true
        fi
    done <<< "$PROBLEMATIC_FILES"
    
    echo ""
    echo "💡 Expected format: /shared:category:command-name"
    echo "   Example: /shared:utils:clean-project instead of /clean-project"
    
    EXIT_CODE=1
else
    echo "✅ All command paths properly namespaced!"
    
    # Count total commands found
    TOTAL_COMMANDS=$(cd "$COMMANDS_DIR" && grep -r "^/shared:" . --include="*.md" 2>/dev/null | wc -l || echo "0")
    
    echo "📊 Statistics:"
    echo "   • Total namespaced commands: $TOTAL_COMMANDS"
    echo "   • Files checked: $(cd "$COMMANDS_DIR" && find . -name "*.md" | wc -l)"
fi

echo ""
echo "=================================================="
exit $EXIT_CODE