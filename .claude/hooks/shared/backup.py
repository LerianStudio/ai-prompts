#!/usr/bin/env python3
"""
Automatically backup files before editing.
Creates timestamped backups in a .backups directory when files are modified.
Enhanced with comprehensive diagnostics and logging.
"""

import os
import sys
import shutil
import json
from datetime import datetime, timedelta
from pathlib import Path

def log_debug(message, level="INFO"):
    """Log debug information to help diagnose hook execution issues."""
    log_file = Path.home() / '.claude-backup-debug.log'
    timestamp = datetime.now().isoformat()
    
    try:
        with open(log_file, 'a') as f:
            f.write(f"[{timestamp}] {level}: {message}\n")
    except Exception:
        pass  # Silent fail for logging to avoid disrupting backup process

def get_relative_date_folder(target_date=None):
    """Calculate relative date folder name based on current date."""
    if target_date is None:
        target_date = datetime.now().date()
    
    today = datetime.now().date()
    delta = today - target_date
    days_diff = delta.days
    
    if days_diff == 0:
        return "today"
    elif days_diff == 1:
        return "yesterday"
    elif 2 <= days_diff <= 6:
        return f"{days_diff} days ago"
    elif 7 <= days_diff <= 13:
        return "last week"
    else:
        # Format as YYYY-MM-DD for older dates
        return target_date.strftime("%Y-%m-%d")

def detect_operation_type(hook_input, file_path):
    """Detect the type of file operation being performed."""
    tool_name = hook_input.get('tool_name', '')
    tool_input = hook_input.get('tool_input', {})
    
    # Check if file exists before operation
    file_exists = os.path.isfile(file_path) if file_path else False
    
    if tool_name == 'Write':
        if file_exists:
            return 'update'  # Overwriting existing file
        else:
            return 'create'  # Creating new file
    elif tool_name in ['Edit', 'MultiEdit']:
        return 'update'  # Always updating existing content
    elif tool_name == 'Bash':
        # Check if bash command involves file deletion
        command = tool_input.get('command', '')
        if any(delete_cmd in command.lower() for delete_cmd in ['rm ', 'del ', 'unlink', 'remove']):
            return 'delete'
        else:
            return 'unknown'  # Other bash operations
    else:
        return 'unknown'

def create_backup_metadata(original_path, hook_input, context, operation_type):
    """Create metadata for the backup."""
    metadata = {
        "backup_created": datetime.now().isoformat(),
        "operation_type": operation_type,
        "backup_info": {
            "relative_path": str(Path(original_path).relative_to(Path.cwd())) if original_path else None,
            "working_directory": str(Path.cwd()),
            "git_repo": Path('.git').exists() or Path('.git').is_file(),
        },
        "hook_context": {
            "tool_name": hook_input.get('tool_name'),
            "hook_event": hook_input.get('hook_event_name'),
            "session_id": hook_input.get('session_id'),
        },
        "system_info": {
            "python_version": context['python_version'].split('\n')[0],  # First line only
            "timestamp": context['timestamp'],
        }
    }
    
    # Add file information if file exists
    if original_path and os.path.isfile(original_path):
        file_stat = os.stat(original_path)
        metadata["original_file"] = {
            "path": str(original_path),
            "name": Path(original_path).name,
            "size": file_stat.st_size,
            "modified": datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
            "permissions": oct(file_stat.st_mode)[-3:],
        }
    else:
        # For create operations or missing files
        metadata["original_file"] = {
            "path": str(original_path) if original_path else None,
            "name": Path(original_path).name if original_path else None,
            "size": None,
            "modified": None,
            "permissions": None,
            "note": "File did not exist at backup time (create operation)" if operation_type == 'create' else "File not found"
        }
    
    # Add tool-specific information
    tool_input = hook_input.get('tool_input', {})
    if tool_input:
        tool_operation = {
            "type": hook_input.get('tool_name'),
        }
        
        # Add operation-specific details
        if operation_type in ['update', 'create']:
            tool_operation.update({
                "old_string": tool_input.get('old_string', '').strip()[:200] if tool_input.get('old_string') else None,
                "new_string": tool_input.get('new_string', '').strip()[:200] if tool_input.get('new_string') else None,
                "content_preview": tool_input.get('content', '').strip()[:200] if tool_input.get('content') else None,
            })
        elif operation_type == 'delete':
            tool_operation.update({
                "command": tool_input.get('command', '').strip()[:200] if tool_input.get('command') else None,
            })
        
        metadata["tool_operation"] = tool_operation
    
    return metadata

def get_execution_context():
    """Gather comprehensive execution context for debugging."""
    context = {
        'timestamp': datetime.now().isoformat(),
        'working_directory': os.getcwd(),
        'script_path': __file__,
        'python_executable': sys.executable,
        'python_version': sys.version,
        'environment_variables': {
            'CLAUDE_PROJECT_DIR': os.environ.get('CLAUDE_PROJECT_DIR'),
            'PWD': os.environ.get('PWD'),
        },
        'process_info': {
            'pid': os.getpid(),
            'ppid': os.getppid() if hasattr(os, 'getppid') else None,
        }
    }
    
    # Check if we can detect Claude Code execution
    claude_vars = [k for k in os.environ.keys() if k.startswith('CLAUDE_')]
    context['claude_variables'] = {k: os.environ.get(k) for k in claude_vars}
    
    return context

def validate_environment():
    """Validate execution environment and return validation results."""
    validation = {
        'backup_dir_writable': False,
        'in_git_repo': False,
        'warnings': []
    }
    
    # Check if we can write to backup directory
    try:
        backup_dir = Path('.backups')
        backup_dir.mkdir(exist_ok=True)
        validation['backup_dir_writable'] = os.access(backup_dir, os.W_OK)
    except Exception as e:
        validation['warnings'].append(f"Cannot create/access backup directory: {e}")
    
    # Check if we're in a git repository
    validation['in_git_repo'] = Path('.git').exists() or Path('.git').is_file()
    
    return validation

def main():
    # Always log execution attempt for debugging
    log_debug("=== Backup Hook Execution Started ===")
    
    # Read JSON input from Claude Code via stdin
    try:
        hook_input = json.load(sys.stdin)
        log_debug(f"Hook input received: {json.dumps(hook_input, indent=2)}")
    except json.JSONDecodeError as e:
        log_debug(f"Failed to parse JSON input from stdin: {e}", "ERROR")
        sys.exit(0)
    except Exception as e:
        log_debug(f"Error reading stdin: {e}", "ERROR")
        sys.exit(0)
    
    # Gather execution context
    context = get_execution_context()
    log_debug(f"Execution context: {json.dumps(context, indent=2)}")
    
    # Extract file path from hook input
    tool_input = hook_input.get('tool_input', {})
    file_path = tool_input.get('file_path')
    
    # Detect operation type
    operation_type = detect_operation_type(hook_input, file_path)
    log_debug(f"Detected operation type: {operation_type}")
    
    # Handle different operation types
    if not file_path:
        log_debug("No file_path in tool_input - checking if this is a relevant operation", "INFO")
        
        # Some operations might not have file_path but still be relevant
        tool_name = hook_input.get('tool_name', '')
        if tool_name not in ['Write', 'Edit', 'MultiEdit']:
            log_debug(f"Tool {tool_name} is not a file operation - skipping backup", "INFO")
            sys.exit(0)
        else:
            log_debug("Missing file_path for file operation - cannot proceed with backup", "WARNING")
            sys.exit(0)
    
    # Validate environment
    validation = validate_environment()
    validation['hook_input_valid'] = bool(file_path)
    validation['operation_type'] = operation_type
    log_debug(f"Environment validation: {json.dumps(validation, indent=2)}")
    
    # Special handling for different operation types
    if operation_type == 'create':
        if os.path.isfile(file_path):
            log_debug(f"File already exists for 'create' operation, treating as 'update': {file_path}")
            operation_type = 'update'
    elif operation_type == 'update':
        if not os.path.isfile(file_path):
            log_debug(f"File does not exist for 'update' operation: {file_path}", "WARNING")
            # Still proceed to create backup structure for tracking
    elif operation_type == 'delete':
        if not os.path.isfile(file_path):
            log_debug(f"File already deleted or does not exist: {file_path}", "WARNING")
            # Still proceed to create backup structure for tracking
    
    log_debug(f"Processing backup for file: {file_path} (operation: {operation_type})")
    
    # Calculate relative date folder and relative path
    relative_date_folder = get_relative_date_folder()
    try:
        relative_file_path = Path(file_path).relative_to(Path.cwd())
    except ValueError:
        # File is outside current directory, use absolute path structure
        relative_file_path = Path(file_path).resolve().relative_to(Path("/"))
    
    # Create hierarchical backup directory structure
    backup_base_dir = Path('.backups')
    backup_date_dir = backup_base_dir / relative_date_folder
    backup_file_dir = backup_date_dir / relative_file_path.parent
    
    try:
        backup_file_dir.mkdir(parents=True, exist_ok=True)
        log_debug(f"Backup directory structure created: {backup_file_dir.absolute()}")
    except Exception as e:
        log_debug(f"Failed to create backup directory structure: {e}", "ERROR")
        print(f"Error: Cannot create backup directory structure: {e}", file=sys.stderr)
        sys.exit(1)
    
    # Generate backup file paths
    original_file_name = Path(file_path).name
    backup_file_path = backup_file_dir / original_file_name
    metadata_file_path = backup_file_dir / "metadata.json"
    
    log_debug(f"Backup structure:")
    log_debug(f"  Date folder: {relative_date_folder}")
    log_debug(f"  Relative path: {relative_file_path}")
    log_debug(f"  Backup file: {backup_file_path}")
    log_debug(f"  Metadata file: {metadata_file_path}")
    
    # Perform backup operation
    try:
        file_size = None
        backup_success = False
        
        # Handle different operation types
        if operation_type in ['update', 'delete'] and os.path.isfile(file_path):
            # File exists and can be backed up
            file_stat = os.stat(file_path)
            file_size = file_stat.st_size
            
            log_debug(f"File size: {file_size} bytes")
            
            # Copy original file with metadata preservation
            shutil.copy2(file_path, backup_file_path)
            backup_success = True
            
        elif operation_type == 'create':
            # For create operations, file might not exist yet
            if os.path.isfile(file_path):
                file_stat = os.stat(file_path)
                file_size = file_stat.st_size
                shutil.copy2(file_path, backup_file_path)
                backup_success = True
                log_debug(f"Backed up existing file before overwrite: {file_size} bytes")
            else:
                log_debug("No existing file to backup for create operation - creating metadata only")
                backup_success = False  # No file to backup, but still create metadata
        else:
            log_debug(f"File not found for {operation_type} operation - creating metadata only")
            backup_success = False  # No file to backup, but still create metadata
        
        # Always create metadata file
        metadata = create_backup_metadata(file_path, hook_input, context, operation_type)
        
        with open(metadata_file_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Verify backup results
        if metadata_file_path.exists():
            if backup_success and backup_file_path.exists():
                backup_size = os.stat(backup_file_path).st_size
                if backup_size == file_size:
                    log_debug(f"✅ Backup successful:", "SUCCESS")
                    log_debug(f"  File: {backup_file_path} ({backup_size} bytes)", "SUCCESS")
                    log_debug(f"  Metadata: {metadata_file_path}", "SUCCESS")
                    print(f"Backed up {file_path} to {backup_file_path}")
                else:
                    log_debug(f"❌ Backup size mismatch: expected {file_size}, got {backup_size}", "ERROR")
                    print(f"Warning: Backup size mismatch for {file_path}", file=sys.stderr)
            else:
                log_debug(f"✅ Metadata-only backup successful for {operation_type} operation:", "SUCCESS")
                log_debug(f"  Metadata: {metadata_file_path}", "SUCCESS")
                print(f"Created backup metadata for {operation_type} operation: {file_path}")
        else:
            log_debug("❌ Backup metadata was not created", "ERROR")
            print(f"Error: Backup metadata was not created for {file_path}", file=sys.stderr)
            
    except Exception as e:
        log_debug(f"❌ Backup operation failed: {e}", "ERROR")
        print(f"Warning: Failed to backup {file_path}: {e}", file=sys.stderr)
        sys.exit(0)  # Don't fail the hook, just warn
    
    log_debug("=== Backup Hook Execution Completed ===")

if __name__ == '__main__':
    main()