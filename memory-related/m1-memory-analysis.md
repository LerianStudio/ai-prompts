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

# Memory Analysis & Intelligence (Simplified)

Deep analysis of stored memory, pattern detection, and insight generation.

## System Health Check

```
memory_system health
memory_system status repository="github.com/org/repo"
memory_analyze health_dashboard repository="github.com/org/repo" session_id="current-session"
```

## Pattern Detection

```
# Core pattern analysis
memory_read get_patterns repository="github.com/org/repo"
memory_create auto_detect_relationships repository="github.com/org/repo"
memory_analyze detect_threads repository="github.com/org/repo"

# Generate insights
memory_intelligence auto_insights repository="github.com/org/repo" session_id="current-session"
memory_intelligence pattern_prediction context="[current analysis context]" repository="github.com/org/repo" session_id="current-session"
```

## Quality Validation

```
# Check conflicts and data freshness
memory_analyze detect_conflicts repository="github.com/org/repo" session_id="current-session"
memory_analyze check_freshness repository="github.com/org/repo" session_id="current-session"

# Cross-repository analysis
memory_analyze cross_repo_patterns session_id="current-session" repository="github.com/org/repo"
memory_analyze find_similar_repositories repository="github.com/org/repo" session_id="current-session"
```

## Relationship Analysis

```
# Analyze connections
memory_read get_relationships chunk_id="[target_chunk_id]" repository="github.com/org/repo"
memory_read traverse_graph start_chunk_id="[start_chunk_id]" repository="github.com/org/repo"
```

## Output Format

**Memory Health:** [healthy/issues]
**Patterns Found:** [architectural/security/business patterns]  
**Conflicts:** [count and types]
**Freshness:** [up-to-date/stale percentage]
**Cross-Repo:** [related projects and shared patterns]
**Recommendations:** [actionable insights]