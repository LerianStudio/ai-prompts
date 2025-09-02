# Claude Code Hooks - Domain-Organized Automation

This directory contains Python automation hooks organized by development domain (frontend, backend, shared) to provide targeted workflow automation and quality assurance.

## Domain Organization

```
hooks/
├── frontend/           # Frontend-specific hooks
│   ├── prettier.py                 # Frontend code formatting  
│   ├── eslint.py                  # JavaScript/TypeScript linting
│   ├── auto-test.py               # Frontend test automation
│   └── dependency-monitor.py      # Frontend dependency tracking
├── shared/             # Cross-domain hooks
│   ├── backup.py                  # File backup automation
│   ├── git-safety.py             # Git operation protection
│   ├── notification.py           # Desktop notifications
│   └── context-monitor.py        # Development context monitoring
└── backend/            # Backend-specific hooks (structure ready)
    └── [Backend hooks to be added based on profile needs]
```

## Hook System Overview

The Lerian Protocol hook system provides domain-specific automation that enhances development workflows without being intrusive. Hooks run automatically based on development actions and provide intelligent feedback.

## 🛡️ Git Safety Hook

**File:** `git-safety-hook.py`  
**Triggers:** Before any Bash command that contains git operations  
**Purpose:** Prevents accidental destructive git operations

### What it blocks:

- `git add` - Staging files for commit
- `git commit` - Creating commits
- `git push` - Pushing changes to remote
- `git merge` - Merging branches
- `git rebase` - Rewriting commit history
- `git reset --hard` - Destructive resets
- `git rm` - Removing files from git
- Branch deletions, tag management, and other write operations

### What it allows:

- `git status` - Check repository status
- `git log` - View commit history
- `git diff` - See file differences
- `git show` - Display git objects
- `git branch` - List branches (without deletion flags)
- `git remote -v` - List remote repositories
- All other read-only git operations

### Example:

```bash
# ❌ Blocked
git add .
git commit -m "changes"
git push origin main

# ✅ Allowed
git status
git log --oneline
git diff HEAD~1
```

---

## ✨ Prettier Hook

**File:** `prettier-hook.py`  
**Triggers:** After writing or editing code files  
**Purpose:** Automatically formats code to maintain consistent style

### Supported file types:

- JavaScript (`.js`, `.jsx`)
- TypeScript (`.ts`, `.tsx`)
- JSON (`.json`)
- CSS/SCSS (`.css`, `.scss`, `.less`)
- HTML (`.html`, `.htm`)
- Markdown (`.md`, `.mdx`)
- YAML (`.yml`, `.yaml`)
- Vue (`.vue`)

### What it does:

1. Checks if the edited file has a supported extension
2. Skips files in `node_modules`, `dist`, `build`, and other ignore patterns
3. Runs Prettier to format the file in place
4. Shows a success message with ✨ icon
5. If formatting fails, shows a warning but doesn't block the operation

### Example output:

```
✨ Formatted App.tsx with Prettier
```

### Requirements:

- Prettier must be installed locally (`npm install prettier`) or globally
- Uses local version if available in `node_modules/.bin/prettier`

---

## 🔍 ESLint Hook

**File:** `eslint-hook.py`  
**Triggers:** After writing or editing JavaScript/TypeScript files  
**Purpose:** Catches code quality issues and potential bugs

### Supported file types:

- JavaScript (`.js`, `.jsx`, `.mjs`, `.cjs`)
- TypeScript (`.ts`, `.tsx`)

### What it does:

1. Runs ESLint on the modified file
2. Reports errors and warnings with line numbers
3. Shows the specific rule that was violated
4. Limits output to first 5 issues to avoid spam
5. Uses exit codes to indicate severity (errors vs warnings)

### Example output:

```bash
# Clean file
ESLint: utils.ts ✅

# File with warnings
ESLint: helper.js ⚠️ 2 warning(s)
  WARN 15:7 'unusedVar' is defined but never used (no-unused-vars)
  WARN 23:1 Missing semicolon (semi)

# File with errors
ESLint: broken.js ❌ 1 error(s), 1 warning(s)
  ERROR 8:15 'foo' is not defined (no-undef)
  WARN 12:4 'bar' is defined but never used (no-unused-vars)
```

### Requirements:

- ESLint must be installed locally (`npm install eslint`) or globally
- ESLint configuration file (`.eslintrc.js`, `.eslintrc.json`, etc.)
- Uses local version if available in `node_modules/.bin/eslint`

---

## 🔔 Notification Hook

**File:** `notification-hook.py`  
**Triggers:** After various operations complete  
**Purpose:** Provides desktop notifications for important events

### What triggers notifications:

#### File Operations:

- **File Created ◉** - When new files are written with Write tool
- **File Modified ◉** - When existing files are edited with Edit/MultiEdit tools
- Shows filename in notification message

#### Command Completions:

- **Command Completed ◉** - For important commands like `npm install`, `npm run`, `yarn`, `git`, `docker`, `pytest`, `jest`
- **Command Failed ◉** - When important commands fail (shown with critical urgency)
- Commands are truncated to 50 characters in notifications

#### Subagent Tasks:

- **Subagent Task Started ◉** - When Claude launches a specialized subagent via Task tool

### Example notifications:

```
File Created ◉
Created: main.py

Command Completed ◉
Executed: npm install express

Subagent Task Started ◉
Task: Search codebase for API endpoints

Command Failed ◉
Failed: npm run build
```

### Fallback behavior:

- If `notify-send` is not available, notifications are logged to `~/.claude/notifications.log`
- Works on Linux systems with desktop notification support

---

## 🔧 Profile-Based Configuration

Hooks are configured in `.claude/settings.json` based on the installation profile:

### Frontend Profile Configuration
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|MultiEdit",
        "hooks": [
          {
            "type": "command", 
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/shared/backup.py"
          }
        ]
      },
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/shared/git-safety.py"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/frontend/prettier.py"
          },
          {
            "type": "command", 
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/frontend/eslint.py"
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/frontend/auto-test.py"
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/shared/notification.py"
          }
        ]
      }
    ]
  }
}
```

### Domain-Specific Hook Paths
- **Frontend hooks** - `hooks/frontend/` for JavaScript/TypeScript projects
- **Backend hooks** - `hooks/backend/` for server-side automation  
- **Shared hooks** - `hooks/shared/` for universal development workflows

## 🎯 Benefits

- **Domain-Focused**: Hooks targeted to specific development areas (frontend, backend, shared)
- **Profile-Based**: Only relevant hooks installed based on project needs
- **Safety**: Prevents accidental destructive git operations across all domains
- **Quality**: Automatic code formatting and linting for domain-specific file types
- **Awareness**: Desktop notifications keep you informed of Claude's actions
- **Consistency**: Enforces code style standards within each domain
- **Non-blocking**: Quality checks warn but don't prevent operations
- **Intelligent**: Skips irrelevant files and handles edge cases gracefully

## 🔄 Profile Integration

The Lerian Protocol installer automatically configures hooks based on your chosen profile:

### Frontend Profile
- Installs frontend-specific hooks (prettier, eslint, auto-test)
- Configures hooks for JavaScript/TypeScript file processing
- Includes shared hooks for universal functionality

### Backend Profile  
- Will install backend-specific hooks (structure ready)
- Configure hooks for server-side file processing
- Includes shared hooks for universal functionality

### Full Profile
- Installs all available hooks from all domains
- Provides comprehensive automation coverage
- Supports mixed frontend/backend development

## 🛠️ Maintenance

All hook scripts are:
- **Executable and self-contained** - No external Python dependencies required
- **Graceful fallback** - Handle missing tools by skipping rather than failing
- **Domain-aware** - Process only relevant file types for their domain
- **Profile-compatible** - Work seamlessly with Lerian Protocol's installation system

This ensures Claude Code continues to work optimally even when some development tools aren't installed, while providing maximum automation where tools are available.
