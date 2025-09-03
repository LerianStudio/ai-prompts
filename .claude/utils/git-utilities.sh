#!/bin/bash

# Git Utilities for Slash Commands
# Common git utility functions for commands needing git-focused functionality

# Get files based on git scope
get_git_files() {
    local scope="${1:-all-changes}"
    case "$scope" in
        "staged")
            git diff --cached --name-only --diff-filter=ACMR 2>/dev/null || true
            ;;
        "unstaged") 
            git diff --name-only --diff-filter=ACMR 2>/dev/null || true
            ;;
        "all-changes")
            git diff HEAD --name-only --diff-filter=ACMR 2>/dev/null || true
            ;;
        "last-commit")
            git diff HEAD~1..HEAD --name-only --diff-filter=ACMR 2>/dev/null || true
            ;;
        "branch")
            local base_branch=$(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null || echo "HEAD~1")
            git diff "$base_branch..HEAD" --name-only --diff-filter=ACMR 2>/dev/null || true
            ;;
        commit-range=*)
            local range="${scope#commit-range=}"
            git diff "$range" --name-only --diff-filter=ACMR 2>/dev/null || true
            ;;
        *)
            echo "Invalid git scope: $scope. Valid options: staged, unstaged, all-changes, last-commit, branch, commit-range=<range>" >&2
            return 1
            ;;
    esac
}

# Validate that we're in a git repository
validate_git_repo() {
    if ! git rev-parse --git-dir >/dev/null 2>&1; then
        echo "Error: Not a git repository. Git-focused commands require a git repository." >&2
        return 1
    fi
    return 0
}

# Get git statistics for a scope
get_git_stats() {
    local scope="$1"
    local files=$(get_git_files "$scope")
    local count=$(echo "$files" | grep -c . 2>/dev/null || echo "0")
    
    echo "## Git Scope: $scope"
    echo "Files in scope: $count"
    
    if [[ "$count" -gt 0 && "$scope" != "staged" && "$scope" != "unstaged" ]]; then
        echo ""
        echo "### Change Summary"
        case "$scope" in
            "last-commit")
                git diff --stat HEAD~1..HEAD 2>/dev/null || true
                ;;
            "branch")
                local base_branch=$(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null || echo "HEAD~1")
                git diff --stat "$base_branch..HEAD" 2>/dev/null || true
                ;;
            "all-changes")
                git diff --stat HEAD 2>/dev/null || true
                ;;
            commit-range=*)
                local range="${scope#commit-range=}"
                git diff --stat "$range" 2>/dev/null || true
                ;;
        esac
        echo ""
    fi
}

# Filter files by pattern
filter_files_by_pattern() {
    local files="$1"
    local pattern="$2"
    
    if [[ -n "$pattern" ]]; then
        echo "$files" | grep -E "$pattern" 2>/dev/null || true
    else
        echo "$files"
    fi
}

# Standard git-scope processing for commands
# Usage: process_git_scope "$git_scope" "$file_pattern"
process_git_scope() {
    local git_scope="$1"
    local file_pattern="$2"
    
    # Validate git repository
    validate_git_repo || exit 1
    
    # Get target files from git scope
    local target_files=$(get_git_files "$git_scope")
    if [[ -z "$target_files" ]]; then
        echo "No files found in git scope: $git_scope"
        exit 0
    fi
    
    # Show git statistics
    get_git_stats "$git_scope"
    
    # Filter by file pattern if specified
    if [[ -n "$file_pattern" ]]; then
        target_files=$(filter_files_by_pattern "$target_files" "$file_pattern")
        if [[ -z "$target_files" ]]; then
            echo "No files match both git scope ($git_scope) and pattern ($file_pattern)"
            exit 0
        fi
    fi
    
    # Display file information
    echo "Processing files: $(echo "$target_files" | wc -l)"
    echo "$target_files" | head -10
    if [[ $(echo "$target_files" | wc -l) -gt 10 ]]; then
        echo "... and $(echo "$target_files" | wc -l | awk '{print $1-10}') more files"
    fi
    echo ""
    
    # Return the target files via stdout (caller can capture with $())
    echo "$target_files"
}