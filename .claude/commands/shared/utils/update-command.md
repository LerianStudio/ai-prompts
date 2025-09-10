---
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Glob(*), Grep(*), LS(*), Bash(*)
description: Update existing commands to follow official Anthropic standards with proper organization
argument-hint: [--command-name=<name>] [--update]
---

# /shared:utils:update-command

<instructions>
Updates existing custom command files to follow official Anthropic slash command standards with proper frontmatter, structure, and formatting using XML-structured content organization.

<purpose>
- Standardize command files with proper frontmatter and XML structure
- Automatically organize commands into functional subdirectories
- Detect and merge redundant commands when using --update flag
- Ensure all commands follow consistent formatting and organization patterns
</purpose>

<scope>
Updates specified command file or all command files in `.claude/commands/` directory and subdirectories to conform to latest standards. Commands are automatically organized into functional subdirectories - no commands remain at root level.
</scope>
</instructions>

<context>
This command ensures all custom command files follow official Anthropic standards while organizing them into proper subdirectories for better discoverability and maintenance.
</context>

<process>
<phase name="discovery">
  <action>Find specified command file or scan all commands in `.claude/commands/` and subdirectories</action>
  <directories>
    - `code-quality/` - Code improvement and standardization tools
    - `documentation/` - Code analysis and documentation generation  
    - `development/` - Day-to-day development workflow support
    - `planning/` - Strategic planning and analysis tools
    - `utils/` - Command system management and utilities
  </directories>
  <output>Current command structure and content analysis</output>
</phase>

<phase name="analysis">
  <action>Analyze existing command structure and identify improvements</action>
  <checks>
    - Frontmatter configuration validation
    - Missing or incorrect metadata detection
    - Content organization review
    - XML structure assessment
  </checks>
</phase>

<phase name="standardization">
  <action>Apply official Anthropic standards with XML structure</action>
  <requirements>
    <frontmatter>
      - `allowed-tools`: Compact format `Read(*), Write(*), Edit(*)`
      - `description`: Brief command description (no quotes)
      - `argument-hint`: Parameter format with square brackets (no quotes)
      - `model`: Specific model if needed
    </frontmatter>
    <content>
      - XML-structured sections for clarity
      - Consistent markdown formatting
      - Proper tag nesting and organization
    </content>
  </requirements>
</phase>

<phase name="organization">
  <action>Organize and validate command placement</action>
  <tasks>
    - Move commands from root to appropriate subdirectories
    - Detect and merge redundant commands when using `--update` flag
    - Verify frontmatter syntax and tool permissions
    - Save updated command in proper location
  </tasks>
</phase>
</process>

<features>
<detection>
  <capability>Automatic identification of non-compliant command structures</capability>
  <capability>XML structure validation and enhancement recommendations</capability>
</detection>

<processing>
  <capability>Batch processing of all commands when no specific command specified</capability>
  <capability>Standards alignment ensuring latest Claude Code compatibility</capability>
  <capability>Preservation of existing functionality while improving structure</capability>
</processing>

<organization>
  <capability>Mandatory organization: Always moves commands from root to subdirectories</capability>
  <capability>Directory enforcement: No commands remain at `.claude/commands/` root level</capability>
  <capability>Recursive scanning and updating of all subdirectories</capability>
</organization>

<enhancement>
  <capability>Consistent XML-structured formatting across all commands</capability>
  <capability>Command deduplication: Detects and merges redundant functionality</capability>
  <capability>Smart merging: Combines best features into optimized single commands</capability>
</enhancement>
</features>

<examples>
<usage_scenarios>
  <scenario name="specific_command">
    <command>/shared:utils:update-command --command-name=fix-issue</command>
    <description>Update specific command with automatic organization</description>
    <result>Moves command to correct subdirectory with XML structure</result>
  </scenario>
  
  <scenario name="batch_update">
    <command>/shared:utils:update-command</command>
    <description>Update all commands with basic standardization</description>
    <result>All commands organized and XML-structured</result>
  </scenario>
  
  <scenario name="comprehensive_update">
    <command>/shared:utils:update-command --update</command>
    <description>Full update including deduplication and advanced features</description>
    <result>Optimized command structure with merged duplicates</result>
  </scenario>
</usage_scenarios>
</examples>

<directory_structure>
**REQUIRED**: All commands MUST be organized into these functional groups (never at root):

**Shared Commands** (cross-platform functionality):

- **shared/code-quality/** - Review, refactor, simplify, standardize, technical debt analysis
- **shared/documentation/** - Analyze, explain, and document codebases
- **shared/development/** - Create features, debug errors, fix issues, prototyping, commits
- **shared/planning/** - Create PRDs, estimate work, analyze options, deep thinking
- **shared/utils/** - Create, update, and manage the command system itself

**Platform-Specific Commands**:

- **frontend/** - Frontend-specific workflows, UI components, client-side tooling
- **backend/** - Backend-specific workflows, APIs, server-side operations

**⚠️ NO COMMANDS should remain at `.claude/commands/` root level - they must be categorized!**
</directory_structure>

<implementation>
When updating commands:

1. **Search Strategy**
   - First check root `.claude/commands/` directory
   - Then search each subdirectory for the specified command
   - Use `Glob` to find all `.md` files if updating all

2. **Command Classification & Organization**
   - **MANDATORY**: Analyze command purpose from frontmatter description and content
   - **MANDATORY**: Move any root-level commands to appropriate subdirectories
   - **MANDATORY**: Ensure no commands remain at `.claude/commands/` root level
   - **Organization Logic**:
     - Use `shared/` for cross-platform functionality (code-quality, documentation, development, planning, utils)
     - Use `frontend/` for frontend-specific workflows, UI components, client-side tooling
     - Use `backend/` for backend-specific workflows, APIs, server-side operations
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

The command will analyze the current structure and apply the official Anthropic standards while preserving the original functionality. **CRITICAL**: All commands found at the root level of `.claude/commands/` will be automatically moved to appropriate subdirectories using the shared/frontend/backend organization - no commands should ever remain at the root level for better organization and discoverability.
</implementation>

<deduplication>
<detection_strategy>
When using the `--update` flag, the tool performs intelligent duplicate detection and merging.

<criteria>
Commands are considered similar/redundant when they exhibit:
- <similarity>Semantic similarity in purpose and functionality descriptions</similarity>
- <overlap>Addressing the same problem domain or use case</overlap>
- <workflow>Same or very similar step-by-step processes</workflow>
- <outcome>Producing equivalent results or deliverables</outcome>
</criteria>
</detection_strategy>

<merging_process>
<analysis>Compare command descriptions, content, and functionality</analysis>
<selection>Identify unique valuable features from each command</selection>
<integration>Merge complementary sections and eliminate redundancy</integration>
<optimization>Combine and optimize allowed-tools for merged functionality</optimization>
<unification>Create unified argument-hint covering all use cases</unification>
<cleanup>Remove redundant command files after successful merge</cleanup>
</merging_process>

<merge_examples>
<example>
<before>security-audit.md + security-scan.md (redundant security analysis)</before>
<after>Single security-scan.md with comprehensive analysis + remediation</after>
</example>

<example>
  <before>code-review.md + code-improve.md (overlapping code quality)</before>
  <after>Enhanced code-review.md with improvement capabilities</after>
</example>

<example>
  <before>fix-issue.md + debug-error.md (similar problem-solving)</before>
  <after>Unified fix-problem.md covering all debugging scenarios</after>
</example>
</merge_examples>
</deduplication>

<formatting>
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

<xml_structure_guidelines>
<purpose>Use meaningful tag names that clearly indicate the content purpose</purpose>
<nesting>Nest tags hierarchically for structured content organization</nesting>
<consistency>Maintain consistent tag naming throughout command files</consistency>
<parseability>Structure content for easy extraction and processing</parseability>
</xml_structure_guidelines>
</formatting>
