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

**Lerian Protocol** is a CLI tool that sets up development workflow structure for **Claude Code**.
It creates directory structure with agents, commands, templates, workflows, and documentation.

### Features

- 🏗️ **Directory Structure** - Creates organized directories and templates
- 🔧 **Installation** - CLI installer that sets up workflow files
- 📁 **Organization** - Creates organized directory structure for development workflows
- 🎯 **Claude Code Integration** - Works with Claude Code's agent system
- 📚 **Templates** - Directory structure for planning and development templates
- 🤖 **Agents** - Directory structure for custom agent definitions

## ✨ What Gets Installed

The installer creates the following structure:

- **Directory Structure** - Organized folders for workflow management
- **Configuration** - Project metadata and settings
- **Board System** - Feature lifecycle tracking folders
- **Documentation** - README files and best practices
- **Context Base** - Directory for project documentation and examples

### 📁 Directory Structure

```
.claude/
├── agents/                # AI agent definitions
│   ├── tech-writer.md     # Technical writing specialist
│   ├── todo-manager.md    # Task management agent
│   ├── user-story-generator.md # Agile story creation
│   ├── react-state-management.md # React state management
│   ├── react-performance-optimization.md # React performance
│   ├── task-breakdown-specialist.md # Task breakdown
│   ├── ui-ux-specialist.md # UI/UX design specialist
│   └── ui-validator.md    # Visual UI testing specialist
├── commands/              # Development commands organized by function
│   ├── code-quality/      # Code review, refactoring, security
│   ├── documentation/     # Analysis, diagrams, code explanation
│   ├── development/       # Scaffolding, debugging, prototyping
│   ├── planning/          # Estimation, issue prediction
│   └── utils/             # Setup, cleaning, command management
├── hooks/                 # Git hooks and validation
│   ├── auto-test.py       # Automated testing hooks
│   ├── dependency-monitor.py # Dependency monitoring
│   ├── security.py        # Security validation
│   └── backup.py          # Backup automation
└── CLAUDE.md              # Claude Code configuration

context/                   # Domain knowledge base
├── anthropic/             # Claude Code references and patterns
└── console/               # Project-specific patterns and conventions

lib/                       # Core library components
├── commands/              # Command implementations
├── components/            # UI components and enhanced selectors
├── config.js              # Configuration management
├── design/                # Design system and themes
├── detection/             # Change detection utilities
├── installer/             # Installation system
├── interaction/           # User interaction handlers
├── safety/                # Safety checks and validation
├── security/              # Security utilities
├── selection/             # File selection management
├── sync/                  # Synchronization utilities
├── types/                 # TypeScript type definitions
└── utils/                 # General utilities

protocol-assets/           # Protocol assets and resources
├── content/               # Documentation and templates
├── media/                 # Media assets
├── quality/               # Quality assurance resources
└── system/                # System configuration

src/                       # Source code
templates/                 # Document templates and checklists
workflows/                 # Process workflow definitions
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 16.0.0
- **Git** - For cloning the repository
- **Claude Code** - This protocol is specifically designed for Claude Code

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

### Protocol Assets Structure

```
protocol-assets/
├── content/           # Documentation and template content
├── media/             # Media assets and resources
├── quality/           # Quality assurance and standards
└── system/            # System configurations and workflows
```

## 📚 Key Components

| Directory           | Purpose                  | Contents                                                  |
| ------------------- | ------------------------ | --------------------------------------------------------- |
| `.claude/agents/`   | AI agent definitions     | Specialized agents for different development tasks        |
| `.claude/commands/` | Development commands     | Organized command system for code quality and development |
| `.claude/hooks/`    | Git hooks and validation | Automated testing, security, and backup hooks             |
| `lib/`              | Core library             | Installation system, UI components, and utilities         |
| `protocol-assets/`  | Protocol resources       | Documentation templates, media, and quality standards     |
| `context/`          | Domain knowledge base    | Claude Code patterns and project-specific conventions     |

## Repository Structure

```
├── .claude/                     # Claude Code native configuration
│   ├── agents/                  # AI agent definitions with specialized roles
│   ├── commands/                # Development commands organized by function
│   ├── hooks/                   # Git hooks for automation and validation
│   └── CLAUDE.md                # Main Claude Code configuration
├── bin/                         # CLI entry points and executables
├── lib/                         # Core library and implementation
│   ├── components/              # UI components and enhanced selectors
│   ├── installer/               # Installation system and utilities
│   ├── safety/                  # Safety checks and validation
│   ├── security/                # Security utilities and sanitization
│   ├── sync/                    # Synchronization and file operations
│   └── utils/                   # General utilities and helpers
├── protocol-assets/             # Protocol resources and assets
│   ├── content/                 # Documentation and template content
│   ├── quality/                 # Quality assurance and standards
│   └── system/                  # System configurations and workflows
├── context/                     # Domain knowledge base
│   ├── anthropic/               # Claude Code patterns and references
│   └── console/                 # Project-specific conventions
├── src/                         # Source code implementations
├── templates/                   # Document templates and checklists
└── workflows/                   # Process workflow definitions
```

<div align="center">
   <p>Made with ❤️ by <a href="https://github.com/LerianStudio">Lerian Studio</a></p>
</div>
