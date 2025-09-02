#!/usr/bin/env python3
"""
Automated testing hook for JavaScript/TypeScript/React projects.
Runs relevant tests after code changes.
"""

import json
import sys
import os
import subprocess
from pathlib import Path

def should_run_tests(file_path):
    """Determine if tests should run based on file extension and path."""
    test_extensions = {'.js', '.jsx', '.ts', '.tsx'}
    
    # Skip test files themselves to avoid infinite loops
    test_indicators = ['test', 'spec', '__tests__', '.test.', '.spec.']
    
    file_path_lower = file_path.lower()
    if any(indicator in file_path_lower for indicator in test_indicators):
        return False
    
    # Check file extension
    file_ext = Path(file_path).suffix.lower()
    return file_ext in test_extensions

def run_nodejs_tests(file_path):
    """Run Node.js tests for JavaScript/TypeScript files."""
    commands_to_try = [
        ['npm', 'test'],
        ['yarn', 'test'],
        ['npx', 'jest'],
        ['npm', 'run', 'test'],
        ['npx', 'vitest', 'run'],
        ['npm', 'run', 'test:unit']
    ]
    
    for cmd in commands_to_try:
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60,
                cwd=os.getcwd()
            )
            if result.returncode == 0:
                print(f"✅ Tests passed for {file_path}")
                return True
            else:
                print(f"⚠️ Tests failed for {file_path}")
                # Show first few lines of error output
                if result.stderr:
                    lines = result.stderr.split('\n')[:3]
                    for line in lines:
                        if line.strip():
                            print(f"   {line}")
                return False
        except (subprocess.TimeoutExpired, FileNotFoundError):
            continue
    
    print(f"⚪ No test runner found for {file_path}")
    return True

def has_package_json():
    """Check if this is a Node.js project."""
    return os.path.isfile('package.json')

def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError:
        sys.exit(0)

    hook_event = input_data.get("hook_event_name", "")
    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    # Only process PostToolUse events for Edit/Write operations
    if hook_event != "PostToolUse" or tool_name not in ["Edit", "Write", "MultiEdit"]:
        sys.exit(0)

    file_path = tool_input.get("file_path", "")
    if not file_path or not os.path.isfile(file_path):
        sys.exit(0)

    # Check if this is a Node.js project
    if not has_package_json():
        sys.exit(0)

    # Check if we should run tests for this file
    if not should_run_tests(file_path):
        sys.exit(0)

    # Run Node.js tests
    run_nodejs_tests(file_path)
    
    # Always exit with 0 to avoid blocking operations
    sys.exit(0)

if __name__ == '__main__':
    main()