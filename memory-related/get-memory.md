# Memory Context Retrieval

Retrieve and summarize memory context, tasks, and patterns for current session.

## Core Retrieval

```
# Get repository context and status
memory_system status repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"

# Check task status and workflow
memory_tasks todo_read session_id="current-session" repository="github.com/org/repo"
memory_tasks task_completion_stats repository="github.com/org/repo"
```

## Intelligence & Patterns

```
# Get insights and patterns
memory_intelligence auto_insights repository="github.com/org/repo" session_id="current-session"
memory_read get_patterns repository="github.com/org/repo"
memory_analyze health_dashboard repository="github.com/org/repo" session_id="current-session"

# Check for conflicts and freshness
memory_analyze detect_conflicts repository="github.com/org/repo" session_id="current-session"
memory_analyze check_freshness repository="github.com/org/repo" session_id="current-session"
```

## Cross-Repository Insights

```
# Multi-repo analysis
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
