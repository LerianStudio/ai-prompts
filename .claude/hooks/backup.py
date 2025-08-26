#!/usr/bin/env python3
"""
Automatically backup files before editing.
Creates timestamped backups in a .backups directory when files are modified.
"""

import os
import sys
import shutil
from datetime import datetime
from pathlib import Path

def main():
    file_path = os.environ.get('CLAUDE_TOOL_FILE_PATH')
    
    if not file_path or not os.path.isfile(file_path):
        sys.exit(0)
    
    backup_dir = Path('.backups')
    backup_dir.mkdir(exist_ok=True)
    
    file_name = Path(file_path).name
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_name = f"{file_name}.{timestamp}.bak"
    backup_path = backup_dir / backup_name
    
    try:
        shutil.copy2(file_path, backup_path)
        print(f"Backed up {file_path} to {backup_path}")
    except Exception as e:
        print(f"Warning: Failed to backup {file_path}: {e}", file=sys.stderr)
        sys.exit(0)

if __name__ == '__main__':
    main()