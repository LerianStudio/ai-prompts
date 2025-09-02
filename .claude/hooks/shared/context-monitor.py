#!/usr/bin/env python3
"""
Claude Code Context Monitor
Real-time context usage monitoring with visual indicators and session analytics
"""

import json
import sys
import os
import re
import subprocess

def parse_context_from_transcript(transcript_path):
    """Parse context usage from transcript file."""
    if not transcript_path or not os.path.exists(transcript_path):
        return None
    
    try:
        with open(transcript_path, 'r') as f:
            lines = f.readlines()
        
        # Check last 15 lines for context information
        recent_lines = lines[-15:] if len(lines) > 15 else lines
        
        for line in reversed(recent_lines):
            try:
                data = json.loads(line.strip())
                
                # Method 1: Parse usage tokens from assistant messages
                if data.get('type') == 'assistant':
                    message = data.get('message', {})
                    usage = message.get('usage', {})
                    
                    if usage:
                        input_tokens = usage.get('input_tokens', 0)
                        cache_read = usage.get('cache_read_input_tokens', 0)
                        cache_creation = usage.get('cache_creation_input_tokens', 0)
                        
                        # Estimate context usage (assume 200k context for Claude Sonnet)
                        total_tokens = input_tokens + cache_read + cache_creation
                        if total_tokens > 0:
                            percent_used = min(100, (total_tokens / 200000) * 100)
                            return {
                                'percent': percent_used,
                                'tokens': total_tokens,
                                'method': 'usage'
                            }
                
                # Method 2: Parse system context warnings
                elif data.get('type') == 'system_message':
                    content = data.get('content', '')
                    
                    # "Context left until auto-compact: X%"
                    match = re.search(r'Context left until auto-compact: (\d+)%', content)
                    if match:
                        percent_left = int(match.group(1))
                        return {
                            'percent': 100 - percent_left,
                            'warning': 'auto-compact',
                            'method': 'system'
                        }
                    
                    # "Context low (X% remaining)"
                    match = re.search(r'Context low \((\d+)% remaining\)', content)
                    if match:
                        percent_left = int(match.group(1))
                        return {
                            'percent': 100 - percent_left,
                            'warning': 'low',
                            'method': 'system'
                        }
            
            except (json.JSONDecodeError, KeyError, ValueError):
                continue
        
        return None
        
    except (FileNotFoundError, PermissionError):
        return None

def get_context_display(context_info):
    """Generate context display with visual indicators."""
    if not context_info:
        return "???"
    
    percent = context_info.get('percent', 0)
    warning = context_info.get('warning')
    
    # Color based on usage level
    if percent >= 95:
        color = "\033[31;1m"  # Blinking red
        alert = "CRIT"
    elif percent >= 90:
        color = "\033[31m"    # Red
        alert = "HIGH"
    elif percent >= 75:
        color = "\033[91m"   # Light red
        alert = ""
    elif percent >= 50:
        color = "\033[33m"   # Yellow
        alert = ""
    else:
        color = "\033[32m"   # Green
        alert = ""
    
    # Create progress bar
    segments = 8
    filled = int((percent / 100) * segments)
    bar = "█" * filled + "▁" * (segments - filled)
    
    # Special warnings
    if warning == 'auto-compact':
        alert = "AUTO-COMPACT!"
    elif warning == 'low':
        alert = "LOW!"
    
    reset = "\033[0m"
    alert_str = f" {alert}" if alert else ""
    
    return f"{color}{bar}{reset} {percent:.0f}%{alert_str}"

def get_directory_display(workspace_data):
    """Get directory display name."""
    current_dir = workspace_data.get('current_dir', '')
    project_dir = workspace_data.get('project_dir', '')
    
    if current_dir and project_dir:
        if current_dir.startswith(project_dir):
            rel_path = current_dir[len(project_dir):].lstrip('/')
            return rel_path or os.path.basename(project_dir)
        else:
            return os.path.basename(current_dir)
    elif project_dir:
        return os.path.basename(project_dir)
    elif current_dir:
        return os.path.basename(current_dir)
    else:
        return "unknown"

def get_rpg_stats(session_id, workspace_data):
    """Get RPG-style stats display."""
    try:
        # Use session ID for cache file
        session_short = session_id[:8] if session_id else "default"
        cache_file = f"/tmp/rpg_{session_short}"
        
        # Initialize or read RPG stats
        if not os.path.exists(cache_file):
            level, xp, class_name = 1, 0, "Novice"
            with open(cache_file, 'w') as f:
                f.write(f"{level} {xp} {class_name}\n")
        else:
            with open(cache_file, 'r') as f:
                parts = f.read().strip().split()
                level, xp, class_name = int(parts[0]), int(parts[1]), parts[2]
        
        # Add XP for this interaction
        xp += 3
        
        # Level up logic
        required_xp = level * 100
        if xp >= required_xp:
            level += 1
            xp = 0
            if level == 5:
                class_name = "Wizard"
            elif level >= 10:
                class_name = "Archmage"
        
        # Save updated stats
        with open(cache_file, 'w') as f:
            f.write(f"{level} {xp} {class_name}\n")
        
        required_xp = level * 100
        # Add weak background colors with contrasting dark text
        bg_color = "\033[104;30m"  # Light blue background, black text
        xp_bg = "\033[107;30m"  # Light white background, black text
        reset = "\033[0m"
        return f"| {bg_color} {class_name} Lv.{level} {reset} | {xp_bg} XP:{xp}/{required_xp} {reset}"
        
    except Exception:
        bg_color = "\033[104;30m"  # Light blue background, black text
        xp_bg = "\033[107;30m"  # Light white background, black text
        reset = "\033[0m"
        return f"| {bg_color}  Novice Lv.1 {reset} | {xp_bg} XP:0/100 {reset}"

def get_git_branch_display():
    """Get git branch display with change indicators."""
    try:
        # Check if we're in a git repository
        subprocess.run(['git', 'rev-parse', '--git-dir'], 
                      stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        
        # Get current branch
        result = subprocess.run(['git', 'branch', '--show-current'], 
                              capture_output=True, text=True, check=True)
        branch = result.stdout.strip()
        
        if branch:
            # Get count of uncommitted changes
            result = subprocess.run(['git', 'status', '--porcelain'], 
                                  capture_output=True, text=True, check=True)
            changes = len([line for line in result.stdout.strip().split('\n') if line])
            
            if changes > 0:
                return f"{branch} ({changes})"
            else:
                return f"{branch}"
        
        return ""
        
    except (subprocess.CalledProcessError, FileNotFoundError):
        return ""

def get_session_metrics(cost_data):
    """Get session metrics display."""
    return ""

def main():
    try:
        # Read JSON input from Claude Code
        data = json.load(sys.stdin)
        
        # Extract information
        model_name = data.get('model', {}).get('display_name', 'Claude')
        workspace = data.get('workspace', {})
        transcript_path = data.get('transcript_path', '')
        cost_data = data.get('cost', {})
        session_id = data.get('session_id', '')
        
        # Parse context usage
        context_info = parse_context_from_transcript(transcript_path)
        
        # Build status components
        context_display = get_context_display(context_info)
        directory = get_directory_display(workspace)
        session_metrics = get_session_metrics(cost_data)
        rpg_stats = get_rpg_stats(session_id, workspace)
        git_branch = get_git_branch_display()
        
        # Model display with context-aware coloring and background
        if context_info:
            percent = context_info.get('percent', 0)
            if percent >= 90:
                model_color = "\033[101;37m"  # Red background, white text
            elif percent >= 75:
                model_color = "\033[103;30m"  # Yellow background, black text
            else:
                model_color = "\033[102;30m"  # Green background, black text
            
            model_display = f"{model_color} {model_name} \033[0m"
        else:
            model_display = f"\033[104;30m {model_name} \033[0m"  # Blue background, black text
        
        # Combine all components
        git_display = f" | {git_branch}" if git_branch else ""
        # Add weak background colors with contrasting dark text
        dir_bg = "\033[103;30m"  # Light yellow background, black text
        git_bg = "\033[106;30m"  # Light cyan background, black text
        reset = "\033[0m"
        
        # Format git display with background if present
        git_formatted = f" | {git_bg} {git_branch} {reset}" if git_branch else ""
        
        status_line = f"{model_display} {rpg_stats} | {dir_bg} {directory} {reset}{git_formatted} | {context_display}{session_metrics}"
        
        print(status_line)
        
    except Exception as e:
        # Fallback display on any error
        bg_color = "\033[104;30m"  # Light blue background, black text
        xp_bg = "\033[107;30m"  # Light white background, black text
        dir_bg = "\033[103;30m"  # Light yellow background, black text
        error_bg = "\033[101;37m"  # Light red background, white text
        reset = "\033[0m"
        print(f"\033[104;30m Claude \033[0m | {bg_color}  Novice Lv.1 {reset} | {xp_bg} XP:0/100 {reset} | {dir_bg} {os.path.basename(os.getcwd())} {reset} | {error_bg} Error: {str(e)[:20]} {reset}")

if __name__ == "__main__":
    main()