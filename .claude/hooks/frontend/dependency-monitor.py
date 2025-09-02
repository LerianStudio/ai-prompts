#!/usr/bin/env python3
"""
Dependency analysis and security checking hook.
Monitors Node.js packages for outdated dependencies and security vulnerabilities
when dependency files are modified.
"""

import json
import sys
import os
import subprocess
from pathlib import Path

# Dependency files to monitor
DEPENDENCY_FILES = {
    'package.json',
    'package-lock.json', 
    'yarn.lock',
    'pnpm-lock.yaml'
}

def is_dependency_file(file_path):
    """Check if the file is a Node.js dependency management file."""
    file_name = Path(file_path).name
    return file_name in DEPENDENCY_FILES

def run_npm_security_checks():
    """Run npm security audit and update checks."""
    checks_run = []
    
    # Run npm audit
    try:
        result = subprocess.run(
            ['npm', 'audit', '--json'],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=os.getcwd()
        )
        
        if result.returncode == 0:
            audit_data = json.loads(result.stdout)
            vulnerabilities = audit_data.get('metadata', {}).get('vulnerabilities', {})
            total_vulns = sum(vulnerabilities.values()) if vulnerabilities else 0
            
            if total_vulns == 0:
                print("✅ npm audit: No vulnerabilities found")
            else:
                print(f"⚠️ npm audit: {total_vulns} vulnerabilities found")
                print("   Run 'npm audit fix' to resolve issues")
            checks_run.append('npm audit')
        else:
            print("⚪ npm audit: No audit data available")
            
    except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError):
        print("⚪ npm audit: Command not available or failed")

    # Check for outdated packages using npm outdated
    try:
        result = subprocess.run(
            ['npm', 'outdated', '--json'],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=os.getcwd()
        )
        
        if result.returncode != 0 and result.stdout.strip():
            # npm outdated returns non-zero when outdated packages exist
            outdated_data = json.loads(result.stdout)
            if outdated_data:
                outdated_count = len(outdated_data)
                print(f"📦 npm outdated: {outdated_count} packages can be updated")
                print("   Run 'npm update' to update packages")
            checks_run.append('npm outdated')
        elif result.returncode == 0:
            print("✅ npm outdated: All packages are up to date")
            checks_run.append('npm outdated')
            
    except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError):
        # Try alternative approach with npm-check-updates
        try:
            result = subprocess.run(
                ['npx', 'npm-check-updates', '--json'],
                capture_output=True,
                text=True,
                timeout=30,
                cwd=os.getcwd()
            )
            
            if result.returncode == 0 and result.stdout.strip():
                updates_data = json.loads(result.stdout)
                if updates_data:
                    outdated_count = len(updates_data)
                    print(f"📦 npm-check-updates: {outdated_count} packages can be updated")
                    print("   Run 'npx npm-check-updates -u' to update")
                else:
                    print("✅ npm-check-updates: All packages are up to date")
                checks_run.append('npm-check-updates')
                
        except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError):
            print("⚪ npm package update checks: Commands not available")

    # Check for yarn if yarn.lock exists
    if os.path.exists('yarn.lock'):
        try:
            result = subprocess.run(
                ['yarn', 'audit', '--json'],
                capture_output=True,
                text=True,
                timeout=30,
                cwd=os.getcwd()
            )
            
            if result.returncode == 0:
                print("✅ yarn audit: No vulnerabilities found")
            else:
                print("⚠️ yarn audit: Security vulnerabilities found")
                print("   Run 'yarn audit --fix' to resolve issues")
            checks_run.append('yarn audit')
            
        except (subprocess.TimeoutExpired, FileNotFoundError):
            print("⚪ yarn audit: Command not available")

    return checks_run

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
    if not file_path:
        sys.exit(0)

    # Check if this is a dependency file
    if not is_dependency_file(file_path):
        sys.exit(0)

    print(f"🔍 Dependency file modified: {file_path}")

    # Run Node.js security checks
    run_npm_security_checks()

    # Always exit with 0 to avoid blocking operations
    sys.exit(0)

if __name__ == '__main__':
    main()