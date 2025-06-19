# Memory MCP Integration Guide

## Overview
This guide provides the correct usage patterns for Memory MCP tools in the AI prompts repository.

## Tool Mapping

### 1. Storing Information

**Store general content (chunks):**
```
mcp__lerian-memory__memory_create
operation="store_chunk"
options={
  "content": "[content to store]",
  "repository": "github.com/[org]/[repo]",
  "session_id": "[current-session]"
}
```

**Store decisions:**
```
mcp__lerian-memory__memory_create
operation="store_decision"
options={
  "decision": "[decision made]",
  "rationale": "[why this decision]",
  "repository": "github.com/[org]/[repo]",
  "session_id": "[current-session]"
}
```

**Create threads to link related content:**
```
mcp__lerian-memory__memory_create
operation="create_thread"
options={
  "name": "[thread name]",
  "description": "[thread description]",
  "chunk_ids": ["[chunk-id-1]", "[chunk-id-2]"],
  "repository": "github.com/[org]/[repo]"
}
```

### 2. Retrieving Information

**Search for content:**
```
mcp__lerian-memory__memory_read
operation="search"
options={
  "query": "[search query]",
  "repository": "github.com/[org]/[repo]"
}
```

**Get project context:**
```
mcp__lerian-memory__memory_read
operation="get_context"
options={
  "repository": "github.com/[org]/[repo]"
}
```

**Find similar problems:**
```
mcp__lerian-memory__memory_read
operation="find_similar"
options={
  "problem": "[problem description]",
  "repository": "github.com/[org]/[repo]"
}
```

### 3. Task Management

**Create/update todos:**
```
mcp__lerian-memory__memory_tasks
operation="todo_write"
options={
  "todos": [
    {
      "content": "[task description]",
      "status": "pending|in_progress|completed",
      "priority": "high|medium|low",
      "id": "[task-id]"
    }
  ],
  "repository": "github.com/[org]/[repo]"
}
```

**Read todos:**
```
mcp__lerian-memory__memory_tasks
operation="todo_read"
options={
  "repository": "github.com/[org]/[repo]",
  "session_id": "[current-session]"  // Optional for session-specific tasks
}
```

### 4. Analysis & Intelligence

**Analyze patterns:**
```
mcp__lerian-memory__memory_analyze
operation="cross_repo_patterns"
options={
  "repository": "github.com/[org]/[repo]",
  "session_id": "[current-session]"
}
```

**Get AI suggestions:**
```
mcp__lerian-memory__memory_intelligence
operation="suggest_related"
options={
  "current_context": "[what you're working on]",
  "repository": "github.com/[org]/[repo]",
  "session_id": "[current-session]"
}
```

## Common Parameters

- **repository**: Always use full GitHub URL format: `"github.com/[org]/[repo]"`
- **session_id**: Use consistent session ID throughout a workflow
- **Tags**: Use descriptive tags like `["prd", "trd", "feature-name", "decision"]`

## Migration Examples

### Old Format → New Format

**Before:**
```
memory_store_chunk with initial request and context
```

**After:**
```
Use mcp__lerian-memory__memory_create with:
operation="store_chunk"
options={
  "content": "[initial request and context]",
  "repository": "github.com/[org]/[repo]",
  "session_id": "[current-session]"
}
```

**Before:**
```
memory_search for similar features
```

**After:**
```
Use mcp__lerian-memory__memory_read with:
operation="search"
options={
  "query": "similar features [feature-type]",
  "repository": "github.com/[org]/[repo]"
}
```

**Before:**
```
memory_tasks to track workflow
```

**After:**
```
Use mcp__lerian-memory__memory_tasks with:
operation="todo_write"
options={
  "todos": [{"content": "[task]", "status": "in_progress", "priority": "high"}],
  "repository": "github.com/[org]/[repo]"
}
```

## Best Practices

1. **Always include repository**: Every memory operation needs the repository parameter
2. **Use session_id consistently**: Maintain the same session_id throughout a workflow
3. **Store chunk IDs**: When using store_chunk or store_decision, capture the returned chunk_id for later use in create_thread
4. **Tag appropriately**: Use relevant tags to make content discoverable
5. **Link related content**: Use create_thread to connect PRD → TRD → Tasks → Sub-tasks

## Workflow Example

```
# Step 1: Store initial request
response = mcp__lerian-memory__memory_create(
  operation="store_chunk",
  options={
    "content": "User wants feature X",
    "repository": "github.com/myorg/myrepo",
    "session_id": "feature-x-dev"
  }
)
chunk_id_1 = response.chunk_id

# Step 2: Search for similar features
mcp__lerian-memory__memory_read(
  operation="search",
  options={
    "query": "similar feature implementations",
    "repository": "github.com/myorg/myrepo"
  }
)

# Step 3: Store decision
response = mcp__lerian-memory__memory_create(
  operation="store_decision",
  options={
    "decision": "Use approach Y for feature X",
    "rationale": "Based on similar features and performance requirements",
    "repository": "github.com/myorg/myrepo",
    "session_id": "feature-x-dev"
  }
)
chunk_id_2 = response.chunk_id

# Step 4: Create thread to link everything
mcp__lerian-memory__memory_create(
  operation="create_thread",
  options={
    "name": "Feature X Development",
    "description": "Complete development cycle for Feature X",
    "chunk_ids": [chunk_id_1, chunk_id_2],
    "repository": "github.com/myorg/myrepo"
  }
)
```