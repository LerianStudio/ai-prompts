---
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Glob(*), Grep(*), LS(*), Bash(*)
description: Update existing commands to follow official Anthropic standards with proper organization
argument-hint: [--command-name=<name>] [--reorganize]
---

# Update Command

Updates existing custom command files to follow official Anthropic slash command standards with proper frontmatter, structure, and formatting. **Automatically organizes commands into appropriate subdirectories** - commands should never remain at the root level of `.claude/commands/`. **Can also detect and merge redundant commands** with similar functionality to reduce duplication.

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
     - `allowed-tools`: Specify tool permissions using compact format: `Read(*), Write(*), Edit(*)`
     - `description`: Brief command description (without quotes)
     - `argument-hint`: Expected parameters format using square brackets (without quotes)
     - `model`: Specific model if needed
   - Restructure content following official template
   - Ensure proper markdown formatting
   - **ENFORCE CONSISTENT FORMATTING**: Use compact single-line format for all frontmatter fields

4. **Organize and Validate**
   - **ALWAYS move commands from root to appropriate subdirectories**
   - **Detect and merge redundant commands** when using `--reorganize` flag
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
- **Consistent Formatting**: Enforces uniform frontmatter formatting across all commands
- **Command Deduplication**: **Detects and merges redundant commands with similar functionality**
- **Smart Merging**: Combines best features from duplicate commands into single optimized version

## Examples

```bash
# Update specific command (automatically moves to correct folder)
/update-command --command-name=fix-issue

# Update all commands (automatically organizes any root-level commands)
/update-command

# Explicitly reorganize and update all commands (includes merging duplicates)
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
   - **With --reorganize**: Identify commands with similar/overlapping functionality for merging

3. **Standards Application**
   - Apply official Anthropic frontmatter requirements with consistent formatting:
     - **Format**: `allowed-tools: Read(*), Glob(*), Grep(*)` (compact, single-line)
     - **Style**: No quotes around description and argument-hint values
     - **Consistency**: Match exact formatting pattern of existing commands
   - Ensure tool permissions match command functionality
   - Validate argument hints and descriptions
   - Preserve command intent and functionality

The command will analyze the current structure and apply the official Anthropic standards while preserving the original functionality. **CRITICAL**: All commands found at the root level of `.claude/commands/` will be automatically moved to appropriate subdirectories - no commands should ever remain at the root level for better organization and discoverability.

## Command Deduplication Process

When using the `--reorganize` flag, the tool performs intelligent duplicate detection and merging:

### Detection Criteria

Commands are considered similar/redundant when they have:

- **Similar descriptions**: Semantic similarity in purpose and functionality
- **Overlapping functionality**: Addressing the same problem domain or use case
- **Redundant workflows**: Same or very similar step-by-step processes
- **Same target outcomes**: Producing equivalent results or deliverables

### Merging Strategy

1. **Analysis**: Compare command descriptions, content, and functionality
2. **Best Feature Selection**: Identify unique valuable features from each command
3. **Content Integration**: Merge complementary sections and eliminate redundancy
4. **Tool Permissions**: Combine and optimize allowed-tools for merged functionality
5. **Argument Handling**: Create unified argument-hint covering all use cases
6. **Cleanup**: Remove redundant command files after successful merge

### Merge Examples

```bash
# Before: security-audit.md + security-scan.md (redundant security analysis)
# After: Single security-scan.md with comprehensive analysis + remediation

# Before: code-review.md + code-improve.md (overlapping code quality)
# After: Enhanced code-review.md with improvement capabilities

# Before: fix-issue.md + debug-error.md (similar problem-solving)
# After: Unified fix-problem.md covering all debugging scenarios
```

## Formatting Standards

**Required Frontmatter Format:**

```yaml
---
allowed-tools: Read(*), Glob(*), Grep(*), Edit(*), MultiEdit(*)
description: Brief command description without quotes
argument-hint: [parameter-format] without quotes
---
```

**Formatting Rules:**

- **allowed-tools**: Compact single-line format with tools separated by commas
- **description**: No quotes around the description text
- **argument-hint**: Square brackets for parameters, no quotes around the value
- **Consistency**: All commands must follow the exact same formatting pattern
