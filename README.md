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
- **Board System** - 3-stage kanban (backlog → ready → done) with workflow automation
- **Workflow Definitions** - YAML-based process automation with task classification
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

#### UI-First Development

- **Visual Validation** - Playwright MCP screenshots with pixel-perfect comparison
- **Iterative Refinement** - "Try → Look → Fix → Repeat" development cycle
- **Quality Gates** - Visual similarity (95%), accessibility (100%), performance (90%)
- **Multi-Viewport Testing** - Desktop and responsive validation

#### Agent-Based Workflows

- **Multi-Agent Coordination** - Context-preserving handoffs between specialized agents
- **Board Integration** - Kanban workflow with intelligent todo management
- **YAML Workflow Definitions** - Declarative process automation
- **Template System** - Reusable templates for consistent outputs

#### MCP Server Ecosystem

- **Context7** - Up-to-date library documentation and code examples
- **Playwright** - Browser automation with screenshot validation
- **Fetch** - Web content retrieval capabilities
- **Shadcn** - UI component generation

## 📚 Key Components

| Directory           | Purpose                   | Contents                                                      |
| ------------------- | ------------------------- | ------------------------------------------------------------- |
| `.claude/agents/`   | Specialized AI agents     | Frontend (React, UI/UX, Playwright) and Shared (Tech Writer, Todo)          |
| `.claude/commands/` | 30+ development commands  | Frontend development commands and shared utility commands            |
| `.claude/hooks/`    | Python automation hooks   | Frontend and shared automation hooks for testing, security, formatting     |
| `.claude/frontend/` | Frontend configurations   | Frontend-specific settings and configurations                 |
| `.claude/backend/`  | Backend configurations    | Backend-specific settings and configurations (structure created)                  |  
| `.claude/shared/`   | Shared configurations     | Cross-domain utilities and shared configurations             |
| `lib/`              | Core implementation       | Installer, services, components, sync system, utilities      |
| `docs/`             | Project documentation     | UI workflows, diagrams, architecture documentation           |
| `bin/`              | CLI executables           | Main CLI entry points and wrapper scripts                    |
| `.mcp.json`         | MCP server configuration  | Context7, Playwright, Fetch, Shadcn integrations             |

## Repository Structure

```
├── .claude/                     # Claude Code Native Integration
│   ├── agents/                  # Domain-organized specialized AI agents
│   │   ├── frontend/            # Frontend-specific agents (React, UI/UX, Playwright)
│   │   └── shared/              # Cross-domain agents (Tech Writer, Todo Manager)
│   ├── commands/                # 30+ development commands by domain
│   │   ├── frontend/            # Frontend development commands
│   │   └── shared/              # Shared utility commands
│   ├── hooks/                   # Python automation hooks by domain
│   │   ├── frontend/            # Frontend-specific hooks
│   │   └── shared/              # Shared automation hooks
│   ├── frontend/                # Frontend-specific configurations
│   ├── backend/                 # Backend-specific configurations (structure created)
│   ├── shared/                  # Shared configurations and utilities
│   ├── CLAUDE.md                # Main configuration with collaboration guidelines
│   └── settings.json            # Claude Code settings
├── docs/                        # Project Documentation  
│   ├── ui-task-flow-example.md  # Complete UI workflow examples
│   └── diagrams/                # Architecture and workflow diagrams
├── bin/                         # CLI entry points and executables
│   ├── lerian-protocol.js       # Main CLI entry point
│   └── lerian-cli-wrapper.js    # CLI wrapper script
├── lib/                         # Core Implementation Library
│   ├── installer/               # Installation system components
│   ├── services/                # Service layer (error handling, protocol assets)
│   ├── components/              # Interactive CLI components
│   ├── sync/                    # File synchronization system
│   ├── utils/                   # Shared utilities and helpers
│   ├── config.js                # Configuration management
│   └── installer.js             # Legacy installer (main entry)
├── CHANGELOG.md                 # Version history and change tracking
└── .mcp.json                    # MCP server configuration (Context7, Playwright, Fetch, Shadcn)
```

<div align="center">
   <p>Made with ❤️ by <a href="https://github.com/LerianStudio">Lerian Studio</a></p>
</div>
