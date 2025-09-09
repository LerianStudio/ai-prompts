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
