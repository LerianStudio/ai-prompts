#!/usr/bin/env python3
"""
ESLint Hook for Claude Code
Automatically lints JavaScript/TypeScript files after Write/Edit operations.
"""
import json
import sys
import subprocess
import os
from pathlib import Path


ESLINT_EXTENSIONS = {
    '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'
}


def is_eslint_available() -> bool:
    """Check if ESLint is available in the project or globally."""
    if os.path.exists("node_modules/.bin/eslint"):
        return True
    
    try:
        subprocess.run(["eslint", "--version"], 
                      capture_output=True, check=True, timeout=5)
        return True
    except (subprocess.CalledProcessError, FileNotFoundError, subprocess.TimeoutExpired):
        return False


def get_eslint_command() -> str:
    if os.path.exists("node_modules/.bin/eslint"):
        return "node_modules/.bin/eslint"
    return "eslint"


def should_lint_file(file_path: str) -> bool:
    """Check if file should be linted by ESLint."""
    path = Path(file_path)
    if path.suffix.lower() not in ESLINT_EXTENSIONS:
        return False
    
    ignore_patterns = [
        'node_modules/', '.git/', 'dist/', 'build/', '.next/',
        'coverage/', '.nyc_output/', 'lib/', 'es/', 'umd/',
        '.eslintrc.js', '.eslintrc.cjs'
    ]
    
    str_path = str(path)
    if any(pattern in str_path for pattern in ignore_patterns):
        return False
    
    if not path.exists() or not path.is_file():
        return False
    
    return True


def lint_file(file_path: str) -> tuple[bool, str, list]:
    """Lint a file with ESLint. Returns (has_errors, message, issues)."""
    try:
        eslint_cmd = get_eslint_command()
        
        result = subprocess.run([
            eslint_cmd,
            "--format", "json",
            file_path
        ], capture_output=True, text=True, timeout=30)
        
        if result.returncode == 2:
            error_msg = result.stderr or "ESLint configuration error"
            return True, f"ESLint fatal error for {os.path.basename(file_path)}: {error_msg.strip()}", []
        
        try:
            lint_results = json.loads(result.stdout)
            if not lint_results:
                return False, f"ESLint: {os.path.basename(file_path)} ✅", []
            
            file_result = lint_results[0]
            messages = file_result.get("messages", [])
            
            if not messages:
                return False, f"ESLint: {os.path.basename(file_path)} ✅", []
            
            errors = [msg for msg in messages if msg.get("severity") == 2]
            warnings = [msg for msg in messages if msg.get("severity") == 1]
            
            error_count = len(errors)
            warning_count = len(warnings)
            
            if error_count > 0:
                return True, f"ESLint: {os.path.basename(file_path)} ❌ {error_count} error(s), {warning_count} warning(s)", messages
            elif warning_count > 0:
                return False, f"ESLint: {os.path.basename(file_path)} ⚠️  {warning_count} warning(s)", messages
            else:
                return False, f"ESLint: {os.path.basename(file_path)} ✅", []
                
        except json.JSONDecodeError:
            return True, f"ESLint: {os.path.basename(file_path)} - Failed to parse results", []
    
    except subprocess.TimeoutExpired:
        return True, f"ESLint timeout for {os.path.basename(file_path)}", []
    except Exception as e:
        return True, f"ESLint error for {os.path.basename(file_path)}: {str(e)}", []


def format_lint_issues(issues: list) -> str:
    """Format lint issues for display."""
    if not issues:
        return ""
    
    important_issues = []
    for issue in issues[:5]:
        severity = "ERROR" if issue.get("severity") == 2 else "WARN"
        line = issue.get("line", "?")
        col = issue.get("column", "?")
        rule = issue.get("ruleId", "")
        message = issue.get("message", "")
        
        important_issues.append(f"  {severity} {line}:{col} {message} ({rule})")
    
    result = "\n" + "\n".join(important_issues)
    if len(issues) > 5:
        result += f"\n  ... and {len(issues) - 5} more issue(s)"
    
    return result


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
    
    if not is_eslint_available():
        sys.exit(0)
    
    file_path = tool_input.get("file_path", "")
    if not file_path:
        sys.exit(0)
    
    if not should_lint_file(file_path):
        sys.exit(0)
    
    has_errors, message, issues = lint_file(file_path)
    
    output = message
    if issues:
        output += format_lint_issues(issues)
    
    if has_errors:
        print(output, file=sys.stderr)
        sys.exit(1)
    else:
        print(output, file=sys.stdout)
        sys.exit(0)


if __name__ == "__main__":
    main()