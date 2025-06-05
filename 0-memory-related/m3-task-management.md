## 🧠 Enhanced Reasoning Instructions

**IMPORTANT**: Use both Memory MCP and Sequential Thinking MCP for enhanced analysis:

### Memory MCP Integration
- Store findings, decisions, and patterns in memory for cross-session learning
- Reference previous analysis and build upon established knowledge
- Tag entries appropriately for organization and retrieval

### Sequential Thinking MCP Usage  
- Use `mcp__sequential-thinking__sequentialthinking` for complex analysis and reasoning
- Break down complex problems into systematic thinking steps
- Allow thoughts to evolve and build upon previous insights
- Question assumptions and explore alternative approaches
- Generate and verify solution hypotheses through structured reasoning

This approach enables deeper analysis, better pattern recognition, and more thorough problem-solving capabilities.

---

# Auto Task Management (Simplified)

**CORE RULE: Track every significant action with `memory_tasks`**

## Basic Workflow

### After Every Command
```
memory_tasks operation="todo_update" options='{"tool_name": "[tool_just_used]", "session_id": "[session]", "repository": "[repo]"}'
```

### Add New Tasks
```
memory_tasks operation="todo_write" options='{
  "todos": [
    {"id": "[unique_id]", "content": "[task_description]", "status": "pending", "priority": "high|medium|low"}
  ],
  "session_id": "[session]", "repository": "[repo]"
}'
```

### Complete Tasks
```
memory_tasks operation="todo_write" options='{
  "todos": [
    {"id": "[task_id]", "content": "[task_description]", "status": "completed", "priority": "[priority]"}
  ],
  "session_id": "[session]", "repository": "[repo]"
}'
```

## Mandatory Patterns

### Code Analysis
**After**: `grep`, `find`, `Read`, `Glob`
```
memory_tasks operation="todo_update" options='{"tool_name": "Read", "session_id": "[session]", "repository": "[repo]"}'
```

### Documentation  
**After**: `Write`, `Edit`, `MultiEdit`
```
memory_tasks operation="todo_update" options='{"tool_name": "Write", "session_id": "[session]", "repository": "[repo]"}'
```

### Quality Checks
**After**: `Bash` for linting, testing, building
```
memory_tasks operation="todo_update" options='{"tool_name": "Bash", "session_id": "[session]", "repository": "[repo]"}'
```

## Auto-Generate Tasks For

**High Priority**:
- Security vulnerabilities
- Production blockers
- Critical functionality gaps
- Data integrity issues

**Medium Priority**:
- Performance optimizations
- Code quality improvements
- Documentation updates
- Test coverage gaps

**Low Priority**:
- Code style consistency
- Non-critical refactoring
- Optional enhancements

## Session Management

```
# Start
memory_tasks operation="session_create" options='{"session_id": "[unique_session_id]", "repository": "[repo]"}'

# Work
memory_tasks operation="todo_update" options='{"tool_name": "[tool]", "session_id": "[session]", "repository": "[repo]"}'

# End
memory_tasks operation="workflow_analyze" options='{"session_id": "[session]", "repository": "[repo]"}'
memory_tasks operation="session_end" options='{"session_id": "[session]", "repository": "[repo]"}'
```

## Quick Example

```bash
# 1. Initialize
memory_tasks operation="session_create" options='{"session_id": "review-20241202", "repository": "github.com/org/repo"}'

# 2. After analysis
grep -r "TODO" src/
memory_tasks operation="todo_update" options='{"tool_name": "Bash", "session_id": "review-20241202", "repository": "github.com/org/repo"}'

# 3. Add discovered tasks
memory_tasks operation="todo_write" options='{
  "todos": [
    {"id": "auth-1", "content": "Implement user authentication", "status": "pending", "priority": "high"}
  ],
  "session_id": "review-20241202", "repository": "github.com/org/repo"
}'

# 4. Complete work
memory_tasks operation="todo_write" options='{
  "todos": [
    {"id": "auth-1", "content": "Implement user authentication", "status": "completed", "priority": "high"}
  ],
  "session_id": "review-20241202", "repository": "github.com/org/repo"
}'

# 5. End
memory_tasks operation="session_end" options='{"session_id": "review-20241202", "repository": "github.com/org/repo"}'
```

**Remember: Consistent, immediate task updates ensure maximum continuity across sessions.**