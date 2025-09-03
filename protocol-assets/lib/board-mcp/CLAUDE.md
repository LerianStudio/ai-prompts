# Directory: lib/board-mcp

## Purpose

`@lerian-protocol/board` is an MCP (Model Context Protocol) tool interface that provides database-backed task management functionality for the Lerian Protocol. It replaces the legacy file-based board system with a centralized task management service, enabling AI agents to create, track, and manage development tasks programmatically.

## Architecture Overview

The system follows a **client-server architecture** with clear separation of concerns:

- **MCP Interface Layer**: Exposes task management functions as MCP tools for AI agents
- **HTTP Client Layer**: Communicates with the task management service via RESTful API
- **Migration Layer**: Handles transition from file-based to database-backed workflows
- **Testing Layer**: Comprehensive integration and end-to-end testing

## Key Components

### index.js (MCP Entry Point)

- **Purpose**: Main MCP tool entry point with exported functions for AI agents
- **Dependencies**: board-tool.js, node-fetch
- **Used By**: AI agents through MCP protocol, CLI testing
- **Key Patterns**: Functional exports, input validation, CLI interface

**Core Functions**:
- `createTask(title, description, todos)` - Creates new tasks with todo lists
- `getTask(taskId)` - Retrieves task details by ID
- `updateTaskStatus(taskId, status)` - Updates task status (pending → in_progress → completed)
- `completeTodoItem(taskId, todoContent)` - Marks individual todos as completed
- `listTasks(filters)` - Lists tasks with optional filtering
- `healthCheck()` - Verifies service availability

### board-tool.js (Core API Client)

- **Purpose**: HTTP client wrapper for task management service API
- **Dependencies**: node-fetch
- **Used By**: index.js, migration scripts
- **Key Patterns**: Class-based architecture, async/await, comprehensive error handling

**TaskManagerTool Class**:
- Configurable base URL (defaults to localhost:3020)
- Consistent response format with success/error patterns
- Intelligent error handling for 404s and service failures
- Status validation for task updates

### migrate-board-tasks.js (Migration Utility)

- **Purpose**: Migrates file-based board tasks to database system
- **Dependencies**: fs, path, board-tool.js
- **Used By**: Migration scripts, project setup
- **Key Patterns**: Strategy pattern for different board stages, recursive directory parsing

**BoardTaskMigrator Class**:
- Reads legacy `protocol-assets/shared/board/` directories
- Parses markdown files (description.md, todos.md)
- Maps board stages to task statuses:
  - `01.backlog` → pending
  - `02.ready` → pending  
  - `03.done` → completed
- Generates comprehensive migration reports

## Design Patterns

- **MCP Tool Pattern**: Functions exported for AI agent consumption with standardized signatures
- **HTTP Client Wrapper**: Encapsulates REST API calls with consistent error handling
- **Migration Strategy**: Handles legacy system transition with rollback capabilities
- **Validation Layer**: Input validation with meaningful error messages
- **CLI Interface**: Dual-purpose modules that work as both libraries and CLI tools

## Dependencies

### External

- **node-fetch**: ^3.3.2 - HTTP client for API requests
- **Node.js**: >=18.0.0 - Runtime environment

### Internal

- Task Management Service (expected at localhost:3020)
- Legacy board system (protocol-assets/shared/board/)
- MCP protocol infrastructure

## Data Flow

1. **Task Creation**: AI agent → MCP function → HTTP client → Task service → Database
2. **Task Updates**: Agent → MCP → HTTP → Service → DB → Response chain
3. **Migration**: File system → Parser → HTTP client → Database
4. **Status Flow**: pending → in_progress → completed (auto-completion when all todos done)

## Configuration

- **Service URL**: Environment variable `TASK_SERVICE_URL` or default `http://localhost:3020`
- **Migration Paths**: Configurable board paths for migration scripts
- **Node.js Version**: Minimum 18.0.0 for ES modules and fetch support

## Testing Strategy

### Integration Tests (`tests/integration-test.js`)

- **Coverage**: Complete CRUD operations for tasks and todos
- **Scenarios**: Health check, task lifecycle, todo completion, listing/filtering
- **Assertions**: Success/failure validation, data integrity checks

### End-to-End Tests (`tests/workflow-end-to-end.js`)

- **Coverage**: Full workflow simulation from task creation to completion
- **Agent Simulation**: Mimics task-breakdown-specialist and frontend-developer workflows
- **Database Integrity**: Verifies data consistency and auto-completion logic

### Test Coverage

- Unit-level: Function validation and error handling
- Integration: API communication and service interaction  
- E2E: Complete workflow simulation with realistic data

## Common Tasks

### Adding a New MCP Function

1. Add function to `src/index.js` with proper validation
2. Implement corresponding method in `TaskManagerTool` class
3. Add test coverage in integration tests
4. Update this documentation

### Migrating Legacy Board Tasks

1. Ensure task service is running: `curl localhost:3020/health`
2. Run migration: `node lib/board-mcp/scripts/migrate-board-tasks.js [board-path] [service-url]`
3. Verify results: `curl localhost:3020/tasks`
4. Archive old board directories

### Testing the System

1. **Integration**: `npm test` or `node tests/integration-test.js`  
2. **End-to-End**: `node tests/workflow-end-to-end.js`
3. **CLI Testing**: `node src/index.js health`

## Gotchas and Tips

- ⚠️ **Service Dependency**: All operations require the task management service to be running
- ⚠️ **Todo Matching**: `completeTodoItem()` uses exact content matching - ensure consistent strings
- ⚠️ **Status Validation**: Only specific statuses allowed: pending, in_progress, completed, failed
- ⚠️ **Migration Idempotency**: Re-running migration may create duplicate tasks
- 💡 **Auto-Completion**: Tasks automatically complete when all todos are finished
- 💡 **CLI Interface**: All modules double as CLI tools for testing and debugging
- 💡 **Error Context**: API errors include both technical details and user-friendly messages
- 💡 **Filtering**: `listTasks()` supports status and project_id filters for organization

## Performance Considerations

- **HTTP Client**: Uses keep-alive connections for efficiency
- **Bulk Operations**: Consider batching for large migrations
- **Error Handling**: Graceful degradation when service unavailable
- **Memory Usage**: Streaming approach for large file migrations

## Security Considerations

- **Input Validation**: All user inputs validated before API calls
- **Service Authentication**: Ready for future auth token integration
- **Error Sanitization**: Error messages don't expose internal system details
- **Migration Safety**: Read-only operations during migration parsing

## Future Improvements

- [ ] Add authentication/authorization support
- [ ] Implement batch operations for bulk task management
- [ ] Add task assignment and collaboration features  
- [ ] Enhance filtering with search capabilities
- [ ] Add task templates and project organization
- [ ] Implement webhooks for workflow automation

## Related Documentation

- Task Management Service API documentation
- MCP Protocol specification
- Legacy Board System migration guide
- Workflow automation documentation

## Usage Examples

### Creating Tasks via MCP

```javascript
// Using the lerian-board MCP server tools

const result = await createTask(
  'Implement User Authentication',
  'Add login/logout functionality with session management',
  [
    'Create login form component',
    'Implement authentication service',
    'Add session management',
    'Write tests for auth flow'
  ]
);

if (result.success) {
  console.log(`Created task: ${result.task_id}`);
}
```

### Completing Development Workflows

```javascript
// Start task
await updateTaskStatus(taskId, 'in_progress');

// Complete todos incrementally
await completeTodoItem(taskId, 'Create login form component');
await completeTodoItem(taskId, 'Implement authentication service');
// ... task auto-completes when all todos done
```

### Migration from Legacy System

```bash
# Start task service
./scripts/start-task-service.sh

# Run migration
node lib/board-mcp/scripts/migrate-board-tasks.js protocol-assets/shared/board

# Verify migration
curl localhost:3020/tasks | jq '.[] | {id, title, status}'
```