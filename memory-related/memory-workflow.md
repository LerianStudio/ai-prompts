# Memory Workflow Management

Complete workflow for memory session lifecycle and knowledge continuity.

## Session Lifecycle

### 1. Initialize Session
```
# Start new session
memory_tasks session_create session_id="[workflow-timestamp]" repository="github.com/org/repo"

# Load existing context
memory_get_context repository="github.com/org/repo"
memory_intelligence suggest_related current_context="[current work]" session_id="[workflow-timestamp]" repository="github.com/org/repo"
```

### 2. Active Work Phase
```
# Store findings during work
memory_store_chunk content="[findings]" session_id="[workflow-timestamp]" repository="github.com/org/repo" tags="[relevant-tags]"

# Store key decisions
memory_store_decision decision="[decision]" rationale="[rationale]" context="[context]" session_id="[workflow-timestamp]" repository="github.com/org/repo"

# Track task progress
memory_tasks todo_write todos="[tasks_array]" session_id="[workflow-timestamp]" repository="github.com/org/repo"
```

### 3. Session Completion
```
# Create documentation threads
memory_create create_thread name="[thread-name]" description="[description]" chunk_ids="[chunk_ids]" repository="github.com/org/repo"

# Analyze workflow performance
memory_tasks workflow_analyze session_id="[workflow-timestamp]" repository="github.com/org/repo"

# End session
memory_tasks session_end session_id="[workflow-timestamp]" repository="github.com/org/repo"
```

## Knowledge Continuity

### Export for Handoff
```
# Export project knowledge
memory_transfer export_project repository="github.com/org/repo" session_id="[workflow-timestamp]" format="json" limit="100"

# Generate citations for documentation
memory_system generate_citations query="[relevant-query]" chunk_ids="[chunk_ids]" repository="github.com/org/repo"
```

### Import Context
```
# Import external context
memory_transfer import_context data="[external_data]" repository="github.com/org/repo" session_id="[workflow-timestamp]"

# Resume incomplete work
memory_transfer continuity repository="github.com/org/repo"
```

## Quality Assurance

### Health Monitoring
```
# Check memory system health
memory_system health
memory_analyze health_dashboard repository="github.com/org/repo" session_id="[workflow-timestamp]"

# Validate data freshness
memory_analyze check_freshness repository="github.com/org/repo" session_id="[workflow-timestamp]"
```

### Pattern Analysis
```
# Detect emerging patterns
memory_intelligence auto_insights repository="github.com/org/repo" session_id="[workflow-timestamp]"

# Cross-repository learning
memory_analyze cross_repo_patterns session_id="[workflow-timestamp]" repository="github.com/org/repo"
```

## Standard Workflow Templates

### Architecture Analysis Workflow
1. Initialize ’ Load context ’ Component analysis ’ Pattern detection ’ Documentation ’ Session end

### Security Review Workflow  
1. Initialize ’ Vulnerability scan ’ Risk analysis ’ Remediation planning ’ Compliance export ’ Session end

### Development Workflow
1. Initialize ’ Feature planning ’ Implementation tracking ’ Quality checks ’ Knowledge transfer ’ Session end

### Documentation Workflow
1. Initialize ’ Content audit ’ Structure planning ’ Content creation ’ Citation generation ’ Session end

## Best Practices

- **Consistent Tagging**: Use standardized tags for easy retrieval
- **Regular Checkpoints**: Store findings at logical milestones
- **Thread Organization**: Group related work into threads
- **Cross-Reference**: Link related chunks and decisions
- **Quality Validation**: Mark refreshed data after validation
- **Pattern Learning**: Leverage auto-insights for continuous improvement