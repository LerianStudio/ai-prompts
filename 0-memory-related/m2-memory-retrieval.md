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

# Memory Context Retrieval (Simplified)

Quick retrieval of memory context, tasks, and patterns for current session.

## Core Retrieval

```
# Get repository status and context
memory_system status repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"

# Check tasks
memory_tasks todo_read session_id="current-session" repository="github.com/org/repo"
memory_tasks task_completion_stats repository="github.com/org/repo"
```

## Intelligence & Patterns

```
# Get insights
memory_intelligence auto_insights repository="github.com/org/repo" session_id="current-session"
memory_read get_patterns repository="github.com/org/repo"
memory_analyze health_dashboard repository="github.com/org/repo" session_id="current-session"

# Check data quality
memory_analyze detect_conflicts repository="github.com/org/repo" session_id="current-session"
memory_analyze check_freshness repository="github.com/org/repo" session_id="current-session"
```

## Cross-Repository Analysis

```
# Multi-repo insights
memory_analyze cross_repo_patterns session_id="current-session" repository="github.com/org/repo"
memory_analyze find_similar_repositories repository="github.com/org/repo" session_id="current-session"
```

## Output Format

**Priority Tasks:**
1. [High] Task description - Status
2. [Medium] Task description - Status

**Context Summary:**
- Repository status: [health/issues]
- Active sessions: [count]
- Pattern insights: [key findings]
- Cross-repo connections: [related projects]