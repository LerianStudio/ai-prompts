```
██╗      ███████╗ ██████╗  ██╗  █████╗  ███╗   ██╗
██║      ██╔════╝ ██╔══██╗ ██║ ██╔══██╗ ████╗  ██║
██║      █████╗   ██████╔╝ ██║ ███████║ ██╔██╗ ██║
██║      ██╔══╝   ██╔══██╗ ██║ ██╔══██║ ██║╚██╗██║
███████╗ ███████╗ ██║  ██║ ██║ ██║  ██║ ██║ ╚████║
╚══════╝ ╚══════╝ ╚═╝  ╚═╝ ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═══╝

██████╗  ██████╗   ██████╗  ████████╗ ██████╗  ██████╗  ██████╗  ██╗
██╔══██╗ ██╔══██╗ ██╔═══██╗ ╚══██╔══╝ ██╔═══██╗██╔════╝ ██╔═══██╗ ██║
██████╔╝ ██████╔╝ ██║   ██║    ██║    ██║   ██║██║      ██║   ██║ ██║
██╔═══╝  ██╔══██╗ ██║   ██║    ██║    ██║   ██║██║      ██║   ██║ ██║
██║      ██║  ██║ ╚██████╔╝    ██║    ╚██████╔╝╚██████╗ ╚██████╔╝ ███████╗
╚═╝      ╚═╝  ╚═╝  ╚═════╝     ╚═╝     ╚═════╝  ╚═════╝  ╚═════╝  ╚══════╝
```

## 🎯 Overview

**Lerian Protocol** is an advanced CLI tool that creates a comprehensive **AI-powered development environment** for **Claude Code**. It implements a sophisticated agent-based workflow system with visual validation, board management, and protocol asset organization.

### Core Features

- 🤖 **Agent-Based Workflows** - 9 specialized agents with domain expertise
- 🎨 **UI-First Development** - Visual validation with Playwright MCP screenshots
- 📋 **Board System** - 3-stage simplified kanban (backlog → ready → done)
- 🏗️ **4-Layer Asset Architecture** - Organized system/content/quality/media structure
- ⚡ **MCP Server Integration** - Context7, Playwright, Fetch, Shadcn integrations
- 🔧 **Enhanced Components** - Interactive CLI components with modern styling
- 📊 **Quality Gates** - Comprehensive validation workflows
- 🛠️ **30+ Slash Commands** - Organized development commands by function

## ✨ What Gets Installed

The installer creates a complete AI-powered development environment:

### Claude Code Integration

- **Domain-Organized Agents** - Specialized agents organized by frontend, backend, and shared domains
- **30+ Slash Commands** - Domain-specific commands for development, quality, documentation workflows
- **Python Hook System** - Domain-organized hooks for automated testing, security, formatting
- **Native Configuration** - Complete `.claude/` directory with domain separation and CLAUDE.md

### Modern Architecture System

- **Domain Separation** - Frontend, backend, and shared component organization
- **Service Layer** - Error handling, protocol asset management, and utility services
- **Documentation System** - UI workflows, diagrams, and architecture documentation
- **CLI Tooling** - Interactive terminal components with modern styling

### Advanced Development Tools

- **MCP Server Configurations** - Context7, Playwright, Fetch, Shadcn integrations
- **Interactive CLI Components** - Modern terminal UI components with advanced styling
- **Database-Backed Task Management** - SQLite-based @task-manager system replacing fragile file operations
- **Workflow Definitions** - YAML-based process automation with database integration
- **Quality Validation** - Comprehensive standards and testing protocols

### 📁 Directory Structure

```
.claude/                    # Claude Code Native Integration
├── agents/                # Specialized AI Agents (organized by domain)
│   ├── frontend/          # Frontend-specific agents (React, UI/UX, Playwright)
│   └── shared/            # Cross-domain agents (Tech Writer, Todo Manager, User Stories)
├── commands/              # 30+ Development Commands
│   ├── frontend/          # Frontend development commands
│   └── shared/            # Shared utility commands
├── hooks/                 # Python Automation Hooks
│   ├── frontend/          # Frontend-specific hooks
│   └── shared/            # Shared automation hooks
├── frontend/              # Frontend-specific configurations
├── backend/               # Backend-specific configurations (structure created)
├── shared/                # Shared configurations and utilities
├── CLAUDE.md              # Main configuration with collaboration guidelines
└── settings.json          # Claude Code settings

docs/                      # Project Documentation
├── ui-task-flow-example.md # Complete UI workflow examples
└── diagrams/              # Architecture and workflow diagrams
    └── flow/              # Workflow visualization diagrams

lib/                       # Core Implementation Library
├── installer/             # Installation system components
│   ├── installer.js       # Main installer orchestrator
│   ├── constants.js       # Installation constants
│   ├── index.js           # Installer entry point
│   ├── ui-theme.js        # CLI theming and styling
│   └── debug.js           # Debug utilities
├── services/              # Service layer (NEW)
│   ├── error-handler-service.js    # Error handling service
│   └── protocol-asset-service.js   # Protocol asset management
├── components/            # Interactive CLI Components
│   └── CommandHeader.js   # Command header component
├── sync/                  # File Synchronization System
│   └── metadata-manager.js # File tracking and synchronization
├── utils/                 # Shared utilities
│   ├── logger.js          # Logging utilities
│   └── terminal.js        # Terminal utilities
├── config.js              # Configuration management
└── installer.js           # Legacy installer (main entry)

bin/                       # CLI Executables
├── lerian-protocol.js     # Main CLI entry point
└── lerian-cli-wrapper.js  # CLI wrapper script

.mcp.json                  # MCP Server Configuration
├── context7               # Library documentation and code examples
├── playwright             # Browser automation with screenshot validation
├── fetch                  # Web content retrieval capabilities
└── shadcn                 # UI component generation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 16.0.0
- **Git** - For cloning the repository
- **Claude Code** - This protocol is specifically designed for Claude Code
- **Python** (optional) - For advanced hook automation
- **Browser** - For Playwright visual validation (installed automatically)

### Installation

#### Development Installation

```bash
git clone https://github.com/LerianStudio/ai-prompts.git -b lerian-protocol
cd ai-prompts
npm install
npm link

lerian-protocol install ./my-project
```

## 📖 Usage

| Command                          | Description                   | Example                                |
| -------------------------------- | ----------------------------- | -------------------------------------- |
| `lerian-protocol install`        | Install in current directory  | `lerian-protocol install`              |
| `lerian-protocol install <path>` | Install in specific directory | `lerian-protocol install ./my-project` |
| `lerian-protocol status`         | Show installation status      | `lerian-protocol status`               |
| `lerian-protocol uninstall`      | Remove installation           | `lerian-protocol uninstall`            |

### Key Capabilities

#### Database-Backed Task Management

- **@task-manager MCP Tool** - Revolutionary database-backed task system replacing fragile file operations
- **SQLite Database** - Reliable task state with atomic operations and transaction safety
- **Automatic Completion** - Tasks auto-complete when all todos are finished
- **Agent Coordination** - Task IDs enable seamless handoffs between specialized agents

#### UI-First Development

- **Visual Validation** - Playwright MCP screenshots with pixel-perfect comparison
- **Iterative Refinement** - "Try → Look → Fix → Repeat" development cycle
- **Quality Gates** - Visual similarity (95%), accessibility (100%), performance (90%)
- **Multi-Viewport Testing** - Desktop and responsive validation

#### Domain-Driven Architecture

- **Profile-Based Installation** - Frontend-only, backend-only, or full installation based on project needs
- **Agent Specialization** - Domain-specific agents prevent overlap and ensure targeted expertise
- **Asset Organization** - Protocol assets organized by domain (frontend/, backend/, shared/)
- **Workflow Automation** - YAML workflows with database integration for complex multi-step processes

#### MCP Server Ecosystem

- **Context7** - Up-to-date library documentation and code examples
- **Playwright** - Browser automation with screenshot validation
- **Fetch** - Web content retrieval capabilities
- **Shadcn** - UI component generation

## 📚 Key Components

| Directory                            | Purpose                  | Contents                                                                     |
| ------------------------------------ | ------------------------ | ---------------------------------------------------------------------------- |
| `.claude/agents/`                    | Specialized AI agents    | Frontend (React, UI/UX, Playwright) and Shared (Tech Writer, Task Breakdown) |
| `.claude/commands/`                  | 30+ development commands | Frontend development commands and shared utility commands                    |
| `.claude/hooks/`                     | Python automation hooks  | Frontend and shared automation hooks for testing, security, formatting       |
| `.claude/tools/`                     | MCP tool configurations  | @task-manager tool for database-backed task management                       |
| `.claude/frontend/`                  | Frontend configurations  | Frontend-specific settings and configurations                                |
| `.claude/backend/`                   | Backend configurations   | Backend-specific settings and configurations (structure created)             |
| `.claude/shared/`                    | Shared configurations    | Cross-domain utilities and shared configurations                             |
| `protocol-assets/lib/board-service/` | Task management service  | Node.js REST API with SQLite database for reliable task operations           |
| `protocol-assets/lib/board-mcp/`     | Task management MCP tool | @task-manager MCP tool for agent integration                                 |
| `protocol-assets/lib/`               | Core implementation      | Installer, services, components, sync system, utilities                      |
| `docs/`                              | Project documentation    | Architecture, deployment guides, PRD, and workflow documentation             |
| `protocol-assets/scripts/`           | Deployment scripts       | Service management, migration, and health monitoring tools                   |
| `bin/`                               | CLI executables          | Main CLI entry points and wrapper scripts                                    |
| `.mcp.json`                          | MCP server configuration | Context7, Playwright, Fetch, Shadcn integrations                             |

## Repository Structure

```
├── .claude/                     # Claude Code Native Integration
│   ├── agents/                  # Domain-organized specialized AI agents
│   │   ├── frontend/            # Frontend-specific agents (React, UI/UX, Playwright)
│   │   └── shared/              # Cross-domain agents (Tech Writer, Task Breakdown)
│   ├── commands/                # 30+ development commands by domain
│   │   ├── frontend/            # Frontend development commands
│   │   └── shared/              # Shared utility commands
│   ├── hooks/                   # Python automation hooks by domain
│   │   ├── frontend/            # Frontend-specific hooks
│   │   └── shared/              # Shared automation hooks
│   ├── tools/                   # MCP tool configurations
│   │   └── task-manager.md      # @task-manager tool documentation
│   ├── frontend/                # Frontend-specific configurations
│   ├── backend/                 # Backend-specific configurations (structure created)
│   ├── shared/                  # Shared configurations and utilities
│   ├── CLAUDE.md                # Main configuration with collaboration guidelines
│   └── settings.json            # Claude Code settings
├── docs/                        # Project Documentation
│   ├── ARCHITECTURE.md          # Comprehensive architecture documentation
│   ├── board-deployment.md      # Task management system deployment guide
│   ├── prd.md                   # Product requirements document
│   └── diagrams/                # Architecture and workflow diagrams
├── lib/                         # Core Implementation Library
│   ├── board-service/           # Task Management Service (Node.js/Express/SQLite)
│   ├── board-mcp/               # @task-manager MCP Tool
│   ├── installer/               # Installation system components
│   ├── services/                # Service layer (error handling, protocol assets)
│   ├── components/              # Interactive CLI components
│   ├── sync/                    # File synchronization system
│   ├── utils/                   # Shared utilities and helpers
│   ├── config.js                # Configuration management
│   └── installer.js             # Legacy installer (main entry)
├── scripts/                     # Deployment and Management Scripts
│   ├── start-task-service.sh    # Start task management service
│   ├── stop-task-service.sh     # Stop task management service
│   └── migrate-board-tasks.sh   # Migrate legacy tasks to database
├── bin/                         # CLI entry points and executables
│   ├── lerian-protocol.js       # Main CLI entry point
│   └── lerian-cli-wrapper.js    # CLI wrapper script
├── protocol-assets/             # Protocol Asset Organization (Domain-Based)
│   ├── frontend/                # Frontend-specific assets and workflows
│   ├── backend/                 # Backend-specific assets and workflows
│   └── shared/                  # Cross-domain assets and standards
├── CHANGELOG.md                 # Version history and change tracking
└── .mcp.json                    # MCP server configuration (Context7, Playwright, Fetch, Shadcn)
```

<div align="center">
   <p>Made with ❤️ by <a href="https://github.com/LerianStudio">Lerian Studio</a></p>
</div>
