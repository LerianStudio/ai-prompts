# Service Architecture

## Overview

The Lerian Protocol now follows a domain-driven service architecture with clear separation of concerns:

```
protocol-assets/
├── services/           # Independent, deployable services
├── shared/             # Shared libraries and contracts
├── infrastructure/     # Runtime and deployment concerns
├── tools/              # Development and build tools
├── frontend/           # Frontend-specific assets
└── backend/            # Backend-specific assets
```

## Services

### board-api

- **Purpose**: REST API and WebSocket server for task management
- **Port**: 3020
- **Dependencies**: SQLite database, shared libraries
- **Health Check**: `GET /health`

### board-ui

- **Purpose**: React frontend with kanban interface
- **Port**: 5173 (dev), served by board-api (prod)
- **Dependencies**: board-api service
- **Health Check**: Built-in Vite dev server

### board-mcp

- **Purpose**: MCP server for Claude Code integration
- **Dependencies**: board-api service
- **Health Check**: `node src/index.js health`

## Communication Patterns

- **UI ↔ API**: REST calls + WebSocket for real-time updates
- **MCP ↔ API**: HTTP client calls to board-api endpoints
- **Shared Code**: ES6 imports with path mapping

## Development Workflow

```bash
# Start all services
npm run mcp:start

# Start individual services
npm run services:api
npm run services:ui
npm run services:mcp

# Check status
npm run mcp:status

# Stop all services
npm run mcp:stop
```

## Deployment

Each service can be deployed independently:

- board-api: Node.js server with SQLite
- board-ui: Static assets served by board-api or CDN
- board-mcp: Node.js process managed by Claude Code
