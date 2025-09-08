# Board MCP Server Documentation

## Overview

The Board MCP (Model Context Protocol) server provides database-backed task management functionality for the Lerian Protocol. It exposes 7 tools for creating, managing, and tracking development tasks through a RESTful API interface.

**Service URL:** `http://localhost:3020` (configurable via `TASK_SERVICE_URL`)

## Available Tools

### 1. createTask

Creates a new task with optional todo items.

**MCP Tool Call:**

```json
mcp__lerian-board__createTask {
  "title": "Implement User Authentication",
  "description": "Add login/logout functionality with session management",
  "todos": [
    "Create login form component",
    "Implement authentication service",
    "Add session management",
    "Write tests for auth flow"
  ]
}
```

**Schema:**

- `title`: string (required, 1-200 chars)
- `description`: string (optional, max 1000 chars)
- `todos`: string array (optional, max 50 items, 1-500 chars each)

**Response:**

```json
{
  "success": true,
  "task_id": "c073c77a-1446-4785-bd32-53da9e74d6b7",
  "task": {
    "id": "c073c77a-1446-4785-bd32-53da9e74d6b7",
    "title": "Implement User Authentication",
    "description": "Add login/logout functionality with session management",
    "status": "pending",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "todos": [
      {
        "id": "todo_456",
        "content": "Create login form component",
        "status": "pending"
      }
    ]
  },
  "message": "Created task \"Implement User Authentication\" with 4 todos"
}
```

### 2. getTask

Retrieves a specific task by ID.

**MCP Tool Call:**

```json
mcp__lerian-board__getTask {
  "taskId": "c073c77a-1446-4785-bd32-53da9e74d6b7"
}
```

**Schema:**

- `taskId`: string (required, pattern: `^[a-zA-Z0-9-_]+$`)

**Response:**

```json
{
  "success": true,
  "task": {
    "id": "c073c77a-1446-4785-bd32-53da9e74d6b7",
    "title": "Implement User Authentication",
    "description": "Add login/logout functionality with session management",
    "status": "in_progress",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T01:00:00Z",
    "todos": [...]
  },
  "message": "Retrieved task \"Implement User Authentication\" (in_progress)"
}
```

### 3. updateTaskStatus

Updates the status of an existing task.

**MCP Tool Call:**

```json
mcp__lerian-board__updateTaskStatus {
  "taskId": "c073c77a-1446-4785-bd32-53da9e74d6b7",
  "status": "in_progress"
}
```

**Schema:**

- `taskId`: string (required, pattern: `^[a-zA-Z0-9-_]+$`)
- `status`: string (required, enum: `[pending, in_progress, completed, failed]`)

**Response:**

```json
{
  "success": true,
  "task": {
    "id": "c073c77a-1446-4785-bd32-53da9e74d6b7",
    "title": "Implement User Authentication",
    "status": "in_progress",
    "updated_at": "2025-01-01T01:00:00Z"
  },
  "message": "Updated task \"Implement User Authentication\" status to \"in_progress\""
}
```

### 4. completeTodoItem

Marks a specific todo item as completed by matching content exactly.

**MCP Tool Call:**

```json
mcp__lerian-board__completeTodoItem {
  "taskId": "c073c77a-1446-4785-bd32-53da9e74d6b7",
  "todoContent": "Create login form component"
}
```

**Schema:**

- `taskId`: string (required, pattern: `^[a-zA-Z0-9-_]+$`)
- `todoContent`: string (required, 1-500 chars, exact match required)

**Response:**

```json
{
  "success": true,
  "task": {
    "id": "c073c77a-1446-4785-bd32-53da9e74d6b7",
    "title": "Implement User Authentication",
    "todos": [
      {
        "id": "todo_456",
        "content": "Create login form component",
        "status": "completed"
      }
    ]
  },
  "message": "Completed todo \"Create login form component\" for task \"Implement User Authentication\""
}
```

### 5. listTasks

Lists tasks with optional filtering.

**MCP Tool Call:**

```json
mcp__lerian-board__listTasks {
  "filters": {
    "status": "in_progress"
  }
}
```

**Schema:**

- `filters`: object (optional)
  - `status`: string (optional, enum: `[pending, in_progress, completed, failed]`)
  - `project_id`: string (optional, pattern: `^[a-zA-Z0-9-_]+$`)

**Response:**

```json
{
  "success": true,
  "tasks": [
    {
      "id": "c073c77a-1446-4785-bd32-53da9e74d6b7",
      "title": "Implement User Authentication",
      "status": "in_progress",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-01T01:00:00Z"
    }
  ],
  "count": 1,
  "filters": { "status": "in_progress" },
  "message": "Found 1 tasks"
}
```

### 6. deleteTask

Deletes a task by ID.

**MCP Tool Call:**

```json
mcp__lerian-board__deleteTask {
  "taskId": "c073c77a-1446-4785-bd32-53da9e74d6b7"
}
```

**Schema:**

- `taskId`: string (required, pattern: `^[a-zA-Z0-9-_]+$`)

**Response:**

```json
{
  "success": true,
  "task_id": "c073c77a-1446-4785-bd32-53da9e74d6b7",
  "message": "Deleted task \"Implement User Authentication\""
}
```

### 7. healthCheck

Checks the health status of the task management service.

**MCP Tool Call:**

```json
mcp__lerian-board__healthCheck {}
```

**Response:**

```json
{
  "success": true,
  "health": {
    "status": "healthy",
    "timestamp": "2025-01-01T00:00:00Z"
  },
  "status_code": 200,
  "message": "Service is healthy"
}
```

## Error Handling

All tools return structured error responses when operations fail:

```json
{
  "success": false,
  "error": "Task with ID invalid-id not found",
  "errorCode": -32003,
  "message": "Failed to get task: Task with ID invalid-id not found"
}
```

### Error Codes

- `-32601`: Unknown tool
- `-32602`: Invalid parameters
- `-32003`: Task not found
- `-32004`: Todo item not found
- `-32005`: Service unavailable
- `-32006`: Health check failed
- `-32007`: Delete operation failed

## Implementation Details

### Architecture

The Board MCP server follows a **client-server architecture**:

- **MCP Interface Layer** (`server.js`): Exposes tools via MCP protocol
- **HTTP Client Layer** (`board-tool.js`): Communicates with task service via REST API
- **Validation Layer**: Comprehensive input validation and sanitization
- **Error Handling**: Structured error responses with proper JSON-RPC formatting

### Security Features

- **Input Sanitization**: Removes HTML/XML characters and control characters
- **Rate Limiting**: 100 requests per minute per client
- **Parameter Validation**: JSON schema validation with strict type checking
- **URL Validation**: Only HTTP/HTTPS protocols allowed
- **Task ID Validation**: Pattern matching to prevent injection attacks
- **Error Sanitization**: No internal system details exposed in errors

### Validation Rules

#### Task IDs

- Pattern: `^[a-zA-Z0-9-_]+$`
- Max length: 50 characters
- Required for all operations except creation

#### Task Titles

- Min length: 1 character
- Max length: 200 characters
- Required for task creation
- HTML/XML characters stripped

#### Descriptions

- Max length: 1000 characters
- Optional field
- HTML/XML characters stripped

#### Todo Items

- Min length: 1 character per item
- Max length: 500 characters per item
- Maximum 50 todos per task
- Exact string matching required for completion

#### Status Values

- Valid values: `pending`, `in_progress`, `completed`, `failed`
- Enum validation enforced
- Case-sensitive matching

## Usage Examples

### Basic Task Workflow

```javascript
// Create a task
const createResult = await mcp.callTool('mcp__lerian-board__createTask', {
  title: 'Setup CI/CD Pipeline',
  description: 'Configure automated testing and deployment',
  todos: [
    'Configure GitHub Actions',
    'Setup staging environment',
    'Add deployment scripts',
    'Test pipeline'
  ]
})

// Start working on the task
await mcp.callTool('mcp__lerian-board__updateTaskStatus', {
  taskId: createResult.task_id,
  status: 'in_progress'
})

// Complete todos one by one
await mcp.callTool('mcp__lerian-board__completeTodoItem', {
  taskId: createResult.task_id,
  todoContent: 'Configure GitHub Actions'
})

// Check task progress
const task = await mcp.callTool('mcp__lerian-board__getTask', {
  taskId: createResult.task_id
})

// List all in-progress tasks
const activeTasks = await mcp.callTool('mcp__lerian-board__listTasks', {
  filters: { status: 'in_progress' }
})
```

### AI Agent Integration

```javascript
class TaskManager {
  constructor(mcpClient) {
    this.mcp = mcpClient
  }

  async createFeatureTask(featureName, requirements) {
    return await this.mcp.callTool('mcp__lerian-board__createTask', {
      title: `Feature: ${featureName}`,
      description: requirements.description,
      todos: requirements.tasks
    })
  }

  async trackProgress(taskId) {
    const response = await this.mcp.callTool('mcp__lerian-board__getTask', {
      taskId
    })

    if (!response.success) return response

    const task = response.task
    const completedTodos = task.todos.filter(
      (t) => t.status === 'completed'
    ).length
    const totalTodos = task.todos.length

    return {
      progress: totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0,
      completed: completedTodos,
      total: totalTodos,
      remaining: task.todos.filter((t) => t.status === 'pending')
    }
  }
}
```

### Batch Operations

```javascript
class BatchProcessor {
  async createMultipleTasks(taskList) {
    const results = await Promise.allSettled(
      taskList.map((task) =>
        mcp.callTool('mcp__lerian-board__createTask', task)
      )
    )

    const successful = results.filter((r) => r.status === 'fulfilled')
    const failed = results.filter((r) => r.status === 'rejected')

    return {
      successful: successful.length,
      failed: failed.length,
      results: results
    }
  }

  async bulkStatusUpdate(taskIds, newStatus) {
    const results = []
    for (const taskId of taskIds) {
      try {
        const result = await mcp.callTool(
          'mcp__lerian-board__updateTaskStatus',
          {
            taskId,
            status: newStatus
          }
        )
        results.push({ taskId, success: true, result })
      } catch (error) {
        results.push({ taskId, success: false, error: error.message })
      }
    }
    return results
  }
}
```

## Configuration

### Environment Variables

- `TASK_SERVICE_URL`: Service base URL (default: `http://localhost:3020`)

### Service Dependencies

- Task management service running on configured URL
- Database backend for persistent storage (SQLite/PostgreSQL)
- HTTP/HTTPS connectivity

## Best Practices

1. **Always check service health** before performing operations
2. **Use exact string matching** for `completeTodoItem` - content must match exactly
3. **Handle rate limiting** - max 100 requests per minute per client
4. **Validate responses** - check `success` field before using data
5. **Use appropriate status transitions** - `pending` → `in_progress` → `completed`
6. **Batch operations carefully** - add delays between large batches to avoid rate limits
7. **Cache frequently accessed tasks** to reduce API calls
8. **Monitor task consistency** - ensure todo completion matches task status
9. **Sanitize inputs** - the server handles basic sanitization but validate on client side
10. **Use meaningful task titles and descriptions** for better organization

## Troubleshooting

### Common Issues

**Service Unavailable (Error -32005)**

- Check if task service is running: `curl localhost:3020/health`
- Verify TASK_SERVICE_URL environment variable
- Check network connectivity

**Task Not Found (Error -32003)**

- Verify task ID format matches pattern `^[a-zA-Z0-9-_]+$`
- Check if task exists with `listTasks`
- Ensure task wasn't deleted

**Todo Item Not Found (Error -32004)**

- Verify exact string matching - content must match precisely
- Check todo still has `pending` status
- Use `getTask` to see current todo list

**Rate Limit Exceeded**

- Reduce request frequency to under 100/minute
- Implement exponential backoff for retries
- Cache frequently accessed data

**Invalid Parameters (Error -32602)**

- Validate all required fields are present
- Check string lengths against schema limits
- Ensure enum values match exactly

### Debugging Tips

- Use `healthCheck` to verify service connectivity
- Enable verbose logging to see HTTP requests/responses
- Test with simple operations first (healthCheck, listTasks)
- Verify task service logs for server-side errors
- Use browser developer tools to inspect network requests

## Migration from Legacy Board System

The Board MCP server replaces the file-based board system. Migration tools are available:

```bash
# Start task service
./protocol-assets/scripts/start-task-service.sh

# Run migration from legacy boards
node protocol-assets/lib/board-mcp/scripts/migrate-board-tasks.js

# Verify migration
curl localhost:3020/api/tasks | jq '.[] | {id, title, status}'
```

Legacy board stages map to task statuses:

- `01.backlog` → `pending`
- `02.ready` → `pending`
- `03.done` → `completed`

## Performance Considerations

- **HTTP Keep-Alive**: Client uses persistent connections for efficiency
- **Request Batching**: Group operations when possible to reduce round trips
- **Caching**: Cache frequently accessed tasks to reduce API calls
- **Pagination**: Use filters to limit result sets for large task lists
- **Concurrent Requests**: Rate limit is per-minute, allow concurrent operations within limits

## Future Enhancements

- [ ] Authentication and authorization support
- [ ] Task assignment and collaboration features
- [ ] Project-based task organization
- [ ] Task templates and workflows
- [ ] Search and advanced filtering
- [ ] Webhook notifications for task changes
- [ ] Bulk import/export functionality
- [ ] Task dependencies and scheduling
- [ ] Performance metrics and analytics
- [ ] Multi-tenant support

## Related Documentation

- [Task Management Service API](../task-service-api.md)
- [MCP Protocol Specification](https://modelcontextprotocol.io/docs)
- [Lerian Protocol Architecture](../architecture.md)
- [Development Workflows](../workflows.md)
