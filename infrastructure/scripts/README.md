# MCP Stack Management Scripts

This directory contains orchestration scripts for managing the Lerian Protocol MCP Stack, which consists of:

- **Board Service** (`@lerian-protocol/board-service`) - Full-stack task management service
- **Board MCP Server** (`@lerian-protocol/board-mcp`) - MCP interface layer

## Quick Start

```bash
# Start the entire MCP stack
npm run mcp:start

# Start in development mode (foreground with watching)
npm run mcp:start:dev

# Check stack status
npm run mcp:status

# Stop the stack
npm run mcp:stop
```

## Scripts Overview

| Script                | Purpose                               | Usage                    |
| --------------------- | ------------------------------------- | ------------------------ |
| `start-mcp-stack.sh`  | Orchestrates startup of both services | Primary startup script   |
| `stop-mcp-stack.sh`   | Gracefully stops all services         | Primary shutdown script  |
| `mcp-stack-status.sh` | Shows comprehensive status            | Monitoring and debugging |

## Available Commands

### Startup Commands

```bash
# Background mode (default)
./scripts/start-mcp-stack.sh
npm run mcp:start

# Development mode (foreground with file watching)
./scripts/start-mcp-stack.sh --dev
npm run mcp:start:dev

# Production mode (background, no file watching)
./scripts/start-mcp-stack.sh --production
npm run mcp:start:prod
```

### Shutdown Commands

```bash
# Graceful shutdown
./scripts/stop-mcp-stack.sh
npm run mcp:stop

# Force shutdown (immediate termination)
./scripts/stop-mcp-stack.sh --force
npm run mcp:stop:force

# Interactive shutdown (choose which processes to stop)
./scripts/stop-mcp-stack.sh --interactive
```

### Status and Monitoring

```bash
# Detailed status report
./scripts/mcp-stack-status.sh
npm run mcp:status

# Brief status summary
./scripts/mcp-stack-status.sh --brief
npm run mcp:status:brief

# Watch mode (auto-refresh every 5s)
./scripts/mcp-stack-status.sh --watch
npm run mcp:status:watch

# Custom watch interval
./scripts/mcp-stack-status.sh --watch --interval 2
```

### Log Monitoring

```bash
# Service logs (live tail)
npm run mcp:logs:service
tail -f ./protocol-assets/infrastructure/data/logs/task-service.log

# MCP server logs (live tail)
npm run mcp:logs:mcp
tail -f ./protocol-assets/infrastructure/data/logs/board-mcp.log
```

## Configuration

### Environment Configuration (.env)

**The start script now automatically handles environment configuration:**

- **Automatic Setup**: Creates `.env` from `.env.example` if it doesn't exist
- **Path Synchronization**: Updates URLs and paths to match script configuration
- **Environment Loading**: Both scripts and services now read from `.env` files

### Configuration Sources (in priority order)

1. **Environment Variables** - Direct environment variables (highest priority)
2. **Service .env File** - `protocol-assets/lib/board-service/.env`
3. **Script Defaults** - Built-in fallback values (lowest priority)

### Configuration Variables

| Variable            | Default                                      | Description                            |
| ------------------- | -------------------------------------------- | -------------------------------------- |
| `PORT`              | 3020                                         | Board service HTTP port                |
| `SERVICE_PORT`      | 3020                                         | Board service HTTP port (script-level) |
| `MCP_PORT`          | 3021                                         | MCP server port                        |
| `HOST`              | localhost                                    | Host for services                      |
| `DB_PATH`           | `../../../data/databases/task-management.db` | SQLite database path                   |
| `VITE_WS_URL`       | `ws://localhost:3020`                        | WebSocket URL for React                |
| `VITE_API_BASE_URL` | `http://localhost:3020`                      | API base URL for React                 |
| `NODE_ENV`          | development                                  | Environment mode                       |

### Examples

**Using Environment Variables (temporary override):**

```bash
# Custom ports
SERVICE_PORT=3030 MCP_PORT=3031 ./scripts/start-mcp-stack.sh

# Custom database location
DB_PATH=/tmp/my-tasks.db ./scripts/start-mcp-stack.sh

# All services on different host
HOST=0.0.0.0 ./scripts/start-mcp-stack.sh --production

# Service-specific overrides
PORT=3030 ./scripts/start-task-service.sh
```

**Using .env File (persistent configuration):**

```bash
# Edit the environment file
echo "PORT=3030" >> protocol-assets/lib/board-service/.env
echo "HOST=0.0.0.0" >> protocol-assets/lib/board-service/.env
echo "VITE_WS_URL=ws://0.0.0.0:3030" >> protocol-assets/lib/board-service/.env

# Start with persistent config
./scripts/start-mcp-stack.sh
```

## Architecture

### Service Dependencies

```
Board MCP Server ──depends on──▶ Board Service ──depends on──▶ SQLite Database
     (Port 3021)                    (Port 3020)                (File system)
```

### Startup Sequence

1. **Prerequisites Check** - Verify Node.js, dependencies, directories
2. **Port Availability** - Ensure no conflicts on configured ports
3. **Board Service Start** - Launch Express server with SQLite
4. **Health Check** - Wait for `/health` endpoint to respond
5. **MCP Server Start** - Launch MCP server connected to board service
6. **Status Report** - Display running configuration and useful commands

### Process Management

- **PID Tracking**: Individual PID files for each service plus composite stack PID
- **Graceful Shutdown**: SIGTERM followed by SIGKILL if needed
- **Log Management**: Separate log files for each service
- **Health Monitoring**: HTTP-based health checks with retry logic

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
❌ Error: Port 3020 is already in use
   Use TASK_SERVICE_PORT to specify a different port
```

**Solution**: Use different ports or stop conflicting services

```bash
TASK_SERVICE_PORT=3030 ./scripts/start-mcp-stack.sh
```

#### Service Failed to Start

```bash
❌ Board service failed to start properly
```

**Solution**: Check logs and dependencies

```bash
npm run mcp:logs:service
cd protocol-assets/lib/board-service && npm install
```

#### Database Permission Issues

```bash
❌ Error: EACCES: permission denied, open '.../task-management.db'
```

**Solution**: Check directory permissions

```bash
mkdir -p protocol-assets/infrastructure/data/databases
chmod 755 protocol-assets/infrastructure/data/databases
```

#### MCP Server Connection Issues

```bash
❌ MCP server failed to connect to board service
```

**Solution**: Verify board service is healthy

```bash
curl http://localhost:3020/health
./scripts/mcp-stack-status.sh
```

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
# Add debug flag to scripts
set -x  # Add to script for bash debugging

# Check individual service health
curl -v http://localhost:3020/health
curl -v http://localhost:3020/api/tasks
```

### Clean Restart

If services get into a bad state:

```bash
# Force stop everything
./scripts/stop-mcp-stack.sh --force

# Clean PID files if needed
rm -f protocol-assets/infrastructure/data/pids/*

# Check no processes remain
ps aux | grep -E "(board-service|board-mcp)"

# Clean start
./scripts/start-mcp-stack.sh
```

## Development Workflow

### Typical Development Session

```bash
# Start in development mode (blocks terminal)
npm run mcp:start:dev

# In another terminal, monitor status
npm run mcp:status:watch

# Make changes to code - services auto-restart

# When done, Ctrl+C to stop everything
```

### Testing Changes

```bash
# Start services in background
npm run mcp:start

# Test API endpoints
curl http://localhost:3020/api/tasks
curl -X POST http://localhost:3020/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Testing"}'

# Check MCP integration
cd protocol-assets/lib/board-mcp
node src/index.js health

# Stop services
npm run mcp:stop
```

### Adding New Services

To extend the stack with additional services:

1. **Add service directory** to `protocol-assets/lib/`
2. **Update start script** to include new service in startup sequence
3. **Add health check** for the new service
4. **Update stop script** to handle new service shutdown
5. **Add status checks** to monitoring script
6. **Document configuration** and add npm scripts

## Files and Directories

```
protocol-assets/
├── scripts/
│   ├── start-mcp-stack.sh      # Main orchestration script
│   ├── stop-mcp-stack.sh       # Shutdown script
│   ├── mcp-stack-status.sh     # Status monitoring
│   └── README.md               # This file
├── data/
│   ├── pids/                   # Process ID files
│   │   ├── mcp-stack.pid       # Composite stack info
│   │   ├── task-service.pid    # Board service PID
│   │   └── board-mcp.pid       # MCP server PID
│   ├── logs/                   # Service logs
│   │   ├── task-service.log    # Board service logs
│   │   └── board-mcp.log       # MCP server logs
│   └── databases/              # SQLite databases
│       └── task-management.db  # Main task database
└── lib/
    ├── board-service/          # Express + React service
    └── board-mcp/              # MCP server interface
```

## Best Practices

### For Development

- Use `npm run mcp:start:dev` for active development
- Monitor logs in separate terminals during debugging
- Use `npm run mcp:status:watch` to monitor service health
- Always stop services cleanly with `npm run mcp:stop`

### For Production

- Use `npm run mcp:start:prod` for production deployments
- Set up log rotation for service logs
- Monitor with external tools (systemd, PM2, etc.)
- Consider using environment variables for configuration

### For CI/CD

- Start services in background: `npm run mcp:start`
- Wait for health checks before running tests
- Always clean up with `npm run mcp:stop:force`
- Use brief status for pipeline logs: `npm run mcp:status:brief`

## Integration Examples

### VS Code Tasks

Add to `.vscode/tasks.json`:

```json
{
  "tasks": [
    {
      "label": "Start MCP Stack",
      "type": "shell",
      "command": "npm run mcp:start:dev",
      "group": "build",
      "presentation": { "reveal": "always" },
      "problemMatcher": []
    },
    {
      "label": "Stop MCP Stack",
      "type": "shell",
      "command": "npm run mcp:stop",
      "group": "build"
    }
  ]
}
```

### Docker Integration

The scripts can be adapted for Docker environments:

```dockerfile
# In Dockerfile
COPY protocol-assets/scripts/ /app/scripts/
RUN chmod +x /app/scripts/*.sh

# Use scripts in container
CMD ["/app/scripts/start-mcp-stack.sh", "--production"]
```

### Systemd Service

For system-level management:

```ini
# /etc/systemd/system/lerian-mcp.service
[Unit]
Description=Lerian Protocol MCP Stack
After=network.target

[Service]
Type=forking
User=your-user
WorkingDirectory=/path/to/lerian-protocol
ExecStart=/path/to/protocol-assets/scripts/start-mcp-stack.sh --background
ExecStop=/path/to/protocol-assets/scripts/stop-mcp-stack.sh
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

## Contributing

When modifying these scripts:

1. **Test all modes** (dev, background, production)
2. **Verify error handling** with invalid configurations
3. **Update documentation** for new features or configuration options
4. **Maintain backward compatibility** with existing workflows
5. **Add comprehensive logging** for troubleshooting

The scripts are designed to be:

- **Self-documenting** with help output
- **Robust** with comprehensive error handling
- **Extensible** for additional services
- **User-friendly** with clear status reporting
