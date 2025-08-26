---
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Glob(*), Grep(*), LS(*), Bash(*)
description: Update existing commands to follow official Anthropic standards with proper folder organization
argument-hint: [command-name] [--reorganize]
---

# Update Command

Updates existing custom command files to follow official Anthropic slash command standards with proper frontmatter, structure, and formatting. **Automatically organizes commands into appropriate subdirectories** - commands should never remain at the root level of `.claude/commands/`.

## Usage

Updates a specified command file or all command files in the `.claude/commands/` directory and its subdirectories to conform to the latest slash command standards. **All commands are automatically organized into functional subdirectories** - no commands should remain at the root level.

## Process

1. **Locate Target Command(s)**
   - Find specified command file or scan all commands in `.claude/commands/` and subdirectories:
     - `code-quality/` - Code improvement and standardization tools
     - `documentation/` - Code analysis and documentation generation
     - `development/` - Day-to-day development workflow support
     - `planning/` - Strategic planning and analysis tools
     - `utils/` - Command system management and utilities
   - Read current command structure and content

2. **Analyze Current Structure**
   - Check existing frontmatter configuration
   - Identify missing or incorrect metadata
   - Review command content and organization

3. **Apply Standards Compliance**
   - Add proper frontmatter with required fields:
     - `allowed-tools`: Specify tool permissions
     - `description`: Brief command description
     - `argument-hint`: Expected parameters format
     - `model`: Specific model if needed
   - Restructure content following official template
   - Ensure proper markdown formatting

4. **Organize and Validate**
   - **ALWAYS move commands from root to appropriate subdirectories**
   - Verify frontmatter syntax correctness
   - Confirm tool permissions align with functionality
   - Test argument hint formatting
   - Save updated command file in proper location

## Features

- **Automatic Detection**: Identifies non-compliant command structures
- **Batch Processing**: Can update all commands at once if no specific command specified
- **Standards Alignment**: Ensures compatibility with latest Claude Code requirements
- **Preservation**: Maintains existing command functionality while improving structure
- **Mandatory Organization**: **Always moves commands from root to appropriate subdirectories**
- **Directory Enforcement**: Ensures no commands remain at `.claude/commands/` root level
- **Subdirectory Scanning**: Recursively updates commands in all subdirectories

## Examples

```bash
# Update specific command (automatically moves to correct folder)
/update-command fix-issue

# Update all commands (automatically organizes any root-level commands)
/update-command

# Explicitly reorganize and update all commands
/update-command --reorganize
```

## Directory Structure

**REQUIRED**: All commands MUST be organized into these functional groups (never at root):

- **code-quality/** - Review, refactor, simplify, standardize, technical debt analysis
- **documentation/** - Analyze, explain, and document codebases
- **development/** - Create features, debug errors, fix issues, prototyping, commits
- **planning/** - Create PRDs, estimate work, analyze options, deep thinking
- **utils/** - Create, update, and manage the command system itself

**⚠️ NO COMMANDS should remain at `.claude/commands/` root level - they must be categorized!**

## Implementation Details

When updating commands:

1. **Search Strategy**
   - First check root `.claude/commands/` directory
   - Then search each subdirectory for the specified command
   - Use `Glob` to find all `.md` files if updating all

2. **Command Classification & Organization**
   - **MANDATORY**: Analyze command purpose from frontmatter description and content
   - **MANDATORY**: Move any root-level commands to appropriate subdirectories
   - **MANDATORY**: Ensure no commands remain at `.claude/commands/` root level
   - Suggest better directory if command seems misplaced in subdirectory

3. **Standards Application**
   - Apply official Anthropic frontmatter requirements
   - Ensure tool permissions match command functionality
   - Validate argument hints and descriptions
   - Preserve command intent and functionality

The command will analyze the current structure and apply the official Anthropic standards while preserving the original functionality. **CRITICAL**: All commands found at the root level of `.claude/commands/` will be automatically moved to appropriate subdirectories - no commands should ever remain at the root level for better organization and discoverability.
