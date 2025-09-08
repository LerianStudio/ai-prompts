---
allowed-tools: Read(*), Write(*), Edit(*), MultiEdit(*), Glob(*), Grep(*), LS(*), Task(*)
description: Update existing subagent files to follow official Anthropic standards
argument-hint: [--agent-name=<agent-name>] [--generate]
---

# /shared:utils:update-agent

<instructions>
Update existing Claude Code subagent files to follow official Anthropic subagent standards with proper YAML frontmatter, enhanced system prompts, and optimal tool configuration.

1. **Locate Target Subagent(s)** - Find specified agent file or scan all agents in `.claude/agents/`
2. **Structure Analysis** - Check existing frontmatter configuration and identify missing metadata
3. **System Prompt Enhancement** - Improve system prompt quality following best practices from official documentation
4. **Tool Permission Optimization** - Review and optimize tool access based on agent purpose
5. **Standards Compliance** - Apply official Anthropic frontmatter standards and validate syntax
6. **Generate Option** - Use Claude to regenerate agent with improved prompts when `--generate` flag is used
   </instructions>

<context>
**Subagent Requirements:**

- YAML frontmatter with `name`, `description`, and optional `tools` fields
- System prompt following best practices for specialized AI assistants
- Tool permissions aligned with agent purpose and security principles
- Proper file naming and location (`.claude/agents/` for project)

**Reference Documentation:**
Uses `/protocol-assets/context/anthropic/sub-agents.md` as the authoritative source for subagent standards and best practices.
</context>

<requirements>
- Must locate agent files in `.claude/agents/` directory
- Must preserve agent functionality while improving structure and prompt quality
- Must validate YAML frontmatter syntax and required fields
- Must optimize tool permissions based on agent purpose
- Must follow official Anthropic subagent documentation standards
- Must handle both individual agent updates and batch processing
- When using `--generate`, must leverage Claude to create enhanced system prompts
</requirements>

<example>
```bash
# Update specific agent
/shared:utils:update-agent --agent-name=code-reviewer

# Update all agents

/shared:utils:update-agent

# Regenerate agent with Claude enhancement

/shared:utils:update-agent --agent-name=test-runner --generate

```

**Expected Output:**

- Enhanced YAML frontmatter with proper field formatting
- Improved system prompt with specific instructions and constraints
- Optimized tool permissions list
- Validation report of changes made
</example>

<process>
**Phase 1: Agent Discovery & Analysis**

1. **Locate Target Agent(s)**
   - Find specified agent file or scan project agent directory
   - Read current agent structure and content

2. **Structure Analysis**
   - Validate existing YAML frontmatter configuration
   - Check required fields: `name`, `description`
   - Review optional `tools` field and current tool permissions
   - Analyze system prompt quality and effectiveness

**Phase 2: Enhancement & Optimization**

3. **System Prompt Enhancement**
   - Improve prompt clarity and specificity
   - Add structured approach and best practices
   - Include specific constraints and guidelines
   - Follow patterns from official documentation examples

4. **Tool Permission Optimization**
   - Review current tool access against agent purpose
   - Apply principle of least privilege
   - Remove unnecessary tools, add missing essential tools
   - Validate tool names against available Claude Code tools

**Phase 3: Standards Compliance & Validation**

5. **Frontmatter Standardization**
   - Ensure proper YAML syntax and formatting
   - Validate required fields are present and correctly formatted
   - Optimize description field for automatic delegation
   - Add proactive usage hints when appropriate

6. **Final Validation & Save**
   - Validate YAML syntax and field completeness
   - Ensure system prompt follows best practices
   - Confirm tool permissions align with functionality
   - Save updated agent file in original location
   - Report changes and improvements made

**Optional: Claude Generation Mode**

- When `--generate` flag is used, leverage Claude to regenerate system prompt with enhanced quality
- Preserve agent identity and purpose while improving instruction clarity
- Apply advanced prompt engineering techniques for better performance
</process>
```
