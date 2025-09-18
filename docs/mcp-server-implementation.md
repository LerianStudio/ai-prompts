# MCP Server Implementation

## Overview

This document details the implementation of a Model Context Protocol (MCP) server that enables Claude Code to manage tasks in our board application. The MCP server provides a standardized interface for AI agents to create, update, and execute tasks through well-defined tools.

## Architecture

### MCP Integration Flow

```
Claude Code CLI → MCP Protocol → Board MCP Server → Task API → Database
                                      ↓
                              WebSocket Updates → Frontend
```

### Core Components

1. **MCP Server**: Handles JSON-RPC protocol and tool routing
2. **Task Tools**: Implements task management operations
3. **Schema Validation**: Ensures proper input/output formats
4. **Real-time Updates**: Broadcasts changes via WebSocket

## MCP Tools Specification

### 1. list_tasks

Query tasks with optional filters

```json
{
  "name": "list_tasks",
  "description": "List tasks from the board with optional filtering",
  "inputSchema": {
    "type": "object",
    "properties": {
      "status": {
        "type": "string",
        "enum": ["pending", "in_progress", "completed", "failed"],
        "description": "Filter tasks by status"
      },
      "limit": {
        "type": "integer",
        "default": 50,
        "description": "Maximum number of tasks to return"
      }
    }
  }
}
```

### 2. create_task

Create a new task with todos

```json
{
  "name": "create_task",
  "description": "Create a new task in the board",
  "inputSchema": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "Task title"
      },
      "description": {
        "type": "string",
        "description": "Optional task description"
      },
      "todos": {
        "type": "array",
        "items": { "type": "string" },
        "description": "List of todo items"
      }
    },
    "required": ["title"]
  }
}
```

### 3. update_task

Update existing task properties

```json
{
  "name": "update_task",
  "description": "Update an existing task",
  "inputSchema": {
    "type": "object",
    "properties": {
      "taskId": {
        "type": "string",
        "description": "Task ID to update"
      },
      "title": { "type": "string" },
      "description": { "type": "string" },
      "status": {
        "type": "string",
        "enum": ["pending", "in_progress", "completed", "failed"]
      }
    },
    "required": ["taskId"]
  }
}
```

### 4. delete_task

Remove a task from the board

```json
{
  "name": "delete_task",
  "description": "Delete a task from the board",
  "inputSchema": {
    "type": "object",
    "properties": {
      "taskId": {
        "type": "string",
        "description": "Task ID to delete"
      }
    },
    "required": ["taskId"]
  }
}
```

### 5. start_task_execution

Execute a task with Claude Code

```json
{
  "name": "start_task_execution",
  "description": "Start executing a task with Claude Code",
  "inputSchema": {
    "type": "object",
    "properties": {
      "taskId": {
        "type": "string",
        "description": "Task ID to execute"
      },
      "prompt": {
        "type": "string",
        "description": "Optional custom prompt for execution"
      }
    },
    "required": ["taskId"]
  }
}
```

### 6. get_task_status

Check task execution status

```json
{
  "name": "get_task_status",
  "description": "Get current execution status of a task",
  "inputSchema": {
    "type": "object",
    "properties": {
      "taskId": {
        "type": "string",
        "description": "Task ID to check"
      }
    },
    "required": ["taskId"]
  }
}
```

## Implementation Structure

### MCP Server Entry Point

```javascript
// services/board-mcp/index.js
import { MCPServer } from './mcpServer.js'
import { TaskTools } from './tools/taskTools.js'

const server = new MCPServer()
server.registerTools(TaskTools)
server.start()
```

### Tool Implementation Pattern

```javascript
// services/board-mcp/tools/taskTools.js
export class TaskTools {
  static async list_tasks(params, context) {
    try {
      const { status, limit = 50 } = params
      const tasks = await context.taskService.listTasks({ status, limit })

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ success: true, tasks, count: tasks.length })
          }
        ]
      }
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error listing tasks: ${error.message}`
          }
        ]
      }
    }
  }

  static async create_task(params, context) {
    try {
      const { title, description, todos } = params
      const task = await context.taskService.createTask({
        title,
        description,
        todos
      })

      // Broadcast update via WebSocket
      context.broadcast('task_created', task)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: true,
              task_id: task.id,
              message: `Task "${title}" created successfully`
            })
          }
        ]
      }
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error creating task: ${error.message}`
          }
        ]
      }
    }
  }
}
```

## JSON-RPC Protocol Handling

### Request Processing

```javascript
class MCPServer {
  async handleToolCall(request) {
    const { method, params } = request

    // Validate tool exists
    if (!this.tools[method]) {
      return this.createErrorResponse(-32601, 'Method not found')
    }

    // Execute tool
    try {
      const result = await this.tools[method](params, this.context)
      return this.createSuccessResponse(result)
    } catch (error) {
      return this.createErrorResponse(-32603, error.message)
    }
  }

  createSuccessResponse(result) {
    return {
      jsonrpc: '2.0',
      result,
      id: this.currentRequestId
    }
  }

  createErrorResponse(code, message) {
    return {
      jsonrpc: '2.0',
      error: { code, message },
      id: this.currentRequestId
    }
  }
}
```

## Configuration

### MCP Discovery Configuration

```json
// .mcp.json
{
  "servers": {
    "board-tasks": {
      "command": "node",
      "args": ["services/board-mcp/index.js"],
      "env": {
        "BOARD_API_URL": "http://localhost:3001",
        "MCP_SERVER_PORT": "3002"
      }
    }
  }
}
```

### Environment Variables

- `BOARD_API_URL`: URL of the board API service
- `MCP_SERVER_PORT`: Port for MCP server to listen on
- `DB_CONNECTION_STRING`: Database connection string
- `WEBSOCKET_URL`: WebSocket server URL for real-time updates

## Error Handling

### Standard Error Codes

- `-32700`: Parse error
- `-32600`: Invalid Request
- `-32601`: Method not found
- `-32602`: Invalid params
- `-32603`: Internal error

### Custom Error Handling

```javascript
function handleTaskError(error, operation) {
  const errorMap = {
    NOT_FOUND: { code: -32602, message: 'Task not found' },
    VALIDATION_ERROR: { code: -32602, message: 'Invalid parameters' },
    EXECUTION_ERROR: { code: -32603, message: 'Task execution failed' }
  }

  const mappedError = errorMap[error.code] || {
    code: -32603,
    message: `${operation} failed: ${error.message}`
  }

  return mappedError
}
```

## Real-time Updates

### WebSocket Integration

```javascript
class MCPServer {
  constructor() {
    this.wsClients = new Set()
  }

  broadcast(event, data) {
    const message = JSON.stringify({ event, data, timestamp: Date.now() })
    this.wsClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message)
      }
    })
  }
}
```

## Testing Strategy

### Unit Tests

- Test each tool implementation
- Validate JSON schema compliance
- Test error handling paths

### Integration Tests

- End-to-end MCP protocol communication
- Task operations through MCP interface
- Real-time update propagation

### Load Tests

- Multiple concurrent MCP connections
- High-volume task operations
- WebSocket scalability

## Usage Examples

### Claude Code Integration

```bash
# Claude Code automatically discovers the MCP server
claude "Create a task to review the authentication module"

# Claude can then manage tasks through MCP
claude "Update task status to in_progress and add a todo for testing"
```

### Direct MCP Communication

```javascript
// For testing or custom integrations
const mcpClient = new MCPClient('http://localhost:3002')

const result = await mcpClient.call('create_task', {
  title: 'Implement user authentication',
  description: 'Add OAuth integration for user login',
  todos: ['Research OAuth providers', 'Implement login flow', 'Add tests']
})

console.log(result) // { success: true, task_id: "task_123", ... }
```

## Security Considerations

- Validate all input parameters against JSON schemas
- Implement rate limiting for MCP requests
- Sanitize task content to prevent injection attacks
- Use secure communication channels (HTTPS/WSS in production)
- Log all MCP operations for audit purposes

## Performance Optimization

- Cache frequently accessed tasks
- Use connection pooling for database operations
- Implement request batching for bulk operations
- Monitor and optimize JSON-RPC message size
- Use efficient WebSocket broadcasting
