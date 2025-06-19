#!/usr/bin/env python3
"""
Script to update Memory MCP references in all prompt files
"""

import os
import re

# Mapping of old patterns to new patterns
REPLACEMENTS = {
    # Simple pattern replacements
    r'`memory_store_chunk`': '`mcp__lerian-memory__memory_create` with `operation="store_chunk"`',
    r'`memory_search`': '`mcp__lerian-memory__memory_read` with `operation="search"`',
    r'`memory_store_decision`': '`mcp__lerian-memory__memory_create` with `operation="store_decision"`',
    r'`memory_tasks`': '`mcp__lerian-memory__memory_tasks` with `operation="todo_write"`',
    r'`memory_create_thread`': '`mcp__lerian-memory__memory_create` with `operation="create_thread"`',
    
    # Action patterns with context
    r'memory_store_chunk with (.+)': r'''Use `mcp__lerian-memory__memory_create` with:
      ```
      operation="store_chunk"
      options={
        "content": "\1",
        "repository": "github.com/[org]/[repo]",
        "session_id": "[current-session]"
      }
      ```''',
    
    r'memory_search for (.+)': r'''Use `mcp__lerian-memory__memory_read` with:
      ```
      operation="search"
      options={
        "query": "\1",
        "repository": "github.com/[org]/[repo]"
      }
      ```''',
    
    r'memory_store_decision for (.+)': r'''Use `mcp__lerian-memory__memory_create` with:
      ```
      operation="store_decision"
      options={
        "decision": "\1",
        "rationale": "[rationale]",
        "repository": "github.com/[org]/[repo]",
        "session_id": "[current-session]"
      }
      ```''',
    
    r'memory_tasks for (.+)': r'''Use `mcp__lerian-memory__memory_tasks` with:
      ```
      operation="todo_write"
      options={
        "todos": [{"content": "\1", "status": "in_progress", "priority": "high"}],
        "repository": "github.com/[org]/[repo]"
      }
      ```''',
    
    r'memory_create_thread linking (.+)': r'''Use `mcp__lerian-memory__memory_create` with:
      ```
      operation="create_thread"
      options={
        "name": "\1",
        "description": "Linking related content",
        "chunk_ids": ["[previous-chunk-ids]"],
        "repository": "github.com/[org]/[repo]"
      }
      ```''',
}

def update_file(filepath):
    """Update a single file with Memory MCP replacements"""
    with open(filepath, 'r') as f:
        content = f.read()
    
    original_content = content
    
    # Apply replacements
    for pattern, replacement in REPLACEMENTS.items():
        content = re.sub(pattern, replacement, content)
    
    # Only write if changes were made
    if content != original_content:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

def main():
    """Main function to process all files"""
    updated_files = []
    
    # Define directories to process
    directories = [
        '1-pre-dev-product',
        '2-pre-dev-feature',
        '3-frontend',
        '4-code-review',
        '5-generate-docs',
        '0-memory-system'
    ]
    
    for directory in directories:
        dir_path = f'/Users/fredamaral/Repos/lerianstudio/ai-prompts/{directory}'
        if not os.path.exists(dir_path):
            continue
            
        for filename in os.listdir(dir_path):
            if filename.endswith(('.mdc', '.md')):
                filepath = os.path.join(dir_path, filename)
                if update_file(filepath):
                    updated_files.append(filepath)
                    print(f"Updated: {filepath}")
    
    print(f"\nTotal files updated: {len(updated_files)}")
    
    # List files that might need manual review
    print("\nFiles to manually review for complex patterns:")
    for directory in directories:
        dir_path = f'/Users/fredamaral/Repos/lerianstudio/ai-prompts/{directory}'
        if not os.path.exists(dir_path):
            continue
            
        for filename in os.listdir(dir_path):
            if filename.endswith(('.mdc', '.md')):
                filepath = os.path.join(dir_path, filename)
                with open(filepath, 'r') as f:
                    content = f.read()
                    # Check for patterns that might need manual review
                    if any(pattern in content for pattern in ['Memory Action:', 'memory_', 'Memory MCP']):
                        print(f"  - {filepath}")

if __name__ == "__main__":
    main()