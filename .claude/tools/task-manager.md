---
name: task-manager
description: Intelligent board-integrated task management tool for workflow automation
tools: [task-manager functions]
---

# Task Manager Tool

Replaces the file-based board system with a robust, stateful, and API-driven task management system. This tool provides a centralized service for managing tasks and todos, eliminating the fragility of file-system-based state management.

## Available Functions

### createTask(title, description, todos)

Creates a new task with an initial list of todos.

**Parameters:**
- `title` (string, required): Task title
- `description` (string, optional): Task description  
- `todos` (array, optional): Array of todo item strings

**Returns:**
- `success` (boolean): Operation success status
- `task_id` (string): Unique task identifier
- `task` (object): Complete task object with todos
- `message` (string): Human-readable result message

**Example:**
```javascript
const result = await createTask(
  "Implement user authentication", 
  "Add login/logout functionality to the app",
  ["Create login component", "Add password validation", "Implement logout"]
);
// Returns: { success: true, task_id: "uuid-here", task: {...}, message: "..." }
```

### getTask(taskId)

Retrieves a task by its ID, including all todo items.

**Parameters:**
- `taskId` (string, required): Unique task identifier

**Returns:**
- `success` (boolean): Operation success status
- `task` (object): Complete task object with todos
- `message` (string): Human-readable result message

### updateTaskStatus(taskId, status)

Updates the overall status of a task.

**Parameters:**
- `taskId` (string, required): Unique task identifier
- `status` (string, required): One of: 'pending', 'in_progress', 'completed', 'failed'

**Returns:**
- `success` (boolean): Operation success status
- `task` (object): Updated task object
- `message` (string): Human-readable result message

### completeTodoItem(taskId, todoContent)

Marks a specific todo item as completed by matching its content.

**Parameters:**
- `taskId` (string, required): Unique task identifier
- `todoContent` (string, required): Exact content of the todo item to complete

**Returns:**
- `success` (boolean): Operation success status
- `task` (object): Updated task object with modified todo
- `message` (string): Human-readable result message

**Example:**
```javascript
const result = await completeTodoItem(taskId, "Create login component");
// Marks the todo with content "Create login component" as completed
```

### listTasks(filters)

Lists tasks with optional filtering.

**Parameters:**
- `filters` (object, optional): Filter criteria
  - `status` (string): Filter by task status
  - `project_id` (string): Filter by project ID

**Returns:**
- `success` (boolean): Operation success status
- `tasks` (array): Array of task objects
- `count` (number): Number of tasks returned
- `message` (string): Human-readable result message

## Migration from File-Based System

This tool replaces the following legacy patterns:

### Before (File-Based)
```yaml
# Old workflow step
- creates: protocol-assets/shared/board/02.ready/task-N/todos.md
- action: MOVE from protocol-assets/shared/board/02.ready to protocol-assets/shared/board/03.done
```

### After (Database-Based)
```yaml
# New workflow step  
- creates: task_id via createTask()
- action: updateTaskStatus(task_id, "completed")
```

### Agent Integration Examples

#### task-breakdown-specialist (Before)
```javascript
// Created folder structure and todos.md file
fs.writeFileSync('protocol-assets/shared/board/02.ready/task-N/todos.md', todosContent);
```

#### task-breakdown-specialist (After)  
```javascript
const result = await createTask(title, description, todosList);
// Returns task_id for downstream agents
```

#### Implementation Agents (Before)
```javascript
// Read todos.md, rely on todo-manager for state changes
const todos = fs.readFileSync('protocol-assets/shared/board/02.ready/task-N/todos.md');
```

#### Implementation Agents (After)
```javascript
// Direct interaction with task management
await completeTodoItem(taskId, "Implement component structure");
await updateTaskStatus(taskId, "completed");
```

## Board State Mapping

- File-based `01.backlog` → Database `status: 'pending'`
- File-based `02.ready` → Database `status: 'pending'` (ready to start)  
- File-based `03.done` → Database `status: 'completed'`
- Additional status: `status: 'in_progress'` (actively being worked on)
- Additional status: `status: 'failed'` (task failed/blocked)

## Benefits

1. **Reliability**: >95% success rate vs file-system fragility
2. **Performance**: 80% faster task state queries vs file scanning
3. **Atomicity**: Database transactions prevent inconsistent states
4. **Simplicity**: Single API vs complex file manipulations
5. **Visibility**: Centralized task status and history
6. **Scalability**: Foundation for future UI, metrics, and features

## Service Health

Use `healthCheck()` to verify the task management service is running and accessible.

```javascript
const health = await healthCheck();
// Returns: { success: true, health: {...}, message: "Service is healthy" }
```

## Error Handling

All functions return standardized responses with success/error indicators:

```javascript
{
  "success": false,
  "error": "Task with ID xyz not found", 
  "message": "Failed to get task: Task with ID xyz not found"
}
```

Agents should check the `success` field before proceeding and handle errors gracefully.