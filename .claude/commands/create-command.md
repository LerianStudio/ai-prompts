---
allowed-tools: Write(*), Read(*), LS(*)
description: Create a new custom command file with proper Anthropic slash command structure
---

# Create Custom Command

Create a new custom command file following official Anthropic slash command standards.

## Process

### 1. Gather Command Information

- Command name (kebab-case format)
- Brief description
- Required tools the command will use
- Expected arguments and hints

### 2. Determine Command Structure

Choose from common patterns:

1. **Analysis Command** - Examines code/files and provides insights
2. **Action Command** - Performs specific tasks or operations
3. **Generation Command** - Creates new files or content
4. **Workflow Command** - Multi-step process with decisions

### 3. Create Command File

Standard template structure:

````markdown
---
allowed-tools: Tool1(*), Tool2(*), Tool3(*)
description: Brief description of what this command does
argument-hint: [arg1] [arg2] (description of expected arguments)
model: claude-3-5-sonnet-20241022
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
/command-name example-argument
```
````

Expected output or behavior description.

```

### 4. Save and Validate
- Save to `.claude/commands/[command-name].md`
- Validate frontmatter syntax
- Test argument hint formatting
- Confirm tool permissions align with functionality
```
