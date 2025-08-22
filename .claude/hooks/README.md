# Claude Code Hooks Guide

This project uses Claude Code hooks to enhance the development workflow with automatic code quality checks, formatting, and notifications. Here's what each hook does and when it runs.

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

- **File Created** 📄 - When new files are written
- **File Modified** 📝 - When existing files are edited
- Shows file-specific icons based on extension

#### Command Completions:

- **Command Completed** ✅ - For important commands like `npm install`, `git`, `docker`
- **Command Failed** ❌ - When important commands fail (shown with critical urgency)

#### Subagent Tasks:

- **Subagent Task Started** 🤖 - When Claude launches a specialized subagent

### File type icons:

- 🐍 Python files (`.py`)
- 🟨 JavaScript (`.js`)
- 🔷 TypeScript (`.ts`)
- ⚛️ React files (`.jsx`, `.tsx`)
- 🌐 HTML files (`.html`)
- 🎨 CSS files (`.css`)
- 📋 JSON files (`.json`)
- 📝 Markdown (`.md`)
- 🐚 Shell scripts (`.sh`)
- 🗄️ SQL files (`.sql`)

### Example notifications:

```
File Created 🐍
Created: main.py

Command Completed ✅
Executed: npm install express

Subagent Task Started 🤖
Task: Search codebase for API endpoints
```

### Fallback behavior:

- If `notify-send` is not available, notifications are logged to `~/.claude/notifications.log`
- Works on Linux systems with desktop notification support

---

## 🔧 Configuration

All hooks are configured in `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/git-safety-hook.py"
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
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/prettier-hook.py"
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/eslint-hook.py"
          },
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/notification-hook.py"
          }
        ]
      },
      {
        "matcher": "Bash|Task",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/notification-hook.py"
          }
        ]
      }
    ]
  }
}
```

## 🎯 Benefits

- **Safety**: Prevents accidental destructive git operations
- **Quality**: Automatic code formatting and linting
- **Awareness**: Desktop notifications keep you informed of Claude's actions
- **Consistency**: Enforces code style across the project
- **Non-blocking**: Quality checks warn but don't prevent operations
- **Intelligent**: Skips irrelevant files and handles edge cases gracefully

## 🛠️ Maintenance

All hook scripts are executable and self-contained. They gracefully handle missing dependencies (Prettier, ESLint) by skipping operations rather than failing. This ensures Claude Code continues to work even if some tools aren't installed.
