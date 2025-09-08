---
allowed-tools: Write(*), Read(*), LS(*)
description: Create a new custom command file with proper Anthropic slash command structure
argument-hint: --name=<command-name> --description=<brief-description>
---

# /shared:utils:create-command

<instructions>
Create a new custom command file following official Anthropic slash command standards.
</instructions>

<context>
This command helps create properly structured slash commands with correct frontmatter, tool permissions, and documentation following official standards.
</context>

<process>

### 1. Gather Command Information

- Command name (kebab-case format) via --name flag
- Brief description for frontmatter via --description flag
- Required tools the command will use
- Expected arguments and hints
- Target scope (project vs personal)

### 2. Choose Command Features

**Arguments**: Use `$ARGUMENTS` placeholder for dynamic values
**Bash Execution**: Use ! prefix for bash commands (requires Bash tool permission)
**File References**: Use @ prefix to include file contents
**Namespacing**: Organize in subdirectories for better organization

### 3. Create Command File

Standard template with official frontmatter options:

````markdown
---
allowed-tools: Tool1(*), Tool2(*), Tool3(*)
description: Brief description of what this command does
argument-hint: --param=<required-param> [--optional=<optional-param>]
---

# Command Name

Brief description of what this command does.

## Usage

Explain how to use the command and what it accomplishes.

## Process

1. **Step One**
   - Description of what happens
   - Tools used and why

2. **Step Two**
   - Description of next action
   - Expected outputs

## Examples

```bash
/shared:utils:command-name --param=example-argument
```
````

Expected output or behavior description.

```

### 4. Save and Validate
- Save to `.claude/commands/[subdirectory]/[command-name].md`
- Validate frontmatter syntax
- Test argument hint formatting
- Confirm tool permissions align with functionality
</process>
```
