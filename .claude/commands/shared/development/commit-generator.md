---
allowed-tools: Bash(*), Read(*), Grep(*), Write(*)
description: Generate conventional commit messages based on git changes and save as commit-message.txt
argument-hint: [--scope=<scope>] [--git-scope=<scope>] (optional scope for the commit and git changes to analyze)
---

# /shared:development:commit-generator

Analyzes current git changes and generates conventional commit messages following the Conventional Commits 1.0.0 specification, then saves them to `commit-message.txt` in the project root.

## Usage

This command examines your git staging area and working directory to suggest properly formatted conventional commit messages based on the changes detected.

```bash
# Git-focused commit message generation (recommended)
/shared:development:commit-generator --git-scope=staged              # Generate message for staged changes only
/shared:development:commit-generator --git-scope=all-changes         # Generate message for all changes (staged + unstaged)
/shared:development:commit-generator --git-scope=unstaged            # Generate message for unstaged changes only

# With custom commit scope
/shared:development:commit-generator --scope=api --git-scope=staged  # API scoped message for staged changes
/shared:development:commit-generator --scope=ui --git-scope=branch   # UI scoped message for branch changes

# Traditional usage (defaults to staged changes)
/shared:development:commit-generator
/shared:development:commit-generator --scope=api
```

**Arguments:**

- `--scope`: Optional commit scope (api, ui, docs, etc.) for the generated conventional commit message
- `--git-scope`: Git scope to analyze - staged|unstaged|all-changes|branch|last-commit|commit-range=<range> (defaults to 'staged')

## Initial Setup

### Git Scope Configuration

```bash
# Source git utilities
if ! source .claude/utils/git-utilities.sh; then
    echo "Error: Could not load git utilities. Please ensure git-utilities.sh exists." >&2
    exit 1
fi

# Set default git scope if not provided
git_scope="${git_scope:-staged}"

# Process git scope (this function handles validation, stats, and file listing)
target_files=$(process_git_scope "$git_scope")
```

**Git-Scope Commit Benefits:**

- **Precise Control**: Generate messages for specific change sets (staged, branch, etc.)
- **Flexible Workflow**: Support different commit strategies and workflows
- **Better Messages**: More accurate commit messages based on targeted change analysis
- **Staging Integration**: Generate messages for exactly what will be committed

## Process

1. **Git Scope Analysis** (Enhanced)
   - Uses `get_git_files()` to analyze files in specified scope
   - Analyzes targeted changes based on git-scope parameter
   - Provides context about the scope of changes being committed

2. **Change Classification**
   - Analyzes file patterns and change types
   - Determines appropriate commit type (feat, fix, docs, style, etc.)
   - Identifies potential breaking changes

3. **Message Generation**
   - Creates conventional commit message following the format:

     ```
     <type>[optional scope]: <description>

     [optional body]

     [optional footer(s)]
     ```

   - Saves the generated message to `commit-message.txt` in the project root
   - Provides multiple suggestions when appropriate
   - Includes guidance on breaking changes

## Supported Commit Types

Based on the Conventional Commits specification and Angular convention:

- **feat:** A new feature
- **fix:** A bug fix
- **docs:** Documentation only changes
- **style:** Changes that do not affect the meaning of the code
- **refactor:** A code change that neither fixes a bug nor adds a feature
- **perf:** A code change that improves performance
- **test:** Adding missing tests or correcting existing tests
- **build:** Changes that affect the build system or external dependencies
- **ci:** Changes to CI configuration files and scripts
- **chore:** Other changes that don't modify src or test files
- **revert:** Reverts a previous commit

## Examples

### Basic Feature Addition

```bash
/shared:development:commit-generator
```

**Output:**

```
feat: add user authentication system

- Implement JWT token validation
- Add login/logout endpoints
- Create user authentication system
```

### With Scope

```bash
/shared:development:commit-generator api
```

**Output:**

```
feat(api): add user authentication endpoints

- Implement /auth/login endpoint
- Add /auth/logout endpoint
- Include JWT token validation middleware
```

### Breaking Change

```
feat!: change user API response format

BREAKING CHANGE: user endpoint now returns user object instead of user array
```

## Notes

- If no changes are detected, the command will prompt you to stage changes first
- Multiple commit suggestions may be provided for complex changesets
- Breaking changes are detected and flagged
- The command respects conventional commit standards for consistent git history
- Generated commit messages are saved to `commit-message.txt` for easy copying or use with `git commit -F commit-message.txt`
  </requirements>
