# Lerian MCP Memory Server - Complete Operations Guide

This guide provides comprehensive documentation for all memory operations available in the Lerian MCP Memory Server. Each operation includes its purpose, required parameters, and practical examples.

## Table of Contents
1. [Core Concepts](#core-concepts)
2. [Memory Creation Operations](#memory-creation-operations)
3. [Memory Read/Search Operations](#memory-readsearch-operations)
4. [Memory Update Operations](#memory-update-operations)
5. [Memory Delete Operations](#memory-delete-operations)
6. [Memory Analysis Operations](#memory-analysis-operations)
7. [Memory Intelligence Operations](#memory-intelligence-operations)
8. [Memory Transfer Operations](#memory-transfer-operations)
9. [Memory System Operations](#memory-system-operations)
10. [Document Generation Operations](#document-generation-operations)

## Core Concepts

### Important Parameters
- **repository** (REQUIRED for ALL operations): Your project identifier. Use full repository URL like `github.com/user/repo` or `global` for cross-project knowledge.
- **session_id**: Groups related work together. Use the same session_id for memories that belong to the same conversation or work session.
- **chunk_id**: Unique identifier for a memory chunk, returned when storing content.

### Common Response Format
All operations return responses with success/error status and relevant data:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

---

## Memory Creation Operations

Tool: `memory_create`

### 1. Store Chunk (Save Conversation/Code)
**Purpose**: Save conversation snippets, code examples, or any text content for later retrieval.

**Required Parameters**:
- `operation`: "store_chunk"
- `options.repository`: Project identifier (e.g., "github.com/user/repo")
- `options.session_id`: Session identifier
- `options.content`: The actual content to remember

**Example**:
```json
{
  "operation": "store_chunk",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "auth-feature-2024",
    "content": "Fixed authentication bug by implementing JWT token refresh mechanism. The issue was that tokens were expiring without proper refresh logic."
  }
}
```

### 2. Store Decision
**Purpose**: Save architectural decisions with rationale for future reference.

**Required Parameters**:
- `operation`: "store_decision"
- `options.repository`: Project identifier
- `options.session_id`: Session identifier
- `options.decision`: The actual decision made
- `options.rationale`: Why this decision was made

**Example**:
```json
{
  "operation": "store_decision",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "architecture-session-2024",
    "decision": "Use PostgreSQL instead of MySQL for user data",
    "rationale": "PostgreSQL offers better JSON support, full-text search capabilities, and better performance for our complex queries. Team has more experience with PostgreSQL."
  }
}
```

### 3. Create Thread
**Purpose**: Group related memories together under a common theme.

**Required Parameters**:
- `operation`: "create_thread"
- `options.repository`: Project identifier
- `options.name`: Descriptive name for the thread
- `options.description`: What this thread is about
- `options.chunk_ids`: Array of memory chunk IDs to group

**Example**:
```json
{
  "operation": "create_thread",
  "options": {
    "repository": "github.com/user/myproject",
    "name": "Authentication Implementation",
    "description": "All memories related to implementing the authentication system including JWT, OAuth, and password reset",
    "chunk_ids": ["chunk-123", "chunk-456", "chunk-789"]
  }
}
```

### 4. Create Alias
**Purpose**: Create shortcuts to frequently accessed memories or concepts.

**Required Parameters**:
- `operation`: "create_alias"
- `options.repository`: Project identifier
- `options.alias_name`: Name of the alias
- `options.target_id`: ID of the memory to alias

**Example**:
```json
{
  "operation": "create_alias",
  "options": {
    "repository": "github.com/user/myproject",
    "alias_name": "auth-best-practices",
    "target": "chunk-123"
  }
}
```

### 5. Create Relationship
**Purpose**: Link two memories with a specific relationship type.

**Required Parameters**:
- `operation`: "create_relationship"
- `options.repository`: Project identifier
- `options.source_chunk_id`: ID of the first memory
- `options.target_chunk_id`: ID of the second memory
- `options.relation_type`: Type of connection

**Relation Types**: "depends_on", "follows_from", "contradicts", "supports", "implements"

**Example**:
```json
{
  "operation": "create_relationship",
  "options": {
    "repository": "github.com/user/myproject",
    "source_chunk_id": "chunk-123",
    "target_chunk_id": "chunk-456",
    "relation_type": "implements"
  }
}
```

### 6. Auto Detect Relationships
**Purpose**: Automatically detect and create relationships between memories.

**Required Parameters**:
- `operation`: "auto_detect_relationships"
- `options.repository`: Project identifier
- `options.session_id`: Session identifier

**Example**:
```json
{
  "operation": "auto_detect_relationships",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "current-session"
  }
}
```

### 7. Import Context
**Purpose**: Import external data into the memory system.

**Required Parameters**:
- `operation`: "import_context"
- `options.repository`: Project identifier
- `options.session_id`: Session identifier
- `options.data`: The external data to import

**Example**:
```json
{
  "operation": "import_context",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "import-session",
    "data": "External documentation or data to import into memory system"
  }
}
```

### 8. Bulk Import
**Purpose**: Import multiple items at once for efficiency.

**Required Parameters**:
- `operation`: "bulk_import"
- `options.repository`: Project identifier
- `options.items`: Array of items to import

**Example**:
```json
{
  "operation": "bulk_import",
  "options": {
    "repository": "github.com/user/myproject",
    "items": [
      {"content": "First item", "type": "chunk"},
      {"content": "Second item", "type": "chunk"}
    ]
  }
}
```

---

## Memory Read/Search Operations

Tool: `memory_read`

### 1. Search
**Purpose**: Find memories by text search.

**Required Parameters**:
- `operation`: "search"
- `options.repository`: Project identifier
- `options.query`: What you're looking for

**Example**:
```json
{
  "operation": "search",
  "options": {
    "repository": "github.com/user/myproject",
    "query": "authentication bugs"
  }
}
```

### 2. Get Context
**Purpose**: Get project overview and context.

**Required Parameters**:
- `operation`: "get_context"
- `options.repository`: Project identifier

**Example**:
```json
{
  "operation": "get_context",
  "options": {
    "repository": "github.com/user/myproject"
  }
}
```

### 3. Find Similar
**Purpose**: Find memories about similar problems.

**Required Parameters**:
- `operation`: "find_similar"
- `options.repository`: Project identifier
- `options.problem`: Description of the problem

**Example**:
```json
{
  "operation": "find_similar",
  "options": {
    "repository": "github.com/user/myproject",
    "problem": "Users can't log in after password reset"
  }
}
```

### 4. Get Patterns
**Purpose**: Discover recurring themes and patterns.

**Required Parameters**:
- `operation`: "get_patterns"
- `options.repository`: Project identifier

**Example**:
```json
{
  "operation": "get_patterns",
  "options": {
    "repository": "github.com/user/myproject"
  }
}
```

### 5. Get Relationships
**Purpose**: Explore connections from a specific memory.

**Required Parameters**:
- `operation`: "get_relationships"
- `options.repository`: Project identifier
- `options.chunk_id`: ID of memory to explore from

**Example**:
```json
{
  "operation": "get_relationships",
  "options": {
    "repository": "github.com/user/myproject",
    "chunk_id": "chunk-123"
  }
}
```

### 6. Traverse Graph
**Purpose**: Navigate the knowledge graph from a starting point.

**Required Parameters**:
- `operation`: "traverse_graph"
- `options.repository`: Project identifier
- `options.start_chunk_id`: Starting point ID

**Example**:
```json
{
  "operation": "traverse_graph",
  "options": {
    "repository": "github.com/user/myproject",
    "start_chunk_id": "chunk-123"
  }
}
```

### 7. Get Threads
**Purpose**: Retrieve grouped memories.

**Required Parameters**:
- `operation`: "get_threads"
- `options.repository`: Project identifier

**Example**:
```json
{
  "operation": "get_threads",
  "options": {
    "repository": "github.com/user/myproject"
  }
}
```

### 8. Search Explained
**Purpose**: Search with detailed explanation of results.

**Required Parameters**:
- `operation`: "search_explained"
- `options.repository`: Project identifier
- `options.query`: Search query

**Example**:
```json
{
  "operation": "search_explained",
  "options": {
    "repository": "github.com/user/myproject",
    "query": "database optimization"
  }
}
```

### 9. Search Multi Repository
**Purpose**: Search across multiple projects.

**Required Parameters**:
- `operation`: "search_multi_repo"
- `options.repository`: "global" or specific repository
- `options.query`: Search query
- `options.session_id`: Current session

**Example**:
```json
{
  "operation": "search_multi_repo",
  "options": {
    "repository": "global",
    "query": "microservice patterns",
    "session_id": "current-session"
  }
}
```

### 10. Resolve Alias
**Purpose**: Look up an alias to get the actual memory.

**Required Parameters**:
- `operation`: "resolve_alias"
- `options.repository`: Project identifier
- `options.alias_name`: Name of the alias

**Example**:
```json
{
  "operation": "resolve_alias",
  "options": {
    "repository": "github.com/user/myproject",
    "alias_name": "auth-best-practices"
  }
}
```

### 11. List Aliases
**Purpose**: Get all available aliases.

**Required Parameters**:
- `operation`: "list_aliases"
- `options.repository`: Project identifier

**Example**:
```json
{
  "operation": "list_aliases",
  "options": {
    "repository": "github.com/user/myproject"
  }
}
```

### 12. Get Bulk Progress
**Purpose**: Check status of bulk operations.

**Required Parameters**:
- `operation`: "get_bulk_progress"
- `options.repository`: Project identifier
- `options.operation_id`: ID of bulk operation

**Example**:
```json
{
  "operation": "get_bulk_progress",
  "options": {
    "repository": "github.com/user/myproject",
    "operation_id": "bulk-op-123"
  }
}
```

---

## Memory Update Operations

Tool: `memory_update`

### 1. Update Thread
**Purpose**: Modify thread information.

**Required Parameters**:
- `operation`: "update_thread"
- `options.repository`: Project identifier
- `options.thread_id`: ID of thread to update
- `options.name`: New name (optional)
- `options.description`: New description (optional)

**Example**:
```json
{
  "operation": "update_thread",
  "options": {
    "repository": "github.com/user/myproject",
    "thread_id": "thread-123",
    "name": "Updated Authentication Implementation",
    "description": "Expanded to include OAuth2 implementation"
  }
}
```

### 2. Update Relationship
**Purpose**: Modify relationship between memories.

**Required Parameters**:
- `operation`: "update_relationship"
- `options.repository`: Project identifier
- `options.relationship_id`: ID of relationship
- `options.relation_type`: New relationship type

**Example**:
```json
{
  "operation": "update_relationship",
  "options": {
    "repository": "github.com/user/myproject",
    "relationship_id": "rel-123",
    "relation_type": "contradicts"
  }
}
```

### 3. Mark Refreshed
**Purpose**: Mark memory as validated/refreshed.

**Required Parameters**:
- `operation`: "mark_refreshed"
- `options.repository`: Project identifier
- `options.chunk_id`: ID of memory chunk
- `options.validation_notes`: Notes about validation

**Example**:
```json
{
  "operation": "mark_refreshed",
  "options": {
    "repository": "github.com/user/myproject",
    "chunk_id": "chunk-123",
    "validation_notes": "Verified this approach still works with latest framework version"
  }
}
```

### 4. Resolve Conflicts
**Purpose**: Resolve conflicting memories.

**Required Parameters**:
- `operation`: "resolve_conflicts"
- `options.repository`: Project identifier
- `options.conflict_ids`: Array of conflict IDs

**Example**:
```json
{
  "operation": "resolve_conflicts",
  "options": {
    "repository": "github.com/user/myproject",
    "conflict_ids": ["conflict-123", "conflict-456"]
  }
}
```

### 5. Bulk Update
**Purpose**: Update multiple memories at once.

**Required Parameters**:
- `operation`: "bulk_update"
- `options.repository`: Project identifier
- `options.chunks`: Array of chunks to update

**Example**:
```json
{
  "operation": "bulk_update",
  "options": {
    "repository": "github.com/user/myproject",
    "chunks": [
      {"id": "chunk-123", "content": "Updated content"},
      {"id": "chunk-456", "content": "Another update"}
    ]
  }
}
```

### 6. Decay Management
**Purpose**: Manage memory freshness and relevance.

**Required Parameters**:
- `operation`: "decay_management"
- `options.repository`: Project identifier
- `options.session_id`: Session identifier
- `options.action`: Decay action to perform

**Example**:
```json
{
  "operation": "decay_management",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "current-session",
    "action": "refresh_important"
  }
}
```

---

## Memory Delete Operations

Tool: `memory_delete`

### 1. Bulk Delete
**Purpose**: Delete multiple memories by ID.

**Required Parameters**:
- `operation`: "bulk_delete"
- `options.repository`: Project identifier
- `options.ids`: Array of IDs to delete

**Example**:
```json
{
  "operation": "bulk_delete",
  "options": {
    "repository": "github.com/user/myproject",
    "ids": ["chunk-123", "chunk-456", "chunk-789"]
  }
}
```

### 2. Delete Expired
**Purpose**: Remove expired/stale memories.

**Required Parameters**:
- `operation`: "delete_expired"
- `options.repository`: Project identifier

**Example**:
```json
{
  "operation": "delete_expired",
  "options": {
    "repository": "github.com/user/myproject"
  }
}
```

### 3. Delete by Filter
**Purpose**: Delete memories matching specific criteria.

**Required Parameters**:
- `operation`: "delete_by_filter"
- `options.repository`: Project identifier
- `options.filter`: Filter criteria

**Example**:
```json
{
  "operation": "delete_by_filter",
  "options": {
    "repository": "github.com/user/myproject",
    "filter": {
      "type": "decision",
      "older_than": "2023-01-01"
    }
  }
}
```

---

## Memory Analysis Operations

Tool: `memory_analyze`

### 1. Cross Repository Patterns
**Purpose**: Find patterns across projects.

**Required Parameters**:
- `operation`: "cross_repo_patterns"
- `options.repository`: Project identifier or "global"
- `options.session_id`: Session identifier

**Example**:
```json
{
  "operation": "cross_repo_patterns",
  "options": {
    "repository": "global",
    "session_id": "analysis-session"
  }
}
```

### 2. Find Similar Repositories
**Purpose**: Discover related projects.

**Required Parameters**:
- `operation`: "find_similar_repositories"
- `options.repository`: Project identifier
- `options.session_id`: Session identifier

**Example**:
```json
{
  "operation": "find_similar_repositories",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "discovery-session"
  }
}
```

### 3. Cross Repository Insights
**Purpose**: Get insights across projects.

**Required Parameters**:
- `operation`: "cross_repo_insights"
- `options.repository`: "global"

**Example**:
```json
{
  "operation": "cross_repo_insights",
  "options": {
    "repository": "global"
  }
}
```

### 4. Detect Conflicts
**Purpose**: Find contradictory decisions or information.

**Required Parameters**:
- `operation`: "detect_conflicts"
- `options.repository`: Project identifier

**Example**:
```json
{
  "operation": "detect_conflicts",
  "options": {
    "repository": "github.com/user/myproject"
  }
}
```

### 5. Health Dashboard
**Purpose**: Get system and project health insights.

**Required Parameters**:
- `operation`: "health_dashboard"
- `options.repository`: Project identifier
- `options.session_id`: Session identifier

**Example**:
```json
{
  "operation": "health_dashboard",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "health-check"
  }
}
```

### 6. Check Freshness
**Purpose**: Identify stale memories.

**Required Parameters**:
- `operation`: "check_freshness"
- `options.repository`: Project identifier

**Example**:
```json
{
  "operation": "check_freshness",
  "options": {
    "repository": "github.com/user/myproject"
  }
}
```

### 7. Detect Threads
**Purpose**: Auto-group related memories.

**Required Parameters**:
- `operation`: "detect_threads"
- `options.repository`: Project identifier

**Example**:
```json
{
  "operation": "detect_threads",
  "options": {
    "repository": "github.com/user/myproject"
  }
}
```

---

## Memory Intelligence Operations

Tool: `memory_intelligence`

### 1. Suggest Related
**Purpose**: Get AI suggestions for related content.

**Required Parameters**:
- `operation`: "suggest_related"
- `options.repository`: Project identifier
- `options.session_id`: Session identifier
- `options.current_context`: What you're working on

**Example**:
```json
{
  "operation": "suggest_related",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "current-session",
    "current_context": "Working on user authentication feature with OAuth2"
  }
}
```

### 2. Auto Insights
**Purpose**: Generate automatic insights from your data.

**Required Parameters**:
- `operation`: "auto_insights"
- `options.repository`: Project identifier
- `options.session_id`: Session identifier

**Example**:
```json
{
  "operation": "auto_insights",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "insight-session"
  }
}
```

### 3. Pattern Prediction
**Purpose**: AI predictions based on patterns.

**Required Parameters**:
- `operation`: "pattern_prediction"
- `options.repository`: Project identifier
- `options.session_id`: Session identifier
- `options.context`: Context for predictions

**Example**:
```json
{
  "operation": "pattern_prediction",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "prediction-session",
    "context": "Planning new microservice architecture for payment processing"
  }
}
```

---

## Memory Transfer Operations

Tool: `memory_transfer`

### 1. Export Project
**Purpose**: Export project memories with pagination support.

**Required Parameters**:
- `operation`: "export_project"
- `options.repository`: Project identifier
- `options.session_id`: Session identifier

**Optional Parameters**:
- `options.limit`: Page size (default: 100, max: 500)
- `options.offset`: Starting position (default: 0)
- `options.format`: "json", "markdown", or "archive" (default: "json")
- `options.include_vectors`: Include embeddings (default: false)

**Example**:
```json
{
  "operation": "export_project",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "export-session",
    "limit": 100,
    "offset": 0,
    "format": "json",
    "include_vectors": false
  }
}
```

### 2. Bulk Export
**Purpose**: Export multiple specific items.

**Required Parameters**:
- `operation`: "bulk_export"
- `options.repository`: Project identifier
- `options.ids`: Array of IDs to export

**Example**:
```json
{
  "operation": "bulk_export",
  "options": {
    "repository": "github.com/user/myproject",
    "ids": ["chunk-123", "chunk-456"]
  }
}
```

### 3. Continuity
**Purpose**: Ensure data continuity across sessions.

**Required Parameters**:
- `operation`: "continuity"
- `options.repository`: Project identifier

**Example**:
```json
{
  "operation": "continuity",
  "options": {
    "repository": "github.com/user/myproject"
  }
}
```

### 4. Import Context
**Purpose**: Import external data into memory.

**Required Parameters**:
- `operation`: "import_context"
- `options.repository`: Project identifier
- `options.session_id`: Session identifier
- `options.data`: Data to import

**Example**:
```json
{
  "operation": "import_context",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "import-session",
    "data": "External documentation or exported memory data"
  }
}
```

---

## Memory System Operations

Tool: `memory_system`

### 1. Health
**Purpose**: Check if system is working.

**Required Parameters**:
- `operation`: "health"

**Example**:
```json
{
  "operation": "health",
  "options": {}
}
```

### 2. Status
**Purpose**: Get project status report.

**Required Parameters**:
- `operation`: "status"
- `options.repository`: Project identifier

**Example**:
```json
{
  "operation": "status",
  "options": {
    "repository": "github.com/user/myproject"
  }
}
```

### 3. Generate Citations
**Purpose**: Create formatted citations for memories.

**Required Parameters**:
- `operation`: "generate_citations"
- `options.repository`: Project identifier
- `options.query`: Original query
- `options.chunk_ids`: Array of chunk IDs

**Example**:
```json
{
  "operation": "generate_citations",
  "options": {
    "repository": "github.com/user/myproject",
    "query": "authentication implementation",
    "chunk_ids": ["chunk-123", "chunk-456"]
  }
}
```

### 4. Create Inline Citation
**Purpose**: Create inline references.

**Required Parameters**:
- `operation`: "create_inline_citation"
- `options.repository`: Project identifier
- `options.text`: Text to cite
- `options.response_id`: Response identifier

**Example**:
```json
{
  "operation": "create_inline_citation",
  "options": {
    "repository": "github.com/user/myproject",
    "text": "JWT tokens should be refreshed every 15 minutes",
    "response_id": "response-123"
  }
}
```

### 5. Get Documentation
**Purpose**: Access system documentation.

**Required Parameters**:
- `operation`: "get_documentation"

**Example**:
```json
{
  "operation": "get_documentation",
  "options": {}
}
```

---

## Document Generation Operations

Tool: `document_generation`

### 1. Generate PRD
**Purpose**: Generate Product Requirements Document.

**Required Parameters**:
- `operation`: "generate_prd"
- `options.repository`: Project identifier
- `options.user_inputs`: Array of user input strings

**Optional Parameters**:
- `options.project_type`: "api", "web-app", "mobile", "library", "general"

**Example**:
```json
{
  "operation": "generate_prd",
  "options": {
    "repository": "github.com/user/myproject",
    "user_inputs": [
      "Build a real-time chat application",
      "Support multiple chat rooms",
      "Include file sharing capabilities"
    ],
    "project_type": "web-app"
  }
}
```

### 2. Generate TRD
**Purpose**: Generate Technical Requirements Document from PRD.

**Required Parameters**:
- `operation`: "generate_trd"
- `options.repository`: Project identifier
- `options.prd_content`: PRD content

**Example**:
```json
{
  "operation": "generate_trd",
  "options": {
    "repository": "github.com/user/myproject",
    "prd_content": "Product requirements document content..."
  }
}
```

### 3. Generate Main Tasks
**Purpose**: Generate main tasks from TRD.

**Required Parameters**:
- `operation`: "generate_main_tasks"
- `options.repository`: Project identifier
- `options.trd_content`: TRD content

**Example**:
```json
{
  "operation": "generate_main_tasks",
  "options": {
    "repository": "github.com/user/myproject",
    "trd_content": "Technical requirements document content..."
  }
}
```

### 4. Generate Sub Tasks
**Purpose**: Generate sub-tasks from main task.

**Required Parameters**:
- `operation`: "generate_sub_tasks"
- `options.repository`: Project identifier
- `options.main_task_content`: Main task content

**Example**:
```json
{
  "operation": "generate_sub_tasks",
  "options": {
    "repository": "github.com/user/myproject",
    "main_task_content": "Implement user authentication system"
  }
}
```

### 5. Start Session
**Purpose**: Start interactive document generation session.

**Required Parameters**:
- `operation`: "start_session"
- `options.repository`: Project identifier
- `options.doc_type`: "prd", "trd", or "tasks"

**Example**:
```json
{
  "operation": "start_session",
  "options": {
    "repository": "github.com/user/myproject",
    "doc_type": "prd"
  }
}
```

### 6. Continue Session
**Purpose**: Continue interactive session with user input.

**Required Parameters**:
- `operation`: "continue_session"
- `options.repository`: Project identifier
- `options.session_id`: Session ID from start_session
- `options.user_input`: User response

**Example**:
```json
{
  "operation": "continue_session",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "doc-session-123",
    "user_input": "Yes, include real-time notifications"
  }
}
```

### 7. End Session
**Purpose**: End interactive session and get final document.

**Required Parameters**:
- `operation`: "end_session"
- `options.repository`: Project identifier
- `options.session_id`: Session ID

**Example**:
```json
{
  "operation": "end_session",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "doc-session-123"
  }
}
```

---

## Best Practices

### 1. Always Include Repository
Every operation requires a repository identifier for multi-tenant isolation:
- Use full URLs: `github.com/user/repo`
- Use `global` for cross-project knowledge
- Never omit this parameter

### 2. Use Session IDs Consistently
Group related work with the same session_id:
- `auth-feature-2024` for authentication work
- `bug-fix-session-1` for bug fixing sessions
- `architecture-decisions` for design discussions

### 3. Handle Chunk IDs
Store chunk IDs returned from creation operations:
```json
{
  "success": true,
  "data": {
    "chunk_id": "chunk-abc123",
    "message": "Content stored successfully"
  }
}
```

### 4. Pagination for Large Exports
Use limit and offset for large data exports:
```json
{
  "operation": "export_project",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "export-session",
    "limit": 100,
    "offset": 0
  }
}
```

### 5. Error Handling
Always check for success status:
```json
{
  "success": false,
  "error": "Repository parameter is required",
  "message": "Please provide a valid repository identifier"
}
```

### 6. Relationship Types
Use appropriate relationship types:
- `depends_on`: One memory depends on another
- `follows_from`: Logical progression
- `contradicts`: Conflicting information
- `supports`: Supporting evidence
- `implements`: Implementation of a concept

### 7. Search Strategies
- Use `search` for keyword searches
- Use `find_similar` for problem-based searches
- Use `get_patterns` to discover trends
- Use `search_multi_repo` for cross-project insights

### 8. Memory Freshness
Regularly use these operations to maintain data quality:
- `check_freshness` to identify stale content
- `mark_refreshed` to validate current information
- `decay_management` to manage relevance
- `delete_expired` to clean up old data

## Common Workflows

### Storing and Retrieving Code Solutions
```json
// Store solution
{
  "operation": "store_chunk",
  "options": {
    "repository": "github.com/user/myproject",
    "session_id": "bug-fix-2024",
    "content": "Fixed memory leak in WebSocket handler by properly closing connections"
  }
}

// Later, find similar problems
{
  "operation": "find_similar",
  "options": {
    "repository": "github.com/user/myproject",
    "problem": "WebSocket connections not closing properly"
  }
}
```

### Building Knowledge Threads
```json
// Store related memories
// ... store multiple chunks ...

// Create thread
{
  "operation": "create_thread",
  "options": {
    "repository": "github.com/user/myproject",
    "name": "WebSocket Implementation",
    "description": "All memories related to WebSocket implementation and debugging",
    "chunk_ids": ["chunk-1", "chunk-2", "chunk-3"]
  }
}
```

### Cross-Project Learning
```json
// Search across all projects
{
  "operation": "search_multi_repo",
  "options": {
    "repository": "global",
    "query": "microservice communication patterns",
    "session_id": "research-session"
  }
}

// Find patterns
{
  "operation": "cross_repo_patterns",
  "options": {
    "repository": "global",
    "session_id": "pattern-analysis"
  }
}
```

## Troubleshooting

### Memory Not Found
- Verify the repository identifier is correct
- Check if the chunk_id exists
- Ensure you're searching in the right scope (single vs global)

### Operations Failing
- Always include required `repository` parameter
- Ensure `options` is a JSON object, not a string
- Check that all required parameters are present
- Verify API key is configured for AI operations

### Performance Issues
- Use pagination for large exports
- Batch operations with bulk import/export
- Use appropriate search scope (avoid global when not needed)

## Additional Resources

- [GitHub Repository](https://github.com/LerianStudio/lerian-mcp-memory)
- [MCP Protocol Documentation](https://modelcontextprotocol.io)
- [OpenAI API Documentation](https://platform.openai.com/docs)

---

This guide covers all available memory operations in the Lerian MCP Memory Server. Each operation is designed to work seamlessly with AI assistants through the Model Context Protocol, providing persistent memory and intelligent knowledge management capabilities.
