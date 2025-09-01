```
                         ________________________________________________
                        /                                                \
                       |    _________________________________________     |
                       |   |                                         |    |
                       |   |  > lerian-protocol --init @frontend     |    |
                       |   |                                         |    |
                       |   |  ╔══════════════════════════════════╗   |    |
                       |   |  ║   LERIAN PROTOCOL v0.1.0         ║   |    |
                       |   |  ║   AI-Powered Development Suite   ║   |    |
                       |   |  ║                                  ║   |    |
                       |   |  ║    Welcome to @frontend team!    ║   |    |
                       |   |  ║                                  ║   |    |
                       |   |  ║   @castro, @drax, @biri, @paulo  ║   |    |
                       |   |  ╚══════════════════════════════════╝   |    |
                       |   |                                         |    |
                       |   |_________________________________________|    |
                       |                                                  |
                        \_________________________________________________/
                               \___________________________________/
                            ___________________________________________
                         _-'    .-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.  --- `-_
                      _-'.-.-. .---.-.-.-.-.-.-.-.-.-.-.-.-.-.-.--.  .-.-.`-_
                   _-'.-.-.-. .---.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-`__`. .-.-.-.`-_
                _-'.-.-.-.-. .-----.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-----. .-.-.-.-.`-_
             _-'.-.-.-.-.-. .---.-. .-------------------------. .-.---. .---.-.-.-.`-_
            :-------------------------------------------------------------------------:
            `---._.-------------------------------------------------------------._.---'
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

- **9 Specialized Agents** - UI/UX specialist, tech writer, todo manager, frontend developer, etc.
- **30+ Slash Commands** - Code quality, documentation, development, planning workflows
- **Python Hook System** - Automated testing, security validation, backup automation
- **Native Configuration** - Complete `.claude/` directory with CLAUDE.md

### Protocol Asset System (4-Layer Architecture)

- **system/** - Board management and workflow orchestration
- **content/** - Documentation, design system, templates, knowledge base
- **quality/** - Standards, testing protocols, validation outputs
- **media/** - Screenshots, visual assets, UI references

### Advanced Development Tools

- **MCP Server Configurations** - Context7, Playwright, Fetch, Shadcn integrations
- **Interactive CLI Components** - Modern terminal UI components with advanced styling
- **Board System** - 3-stage kanban (backlog → ready → done) with workflow automation
- **Workflow Definitions** - YAML-based process automation with task classification
- **Quality Validation** - Comprehensive standards and testing protocols

### 📁 Directory Structure

```
.claude/                    # Claude Code Native Integration
├── agents/                # 9 Specialized AI Agents
│   ├── ui-ux-specialist.md        # UI/UX design and specifications
│   ├── ui-validator.md            # UI validation and testing
│   ├── todo-manager.md            # Intelligent task management
│   ├── tech-writer.md             # Technical documentation
│   ├── task-breakdown-specialist.md # Complex task decomposition
│   ├── user-story-generator.md    # Agile story creation
│   ├── react-state-management.md  # React state patterns
│   ├── react-performance-optimization.md # Performance optimization
│   └── frontend-developer.md     # Frontend development specialist
├── commands/              # 30+ Development Commands
│   ├── code-quality/      # Code review, security scans, refactoring
│   ├── documentation/     # Codebase analysis, diagrams, explanations
│   ├── development/       # Scaffolding, debugging, prototyping
│   ├── planning/          # Estimation, issue prediction, options analysis
│   └── utils/             # Setup, cleaning, command management
├── hooks/                 # Python Automation Hooks
│   ├── auto-test.py       # Automated testing hooks
│   ├── dependency-monitor.py # Dependency monitoring
│   ├── security.py        # Security validation
│   ├── prettier.py        # Code formatting
│   └── backup.py          # Backup automation
└── CLAUDE.md              # Main configuration with collaboration guidelines

protocol-assets/           # 4-Layer Protocol Asset Architecture
├── system/                # Core Workflow & Project Management
│   ├── board/             # 3-stage kanban system (backlog → ready → done)
│   ├── workflows/         # YAML workflow definitions with task classification
│   └── templates/         # Design approval, implementation handoff
├── content/               # Knowledge Base & Documentation
│   ├── docs/              # Documentation and knowledge base
│   ├── design-system/     # UI standards, validation rules
│   └── templates/         # Reusable document templates
├── quality/               # Standards & Testing Protocols
│   ├── standards/         # Code quality standards
│   ├── testing/           # Test scenarios and validation
│   ├── compatibility/     # Cross-platform guidelines
│   └── validation-outputs/ # Testing and validation outputs
└── media/                 # Visual Assets & Screenshots
    └── ui-references/     # Reference designs and mockups

lib/                       # Core Implementation Library
├── installer.js           # Main installation orchestrator (1460+ lines)
├── components/            # Interactive CLI Components
├── sync/                  # File Synchronization System
│   ├── sync-command.js    # Main sync orchestration
│   ├── change-detector.js # Intelligent change detection
│   └── metadata-manager.js # File tracking and synchronization
├── safety/                # Security & Validation
├── utils/                 # Shared utilities and helpers

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

| Directory           | Purpose                  | Contents                                                      |
| ------------------- | ------------------------ | ------------------------------------------------------------- |
| `.claude/agents/`   | 9 specialized AI agents  | UI/UX specialist, UI validator, todo manager, tech writer     |
| `.claude/commands/` | 30+ development commands | Code quality, documentation, development, planning workflows  |
| `.claude/hooks/`    | Python automation hooks  | Testing, security, dependency monitoring, formatting          |
| `lib/`              | Core implementation      | React/TypeScript components, sync system, design system       |
| `protocol-assets/`  | 4-layer asset system     | System workflows, content knowledge, quality standards, media |
| `.mcp.json`         | MCP server configuration | Context7, Playwright, Fetch, Shadcn integrations              |

## Repository Structure

```
├── .claude/                     # Claude Code Native Integration
│   ├── agents/                  # 9 specialized AI agents (ui-ux-specialist, ui-validator, etc.)
│   ├── commands/                # 30+ development commands organized by function
│   ├── hooks/                   # Python automation hooks (testing, security, formatting)
│   └── CLAUDE.md                # Main configuration with collaboration guidelines
├── bin/                         # CLI entry points and executables
├── lib/                         # Core Implementation Library
│   ├── installer.js             # Main installation orchestrator (1460+ lines)
│   ├── components/              # Interactive CLI components
│   ├── sync/                    # File synchronization system
│   ├── safety/                  # Security validation and safety checks
│   └── utils/                   # Shared utilities and helpers
├── protocol-assets/             # 4-Layer Protocol Asset Architecture
│   ├── system/                  # Core workflow & board management
│   ├── content/                 # Knowledge base & documentation
│   ├── quality/                 # Standards & testing protocols
│   └── media/                   # Visual assets & UI references
└── .mcp.json                    # MCP server configuration (Context7, Playwright, Fetch, Shadcn)
```

<div align="center">
   <p>Made with ❤️ by <a href="https://github.com/LerianStudio">Lerian Studio</a></p>
</div>
