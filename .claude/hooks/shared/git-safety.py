#!/usr/bin/env python3
"""
Git Safety Hook for Claude Code
Blocks dangerous Git operations while allowing read-only commands.
"""
import json
import re
import sys


DANGEROUS_GIT_PATTERNS = [
    (r'\bgit\s+add\b', "git add is blocked - use read-only git commands only"),
    (r'\bgit\s+commit\b', "git commit is blocked - use read-only git commands only"),
    
    (r'\bgit\s+push\b', "git push is blocked - use read-only git commands only"),
    (r'\bgit\s+pull\b', "git pull is blocked - use read-only git commands only"),
    (r'\bgit\s+fetch\b(?!\s+--dry-run)', "git fetch is blocked - use read-only git commands only"),
    
    (r'\bgit\s+merge\b', "git merge is blocked - use read-only git commands only"),
    (r'\bgit\s+rebase\b', "git rebase is blocked - use read-only git commands only"),
    (r'\bgit\s+cherry-pick\b', "git cherry-pick is blocked - use read-only git commands only"),
    
    (r'\bgit\s+reset\s+--hard\b', "git reset --hard is blocked - use read-only git commands only"),
    (r'\bgit\s+clean\b', "git clean is blocked - use read-only git commands only"),
    (r'\bgit\s+rm\b', "git rm is blocked - use read-only git commands only"),
    (r'\bgit\s+mv\b', "git mv is blocked - use read-only git commands only"),
    
    (r'\bgit\s+branch\s+(?:.*\s+)?-[dD]\b', "git branch deletion is blocked - use read-only git commands only"),
    (r'\bgit\s+checkout\s+(?!--\s|\.)', "git checkout for branch switching is blocked - use read-only git commands only"),
    (r'\bgit\s+switch\b', "git switch is blocked - use read-only git commands only"),
    
    (r'\bgit\s+tag\s+(?:.*\s+)?-d\b', "git tag deletion is blocked - use read-only git commands only"),
    (r'\bgit\s+tag\s+[^-\s]', "git tag creation is blocked - use read-only git commands only"),
    
    (r'\bgit\s+clone\b', "git clone is blocked - use read-only git commands only"),
    (r'\bgit\s+init\b', "git init is blocked - use read-only git commands only"),
    
    (r'\bgit\s+stash\s+(?:drop|clear|pop|apply)', "destructive git stash operations are blocked - use read-only git commands only"),
    
    (r'\bgit\s+submodule\s+(?:add|update|sync)', "git submodule modifications are blocked - use read-only git commands only"),
    
    (r'\bgit\s+config\s+(?!--list|--get)', "git config modifications are blocked - use read-only git commands only"),
    
    (r'\bgit\s+remote\s+(?:add|remove|set-url)', "git remote modifications are blocked - use read-only git commands only"),
]

SAFE_GIT_PATTERNS = [
    r'\bgit\s+status\b',
    r'\bgit\s+log\b',
    r'\bgit\s+diff\b',
    r'\bgit\s+show\b',
    r'\bgit\s+branch\s*$',
    r'\bgit\s+branch\s+--list\b',
    r'\bgit\s+tag\s*$',
    r'\bgit\s+tag\s+--list\b',
    r'\bgit\s+remote\s*$',
    r'\bgit\s+remote\s+-v\b',
    r'\bgit\s+config\s+--list\b',
    r'\bgit\s+config\s+--get\b',
    r'\bgit\s+ls-files\b',
    r'\bgit\s+ls-tree\b',
    r'\bgit\s+ls-remote\b',
    r'\bgit\s+describe\b',
    r'\bgit\s+rev-parse\b',
    r'\bgit\s+rev-list\b',
    r'\bgit\s+blame\b',
    r'\bgit\s+grep\b',
    r'\bgit\s+help\b',
    r'\bgit\s+version\b',
    r'\bgit\s+submodule\s+status\b',
    r'\bgit\s+stash\s+list\b',
    r'\bgit\s+stash\s+show\b',
    r'\bgit\s+fetch\s+--dry-run\b',
    r'\bgit\s+shortlog\b',
    r'\bgit\s+whatchanged\b',
    r'\bgit\s+reflog\s+(?:show|expire\s+--dry-run)\b',
]


def is_safe_git_command(command: str) -> bool:
    for pattern in SAFE_GIT_PATTERNS:
        if re.search(pattern, command, re.IGNORECASE):
            return True
    return False


def validate_git_command(command: str) -> list[str]:
    """
    Validate a command for dangerous Git operations.
    Returns a list of issues found.
    """
    issues = []
    if is_safe_git_command(command):
        return issues
    
    git_execution_pattern = r'(?:^|\s|;|\||&|`|\$\()\s*git\s+'
    
    if re.search(git_execution_pattern, command, re.IGNORECASE):
        for pattern, message in DANGEROUS_GIT_PATTERNS:
            if re.search(pattern, command, re.IGNORECASE):
                issues.append(message)
                break
    
    return issues


def main():
    try:
        input_data = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)

    tool_name = input_data.get("tool_name", "")
    tool_input = input_data.get("tool_input", {})
    command = tool_input.get("command", "")

    if tool_name != "Bash" or not command:
        sys.exit(0)

    git_execution_pattern = r'(?:^|;|\||&&|\|\||`|\$\()\s*git\s+'
    if not re.search(git_execution_pattern, command, re.IGNORECASE):
        sys.exit(0)

    issues = validate_git_command(command)

    if issues:
        print("\n🚫 Git Safety Hook: Dangerous git operation blocked!", file=sys.stderr)
        print(f"Command: {command}", file=sys.stderr)
        print("\nBlocked because:", file=sys.stderr)
        for issue in issues:
            print(f"  • {issue}", file=sys.stderr)
        
        print("\n✅ Allowed git operations include:", file=sys.stderr)
        print("  • git status, git log, git diff, git show", file=sys.stderr)
        print("  • git branch (list only), git tag (list only)", file=sys.stderr)
        print("  • git remote -v, git config --list", file=sys.stderr)
        print("  • git ls-files, git blame, git grep", file=sys.stderr)
        
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()