# Claude Code Integration - Setup and Usage Guide

## 🚀 Quick Start (New Way)

### 1. Install Dependencies

```bash
# Install all dependencies (root + services)
npm install
```

### 2. Start Everything

```bash
# Start all services with smart port management
npm run dev
```

That's it! The system will:

- 🔍 Auto-discover free ports
- 📝 Generate environment configuration
- 🎯 Start API, MCP server, and frontend concurrently
- 🔗 Wait for dependencies between services
- 📊 Show color-coded logs from all services

---

## 🛠️ Manual Setup (Legacy)

### 1. Install Dependencies (Manual)

```bash
# Install root dependencies
npm install

# Install board-mcp dependencies
cd services/board-mcp && npm install && cd ../..

# Install board-api dependencies
cd services/board-api && npm install && cd ../..

# Install board-ui dependencies
cd services/board-ui && npm install && cd ../..
```

### 2. Database Setup

Run the migration to add Claude integration fields:

```bash
# Apply the Claude integration migration
psql -d lerian_protocol -f services/board-api/schemas/migrations/002_claude_integration.sql
```

### 3. Start Services (Manual)

```bash
# Legacy method - still works but not recommended
./scripts/start-claude-integration.sh

# Or start with log following
./scripts/start-claude-integration.sh --follow
```

## 🧪 Test Claude Code Integration

```bash
# Test basic connectivity
claude "List my tasks"

# Create a task via Claude Code
claude "Create a task to implement user authentication with todos: Research OAuth providers, Implement login flow, Add tests"

# Execute a task with Claude Code
claude "Start executing the authentication task"
```

## 📋 Available Commands

### Development Commands

```bash
npm run dev         # Start all services with smart ports
npm run dev:clean   # Clear ports and restart fresh
npm run health      # Check all services status
npm run ports       # Show current port allocation
npm run ports:clear # Clear saved ports
```

### Individual Service Commands

```bash
npm run dev:api     # Start only Board API
npm run dev:mcp     # Start only MCP Server
npm run dev:ui      # Start only Frontend
```

### Legacy Commands (still work)

```bash
./scripts/start-claude-integration.sh  # Manual startup
./scripts/stop-claude-integration.sh   # Manual shutdown
```

---

## 🏗️ Service Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐
│   Claude Code   │    │   MCP Server    │    │      Board API          │
│      CLI        │◄───┤   (Port 3002)   │◄───┤ (Port 3001) + Executor │
└─────────────────┘    └─────────────────┘    └─────────────────────────┘
                                                          │
                                                          │
                                                          ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │   Database      │    │   Frontend      │
                       │  (PostgreSQL)   │    │  (Port 3003)    │
                       └─────────────────┘    └─────────────────┘
                                ▲                       ▲
                                │                       │
                                └───────────────────────┘
```

### 🛠️ Smart Development Features

#### Port Management

- **Auto-discovery**: Finds free ports starting from 3001
- **Persistence**: Remembers ports between restarts in `.dev-ports.json`
- **Conflict resolution**: Automatically finds alternatives if ports are taken
- **Health checks**: Verifies services are running on assigned ports

#### Environment Configuration

- **Dynamic .env.dev**: Generated with current ports and URLs
- **Cross-service coordination**: Services know how to reach each other
- **Asset seeding**: Templates copied to `dev_assets/` for customization

## Available MCP Tools

When Claude Code is running, it has access to these task management tools:

### Task Management

- **list_tasks** - List tasks with optional filtering by status
- **create_task** - Create new tasks with title, description, and todos
- **update_task** - Update existing task properties
- **delete_task** - Remove tasks from the board

### Execution Management

- **start_task_execution** - Execute tasks using Claude Code
- **get_task_status** - Check execution progress and logs
- **complete_todo** - Mark individual todo items as completed

## Claude Code Usage Examples

### Creating Tasks

```bash
# Simple task creation
claude "Create a task titled 'Fix authentication bug'"

# Task with description and todos
claude "Create a task to implement user dashboard with description 'Build the main user dashboard with analytics' and todos: Design wireframes, Implement components, Add tests, Deploy to staging"

# Task with specific agent prompt
claude "Create a task for code review with a custom prompt to focus on security vulnerabilities"
```

### Managing Tasks

```bash
# List all tasks
claude "List my tasks"

# List only pending tasks
claude "Show me all pending tasks"

# List tasks with limit
claude "Show me the first 10 tasks"

# Update task status
claude "Update task [task-id] status to in_progress"

# Update task title
claude "Change the title of task [task-id] to 'Implement OAuth integration'"
```

### Task Execution

```bash
# Start execution with default prompt
claude "Execute task [task-id]"

# Execute with custom prompt
claude "Execute task [task-id] with prompt 'Focus on performance optimization and add comprehensive tests'"

# Check execution status
claude "What's the status of task [task-id]?"

# Send follow-up instructions
claude "For task [task-id], please also add error handling for edge cases"
```

### Todo Management

```bash
# Complete a specific todo
claude "Mark todo 'Design wireframes' as completed for task [task-id]"

# List task with todos
claude "Show me task [task-id] with all its todos"
```

## Frontend Integration

The frontend now includes a **Claude Execution Panel** in the task detail dialog:

### Features

- **Real-time execution logs** via WebSocket
- **Subscription status monitoring** with warnings
- **Session management** for conversation continuity
- **Custom prompt input** for executions and follow-ups
- **Visual execution progress** indicators

### Usage

1. Open any task in the kanban board
2. Scroll to the "AI Execution" section
3. Click "Execute with Claude" to start
4. Monitor real-time progress in the logs tab
5. Send follow-up prompts if needed

## Subscription Management

#### Subscription Detection

- ✅ **Managed Subscription**: Uses Claude Code's built-in authentication
- ⚠️ **Direct API Key**: Warns when `ANTHROPIC_API_KEY` is detected
- ❓ **Unknown Method**: Flags unrecognized authentication sources
- 📊 **Real-time warnings**: Displayed in UI and logs
- 🚀 **Integrated execution**: Directly into Board API for reduced latency

## Troubleshooting

### Services Won't Start

```bash
# Check if ports are in use
lsof -i :3001  # Board API
lsof -i :3002  # MCP Server

# View detailed startup logs
./scripts/start-claude-integration.sh --follow
```

### Claude Code Can't Find Tools

1. Verify `.mcp.json` configuration:

```bash
cat .mcp.json | grep -A 10 board-tasks
```

2. Test MCP server directly:

```bash
curl http://localhost:3002/health
```

3. Restart Claude Code:

```bash
claude logout && claude login
```

### Database Connection Issues

```bash
# Check database connection
psql -d lerian_protocol -c "SELECT COUNT(*) FROM tasks;"

# Apply missing migrations
psql -d lerian_protocol -f services/board-api/schemas/migrations/002_claude_integration.sql
```

### WebSocket Connection Problems

1. Check browser console for WebSocket errors
2. Verify Board API WebSocket endpoint
3. Restart services to refresh connections

## Configuration

### Environment Variables

Create a `.env` file with:

```bash
# API Configuration
BOARD_API_URL=http://localhost:3001
BOARD_API_PORT=3001

# MCP Configuration
MCP_SERVER_PORT=3002
MCP_HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lerian_protocol

# Development
NODE_ENV=development
LOG_LEVEL=info
```

### MCP Server Configuration

The `.mcp.json` file should include:

```json
{
  "mcpServers": {
    "board-tasks": {
      "command": "node",
      "args": ["services/board-mcp/src/index.js"],
      "env": {
        "BOARD_API_URL": "http://localhost:3001",
        "MCP_SERVER_PORT": "3002"
      }
    }
  }
}
```

## Development Tips

### Adding New MCP Tools

1. Add tool definition to `services/board-mcp/src/tools/taskTools.js`
2. Include JSON schema for validation
3. Implement the tool handler function
4. Test with Claude Code

### Debugging Claude Execution

1. Enable verbose logging in executor service
2. Monitor WebSocket messages in browser DevTools
3. Check task execution logs in database
4. Use MCP server health check endpoint

### Performance Optimization

- Use connection pooling for database operations
- Implement request batching for bulk operations
- Cache frequently accessed task data
- Monitor WebSocket connection counts

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review service logs: `./scripts/start-claude-integration.sh --follow`
3. Test individual components in isolation
4. Verify all dependencies are installed correctly

## Next Steps

Once the integration is working:

1. **Customize prompts** for your specific use cases
2. **Add more MCP tools** for enhanced functionality
3. **Implement task templates** for common workflows
4. **Set up monitoring** for production deployment
5. **Create custom Claude Code commands** for your team
