# Commands - Domain-Organized Development Tools

This directory contains custom Claude Code slash commands organized by development domain (frontend, backend, shared) to provide targeted development workflow support.

## Purpose

The commands provide comprehensive development tools organized by domain:

- **Frontend Commands** - React components, UI validation, state management, performance optimization
- **Backend Commands** - APIs, databases, server architecture, deployment workflows (structure ready)
- **Shared Commands** - Code quality, documentation, planning, project utilities

All commands follow the official Anthropic slash command format and integrate with the Lerian Protocol's agent system.

## Domain Organization

```
commands/
├── frontend/           # Frontend-specific commands
│   └── code-quality/
│       └── check-ui.md              # UI validation with Playwright
├── shared/             # Cross-domain commands
│   ├── code-quality/               # Code improvement tools
│   │   ├── code-improve.md         # General code enhancement
│   │   ├── code-review.md          # Code review automation  
│   │   ├── security-scan.md        # Security analysis
│   │   └── technical-debt.md       # Technical debt analysis
│   ├── documentation/              # Documentation tools
│   │   ├── analyze-codebase.md     # Comprehensive codebase analysis
│   │   ├── document.md             # Smart documentation management
│   │   ├── diagram.md              # Architecture diagrams
│   │   └── architecture-document.md # Architecture documentation
│   ├── development/                # Development workflow
│   │   ├── fix-problem.md          # Problem-solving automation
│   │   ├── scaffold.md             # Project scaffolding
│   │   └── prototype.md            # Rapid prototyping
│   ├── planning/                   # Project planning
│   │   ├── estimate.md             # Development estimation
│   │   ├── options.md              # Solution analysis
│   │   └── ultra-think.md          # Strategic planning
│   └── utils/                      # Command utilities
│       ├── create-command.md       # Command creation tool
│       ├── update-command.md       # Command maintenance
│       └── summary.md              # Session summaries
└── backend/            # Backend-specific commands (structure ready)
    └── [Backend commands to be added based on profile needs]
```

## Command Categories

### Frontend Commands
- **UI Validation** - Visual testing with Playwright MCP integration
- **Component Quality** - React-specific code analysis and improvement
- **State Management** - Redux, Context API, and modern state patterns
- **Performance** - Bundle analysis, render optimization, Core Web Vitals

### Shared Commands  
- **Code Quality** - Universal code improvement and security scanning
- **Documentation** - Comprehensive documentation generation and management
- **Development** - Problem-solving, scaffolding, and rapid prototyping
- **Planning** - Estimation, analysis, and strategic thinking tools
- **Utilities** - Command system management and project utilities

### Integration Features

All commands integrate with:
- **MCP Servers** - Context7, Playwright, Fetch, Shadcn for enhanced capabilities
- **Agent System** - Coordinated workflows with specialized agents
- **TodoWrite** - Task tracking and progress management
- **Profile Installation** - Domain-specific commands installed based on project needs

## Usage Patterns

### Frontend Development
```bash
/check-ui               # Validate UI with Playwright screenshots
/code-improve react     # Optimize React components
/analyze-codebase       # Understand project architecture
```

### Documentation & Planning
```bash
/document update        # Update all project documentation
/estimate feature       # Estimate development effort
/ultra-think solution   # Strategic problem analysis
```

### Development Workflow
```bash
/fix-problem bug-123    # Automated problem solving
/scaffold component     # Generate new components
/prototype feature      # Rapid feature prototyping
```

## Command Development

### Creating New Commands
1. **Choose Domain** - Determine if frontend-specific, backend-specific, or shared
2. **Use Templates** - Leverage `/create-command` for consistent structure
3. **Follow Patterns** - Match existing command format and conventions
4. **Test Integration** - Verify MCP server and agent compatibility

### Command Structure
Each command follows the standard format:
- **Purpose statement** - Clear description of command functionality
- **Usage examples** - Practical examples with expected outcomes
- **Integration points** - MCP servers, agents, and tools used
- **Output format** - Consistent formatting and user experience
