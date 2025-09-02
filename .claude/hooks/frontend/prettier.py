#!/usr/bin/env python3
"""
Prettier Hook for Claude Code
Automatically formats code files after Write/Edit operations.
"""
import json
import sys
import subprocess
import os
from pathlib import Path


PRETTIER_EXTENSIONS = {
    '.js', '.jsx', '.ts', '.tsx', '.json', '.css', '.scss', '.less',
    '.html', '.htm', '.vue', '.md', '.mdx', '.yaml', '.yml'
}


def is_prettier_available() -> bool:
    if os.path.exists("node_modules/.bin/prettier"):
        return True
    
    try:
        subprocess.run(["prettier", "--version"], 
                      capture_output=True, check=True, timeout=5)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        return False


def get_prettier_command() -> str:
    if os.path.exists("node_modules/.bin/prettier"):
        return "node_modules/.bin/prettier"
    return "prettier"


def should_format_file(file_path: str) -> bool:
    path = Path(file_path)
    if path.suffix.lower() not in PRETTIER_EXTENSIONS:
        return False
    
    ignore_patterns = [
        'node_modules/', '.git/', 'dist/', 'build/', '.next/',
        'coverage/', '.nyc_output/', 'lib/', 'es/', 'umd/'
    ]
    
    str_path = str(path)
    if any(pattern in str_path for pattern in ignore_patterns):
        return False
    
    if not path.exists() or not path.is_file():
        return False
    
    return True


def format_file(file_path: str) -> tuple[bool, str]:
    try:
        prettier_cmd = get_prettier_command()
        result = subprocess.run([
            prettier_cmd,
            "--write",
            file_path
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 0:
            return True, f"Formatted {os.path.basename(file_path)} with Prettier"
        else:
            error_msg = result.stderr or result.stdout or "Unknown error"
            return False, f"Prettier error for {os.path.basename(file_path)}: {error_msg.strip()}"
    
    except subprocess.TimeoutExpired:
        return False, f"Prettier timeout for {os.path.basename(file_path)}"
    except Exception as e:
        return False, f"Prettier error for {os.path.basename(file_path)}: {str(e)}"


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)

    hook_event = input_data.get("hook_event_name", "")
    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})

    if hook_event != "PostToolUse":
        sys.exit(0)
    
    if tool_name not in ["Write", "Edit", "MultiEdit"]:
        sys.exit(0)
    
    if not is_prettier_available():
        sys.exit(0)
    
    file_path = tool_input.get("file_path", "")
    if not file_path:
        sys.exit(0)
    
    if not should_format_file(file_path):
        sys.exit(0)
    
    success, message = format_file(file_path)
    
    if success:
        print(f"✨ {message}", file=sys.stdout)
        sys.exit(0)
    else:
        print(f"⚠️  {message}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()