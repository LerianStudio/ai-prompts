---
allowed-tools: Write(*), Read(*), Glob(*)
description: Create a new custom command file with proper Anthropic slash command structure
argument-hint: <command-name> [description]
---

# Create Custom Slash Command

Create a new custom command file following official Anthropic slash command standards.

## Command Location

**Project commands**: `.claude/commands/shared/` (shared with team, shows "(project:shared)" in help)

## Command Structure

Commands are named after their filename (without `.md` extension). Subdirectories are for organization only and appear in the description as "(project:subdirectory)" but don't affect the command name.

### Frontmatter Options

| Field           | Purpose                     | Example                                         |
| --------------- | --------------------------- | ----------------------------------------------- |
| `allowed-tools` | Tools the command can use   | `Bash(git add:*), Write(*), Read(*)`            |
| `argument-hint` | User guidance for arguments | `[issue-number]` or `add [tag] \| remove [tag]` |
| `description`   | Brief command description   | `Create a git commit`                           |

### Command Features

**Arguments**: Use `$ARGUMENTS` placeholder for user input
**Bash execution**: Use exclamation prefix (requires Bash tool permission)
**File references**: Use `@` prefix to include file contents
**Namespacing**: Organize in subdirectories for better organization

## Template Examples

### Basic Command

```markdown
---
description: Analyze code for performance issues
argument-hint: [file-path]
---

Analyze the code at $ARGUMENTS for performance issues and suggest optimizations.
```

### Command with Bash Execution

```markdown
---
allowed-tools: Bash(git status:*), Bash(git diff:*)
description: Create a git commit
argument-hint: [commit-message]
---

## Context

- Current git status: !`git status`
- Current changes: !`git diff HEAD`

## Task

Create a commit with message: $ARGUMENTS
```

### Command with File References

```markdown
---
allowed-tools: Read(*), Write(*)
description: Compare two files
argument-hint: <file1> <file2>
---

Compare these files and highlight differences:

File 1: @$ARGUMENTS[0]
File 2: @$ARGUMENTS[1]
```

## Usage Examples

```bash
# Create basic optimization command
echo "Analyze this code for performance issues: @$ARGUMENTS" > .claude/commands/shared/optimize.md

# Create organized command in subdirectory
mkdir -p .claude/commands/shared/frontend
echo "Review React component: @$ARGUMENTS" > .claude/commands/shared/frontend/review-component.md

# Command becomes /review-component with description "(project:shared:frontend)"
```

## Validation Checklist

- [ ] Frontmatter syntax is valid YAML
- [ ] Tool permissions match command functionality
- [ ] Argument hint is clear and helpful
- [ ] File saved to `.claude/commands/shared/` directory
- [ ] Command name follows kebab-case convention

```

```
