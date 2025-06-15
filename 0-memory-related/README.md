# Memory Management System

Enhance cross-session learning and pattern recognition through effective memory management using the Memory Context Protocol (MCP).

## 🎯 Purpose

The Memory Management System provides persistent context and knowledge across development sessions, enabling:
- Pattern detection across projects
- Context preservation between sessions
- Knowledge base building
- Task tracking with memory integration
- Cross-repository intelligence

## 📚 Quick Start

Start with the orchestrator to understand the complete workflow:

```bash
claude 0-memory-related/m0-memory-orchestrator.md
```

## 📋 Available Prompts

| File | Purpose | When to Use |
|------|---------|-------------|
| `m0-memory-orchestrator.md` | **Orchestrator** - Workflow guidance | Start here to understand memory workflows |
| `m1-memory-analysis.md` | Pattern analysis & intelligence | Analyzing stored patterns, generating insights |
| `m2-memory-retrieval.md` | Context retrieval & search | Finding relevant past decisions, solutions |
| `m3-task-management.md` | Task tracking with memory | Managing todos with persistent context |
| `m4-memory-workflow.md` | Session lifecycle management | Storing new learnings, decisions |
| `m5-memory-maintenance.md` | System optimization & cleanup | Regular maintenance, health checks |

## 🔄 Common Workflows

### 1. Starting a New Project
```bash
# Check for existing patterns
claude 0-memory-related/m2-memory-retrieval.md
# Search: "authentication", "user management", similar features

# Analyze patterns from similar projects
claude 0-memory-related/m1-memory-analysis.md

# Set up memory-backed task tracking
claude 0-memory-related/m3-task-management.md
```

### 2. Debugging Complex Issues
```bash
# Search for similar problems and solutions
claude 0-memory-related/m2-memory-retrieval.md
# Tags: ["bug-fix", "error-type", "component-name"]

# Analyze what worked before
claude 0-memory-related/m1-memory-analysis.md
```

### 3. Storing Architecture Decisions
```bash
# Store important decision
claude 0-memory-related/m4-memory-workflow.md

# Example:
memory_store_decision 
  decision="Use PostgreSQL for main database"
  rationale="Need ACID compliance and complex queries"
  alternatives="Considered MongoDB but lacks transaction support"
  session_id="architecture-planning"
  repository="github.com/org/project"
```

### 4. Regular Maintenance
```bash
# Weekly health check
claude 0-memory-related/m5-memory-maintenance.md

# Check system status
memory_system health
memory_system status repository="github.com/org/repo"
```

## 🏷️ Tagging Strategy

Use consistent tags for better retrieval:

| Tag Category | Examples | Purpose |
|--------------|----------|---------|
| Architecture | `["architecture", "decision", "project-name"]` | Design decisions |
| Bug Fixes | `["bug-fix", "component", "error-type"]` | Problem solutions |
| Features | `["feature", "implementation", "technology"]` | Feature development |
| Learning | `["learning", "pattern", "anti-pattern"]` | Knowledge capture |
| Solutions | `["solution", "workaround", "temporary"]` | Problem resolution |

## 💡 Best Practices

### 1. Consistent Tagging
- Use standardized tag taxonomy
- Tag at appropriate granularity
- Include context tags (project, component, type)

### 2. Regular Maintenance
- Run health checks weekly
- Clean outdated entries monthly
- Optimize storage quarterly

### 3. Cross-Session Continuity
- Always check memory before starting work
- Store significant decisions immediately
- Link related memories with tags

### 4. Pattern Recognition
- Regularly analyze for patterns
- Document anti-patterns
- Share learnings across projects

## 🔗 Integration with Other Systems

### Pre-Development Planning
```bash
# Before creating PRD, search for similar features
claude 0-memory-related/m2-memory-retrieval.md

# After approval, store decisions
claude 0-memory-related/m4-memory-workflow.md
```

### Code Review
```bash
# Before review, check for patterns
claude 0-memory-related/m1-memory-analysis.md

# After review, store findings
claude 0-memory-related/m4-memory-workflow.md
```

## 📊 Key Memory Operations

### Storage Operations
```bash
# Store chunk of information
memory_store_chunk 
  content="Implementation details..."
  session_id="feature-dev"
  repository="github.com/org/repo"
  tags=["implementation", "feature-x"]

# Store decision
memory_store_decision
  decision="Use microservices architecture"
  rationale="Need independent scaling"
  context="High traffic expected"
```

### Retrieval Operations
```bash
# Search for patterns
memory_search "database decisions"
memory_find_similar "PostgreSQL implementation"

# Get patterns
memory_get_patterns
memory_analyze code_quality
```

### Task Management
```bash
# Create/update todos
memory_tasks todo_write todos=[...]
memory_tasks todo_read

# Session management
memory_tasks session_create session_id="dev-session"
memory_tasks session_end session_id="dev-session"
```

## 🚨 Troubleshooting

### Common Issues

1. **Memory Retrieval Failures**
   - Check tag spelling and consistency
   - Broaden search terms
   - Verify repository context

2. **Storage Capacity**
   - Run maintenance routine
   - Archive old entries
   - Optimize tag usage

3. **Pattern Detection**
   - Ensure sufficient data
   - Check tag relationships
   - Adjust analysis parameters

## 📈 Success Metrics

- **Storage Efficiency**: <80% capacity used
- **Retrieval Speed**: <100ms average
- **Tag Coverage**: >90% entries tagged
- **Pattern Detection**: Regular new patterns found

---

*Part of the AI Prompts for LerianStudio ecosystem - Building persistent knowledge for better development*