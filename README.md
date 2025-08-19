```
                                     ________________________________________________
                                    /                                                \
                                   |    _________________________________________     |
                                   |   |                                         |    |
                                   |   |  > lerian-protocol --init @frontend     |    |
                                   |   |                                         |    |
                                   |   |  ╔══════════════════════════════════╗   |    |
                                   |   |  ║   LERIAN PROTOCOL v0.1.0-alpha   ║   |    |
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
- **Stage-Gate System** - Feature lifecycle tracking folders
- **Documentation** - README files and best practices
- **Context Base** - Directory for project documentation and examples

### 📁 Directory Structure

```
.claude/
├── agents/                # AI agent definitions
├── commands/              # Development commands
└── CLAUDE.md              # Claude Code configuration

.workflow/
├── context/               # Context base and examples
├── workflows/             # YAML workflow definitions
├── config.yaml            # Protocol configuration
└── stage-gate/            # Feature tracking system
    ├── 00.backlog/        # Ideas and requirements
    ├── 01.planning/       # PRDs and architecture
    ├── 02.in-progress/    # Active development
    └── 03.completed/      # Finished features

.mcp.json                  # MCP configuration
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

```bash
lerian-protocol install                           # Install in current directory
lerian-protocol install ./my-project              # Install in specific directory
lerian-protocol status                            # Show installation status
lerian-protocol uninstall                         # Remove installation
```

### Stage-Gate Structure

```
.workflow/stage-gate/
├── 00.backlog/        # Ideas and requirements
├── 01.planning/       # PRDs and architecture
├── 02.in-progress/    # Active development
└── 03.completed/      # Finished features
```

## 📚 Files Created

| Directory           | Purpose              | Contents                                                |
| ------------------- | -------------------- | ------------------------------------------------------- |
| `.claude/agents/`   | AI agent definitions | Directory structure and README for custom agents        |
| `.claude/commands/` | Development commands | Directory structure and README for custom commands      |
| `context/`          | Documentation        | Directory structure and README for project context      |
| `workflows/`        | Process workflows    | Directory structure and README for workflow definitions |
| `stage-gate/`       | Project tracking     | Organized folders for feature lifecycle management      |

## Repository Structure

```
├── .claude/                     # Claude Code configuration
│   ├── agents/                  # Agent definitions
│   └── commands/                # Development commands
├── bin/                         # CLI entry points
├── lib/                         # Installation logic
├── context/                     # Example documentation
├── workflows/                   # YAML workflow definitions
├── templates/                   # Document templates
└── stage-gate/                  # Stage-gate structure
```

<div align="center">
    <p>Made with ❤️ by <a href="https://github.com/LerianStudio">Lerian Studio</a></p>
</div>
