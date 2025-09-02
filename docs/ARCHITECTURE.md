# Lerian Protocol Architecture Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture Components](#architecture-components)
3. [Installation Flow](#installation-flow)
4. [Profile System](#profile-system)
5. [Claude Code Integration](#claude-code-integration)
6. [MCP Server Configuration](#mcp-server-configuration)
7. [File Organization](#file-organization)
8. [Key Classes & Responsibilities](#key-classes--responsibilities)
9. [Error Handling Strategy](#error-handling-strategy)
10. [Development Workflow](#development-workflow)

---

## Overview

**Lerian Protocol** is a sophisticated CLI tool that creates comprehensive AI-powered development environments specifically for Claude Code. It implements a profile-based installation system that deploys specialized agents, slash commands, hooks, and MCP server integrations to enhance AI-assisted development workflows.

### Core Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CLI Layer     │───▶│ Installation     │───▶│ Claude Code     │
│                 │    │ System           │    │ Integration     │
│ • Commander.js  │    │ • Profile-based  │    │ • Agents        │
│ • Inquirer      │    │ • Error handling │    │ • Commands      │
│ • Terminal UI   │    │ • File sync      │    │ • Hooks         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Service Layer   │    │ Protocol Assets  │    │ MCP Servers     │
│                 │    │                  │    │                 │
│ • Error Handler │    │ • Frontend       │    │ • Context7      │
│ • Asset Manager │    │ • Backend        │    │ • Playwright    │
│ • Metadata Mgr  │    │ • Shared         │    │ • Fetch         │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

---

## Architecture Components

### 1. CLI Layer

**Entry Point**: `/bin/lerian-protocol.js`

The CLI layer provides the user interface and command orchestration:

- **Commander.js**: Command-line argument parsing and subcommand routing
- **Inquirer.js**: Interactive prompts for installation configuration
- **CFonts & Chalk**: Terminal styling and branding
- **CLI-Table3**: Formatted output tables for status and dry-run displays

### 2. Installation System

**Core Module**: `/lib/installer/installer.js`

The installation system handles the complete setup process:

- **Profile-based Installation**: Frontend, backend, or full environment setup
- **Smart File Filtering**: Conditional file copying based on selected profiles
- **Atomic Operations**: Transaction-like installation with rollback capabilities
- **Progress Tracking**: Real-time feedback with spinners and progress indicators

### 3. Service Layer

**Location**: `/lib/services/`

Provides centralized business logic:

- **Error Handler Service**: Translates system errors into actionable user messages
- **Protocol Asset Service**: Manages the copying and organization of protocol assets
- **Metadata Manager**: Tracks installed files for synchronization and updates

### 4. Claude Code Integration

**Location**: `.claude/` directory structure

Creates a complete Claude Code environment:

- **Domain-organized Agents**: Specialized AI agents for different development contexts
- **Slash Commands**: 30+ custom commands organized by function
- **Python Hooks**: Automated workflows for testing, formatting, and validation
- **MCP Configuration**: Integration with external tool servers

---

## Installation Flow

### 1. Initialization Phase

```javascript
// bin/lerian-protocol.js
program
  .command('install')
  .argument('[directory]', 'project directory to install in', '.')
  .option('--profile <profile>', 'installation profile: frontend, backend, or full')
  .option('--dry-run', 'show what would be installed without making changes')
  .action(async (directory, options) => {
    await installer.install({ directory, ...options })
  })
```

### 2. Configuration Phase

The installer determines configuration through:

1. **Command Line Arguments**: Direct profile specification
2. **Interactive Prompts**: User selects profile if not specified
3. **Directory Analysis**: Conflict detection and resolution

```javascript
async getInteractiveConfig(directory, options) {
  const { selectedProfile } = await inquirer.prompt([{
    type: 'list',
    name: 'selectedProfile',
    message: 'Which development profile best fits your project?',
    choices: [
      { name: 'Frontend - React, UI components, frontend tools + shared utilities', value: 'frontend' },
      { name: 'Backend - APIs, services, backend tools + shared utilities', value: 'backend' },
      { name: 'Full - Everything (frontend + backend)', value: 'full' }
    ]
  }])
}
```

### 3. Planning Phase

The system analyzes what needs to be installed:

- **Directory Structure**: Creates necessary folders based on profile
- **File Operations**: Plans copying of agents, commands, hooks, and assets
- **Conflict Resolution**: Identifies existing installations and handles updates

### 4. Execution Phase

Installation proceeds through atomic operations:

1. **Directory Creation**: Ensures all necessary folders exist
2. **File Copying**: Transfers files with progress feedback
3. **Permission Setting**: Makes executable files (hooks) executable
4. **Configuration**: Generates profile-specific settings
5. **Git Integration**: Updates .gitignore automatically

---

## Profile System

The profile system enables targeted installations based on project needs:

### Frontend Profile

**Components Installed**:
- React-focused agents (UI/UX specialist, React performance optimizer)
- Frontend commands (component generation, UI validation)
- Frontend hooks (Prettier, ESLint, auto-testing)
- Shared utilities and cross-domain tools

**File Pattern**:
```javascript
getProfilePatterns('frontend') {
  return ['frontend/**', 'shared/**']
}
```

### Backend Profile

**Components Installed**:
- Backend-focused agents (API designer, database specialist)
- Backend commands (API documentation, service generation)
- Backend hooks (security scanning, performance monitoring)
- Shared utilities and cross-domain tools

### Full Profile

**Components Installed**:
- All frontend and backend components
- Complete agent ecosystem
- Full command suite
- Comprehensive hook system

### Profile Filtering Logic

```javascript
shouldIncludeFile(filePath, profile, baseDir) {
  if (profile === 'full') return true
  
  const relativePath = path.relative(baseDir, filePath)
  const patterns = this.getProfilePatterns(profile)
  
  // Include files matching profile patterns
  const matches = patterns.some(pattern => {
    const globPattern = pattern.replace('/**', '/')
    return relativePath.startsWith(globPattern) || 
           relativePath.includes(`/${globPattern}`)
  })
  
  // Exclude opposing profile files
  if (profile === 'frontend' && relativePath.startsWith('backend/')) return false
  if (profile === 'backend' && relativePath.startsWith('frontend/')) return false
  
  return matches
}
```

---

## Claude Code Integration

### Agent System

**Location**: `.claude/agents/`

The agent system provides specialized AI assistants:

#### Frontend Agents
- **React Specialist**: Component design and optimization
- **UI/UX Specialist**: Design system implementation
- **Playwright Specialist**: Visual testing and validation

#### Shared Agents
- **Tech Writer**: Documentation generation
- **Todo Manager**: Task tracking and organization
- **User Story Generator**: Requirements analysis

#### Agent Configuration Format
```markdown
# Agent Name

## Role
Brief description of the agent's specialization

## Capabilities
- Specific skills and tools
- Domain expertise areas
- Integration points

## Workflow
1. Step-by-step process
2. Input/output expectations
3. Handoff protocols
```

### Command System

**Location**: `.claude/commands/`

30+ specialized commands organized by domain:

#### Frontend Commands
- `/ui-validate`: Visual validation with Playwright
- `/component-generate`: React component creation
- `/design-system-sync`: Maintain design consistency

#### Shared Commands
- `/explain-code`: Code analysis and documentation
- `/code-improve`: Refactoring suggestions
- `/security-scan`: Security vulnerability detection

#### Command Structure
```markdown
# Command Title

## Description
What this command does and when to use it

## Usage
Command syntax and examples

## Implementation
Technical details and integration points
```

### Hook System

**Location**: `.claude/hooks/`

Python-based automation hooks for development workflows:

#### Frontend Hooks
- **prettier.py**: Code formatting automation
- **eslint.py**: Linting and code quality checks
- **auto-test.py**: Automated testing on file changes

#### Shared Hooks
- **backup.py**: Pre-edit file backup
- **git-safety.py**: Prevents destructive git operations
- **notification.py**: Development event notifications

#### Hook Configuration
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/shared/backup.py"
          }
        ]
      }
    ]
  }
}
```

---

## MCP Server Configuration

**Location**: `.mcp.json`

MCP (Model Context Protocol) servers extend Claude Code's capabilities:

### Context7 Server
```json
{
  "context7": {
    "command": "npx",
    "args": ["-y", "@upstash/context7-mcp"]
  }
}
```
**Purpose**: Provides up-to-date library documentation and code examples

### Playwright Server
```json
{
  "playwright": {
    "command": "npx",
    "args": [
      "@playwright/mcp@latest",
      "--headless",
      "--viewport-size=1920,1080",
      "--output-dir=./protocol-assets/quality/validation-outputs"
    ]
  }
}
```
**Purpose**: Browser automation and visual validation with screenshot capabilities

### Fetch Server
```json
{
  "fetch": {
    "command": "uvx",
    "args": ["mcp-server-fetch"]
  }
}
```
**Purpose**: Web content retrieval for research and documentation

### Shadcn Server
```json
{
  "shadcn": {
    "command": "npx",
    "args": ["shadcn@latest", "mcp"]
  }
}
```
**Purpose**: UI component generation and design system integration

---

## File Organization

The project follows a domain-driven organization pattern:

### Primary Structure

```
project-root/
├── .claude/                    # Claude Code Integration
│   ├── agents/                # AI Agents by domain
│   │   ├── frontend/          # React, UI/UX, Playwright specialists
│   │   ├── backend/           # API, database, service specialists
│   │   └── shared/            # Cross-domain specialists
│   ├── commands/              # Slash commands by domain
│   │   ├── frontend/          # UI validation, component commands
│   │   ├── backend/           # API, database commands
│   │   └── shared/            # Code quality, documentation commands
│   ├── hooks/                 # Python automation hooks
│   │   ├── frontend/          # Prettier, ESLint, testing hooks
│   │   ├── backend/           # Security, performance hooks
│   │   └── shared/            # Backup, git safety, notifications
│   ├── frontend/              # Frontend-specific configurations
│   ├── backend/               # Backend-specific configurations
│   ├── shared/                # Cross-domain configurations
│   ├── CLAUDE.md              # Main collaboration guidelines
│   └── settings.json          # Claude Code settings
├── protocol-assets/           # Protocol Asset Organization
│   ├── frontend/              # Frontend-specific assets
│   ├── backend/               # Backend-specific assets
│   └── shared/                # Cross-domain assets
└── .mcp.json                  # MCP server configuration
```

### Domain Separation Benefits

1. **Clear Boundaries**: Frontend/backend concerns are separated
2. **Profile Filtering**: Enables targeted installations
3. **Maintenance**: Easier to update domain-specific components
4. **Scaling**: New domains can be added without conflicts

---

## Key Classes & Responsibilities

### Installer Class
**File**: `/lib/installer/installer.js`

**Primary Responsibilities**:
- Orchestrates the entire installation process
- Manages profile-based file filtering
- Handles user interactions and confirmations
- Provides progress feedback and error handling

**Key Methods**:
```javascript
class Installer {
  async install(options)                    // Main installation orchestrator
  async getInstallConfig(options)          // Configuration resolution
  async planInstallation(config)           // Pre-execution planning
  async performInstallation(config)        // Execution phase
  shouldIncludeFile(filePath, profile)     // Profile filtering logic
  async executeWithRetry(operation)        // Resilient operation execution
}
```

### ErrorHandlerService Class
**File**: `/lib/services/error-handler-service.js`

**Primary Responsibilities**:
- Translates system errors into user-friendly messages
- Provides actionable troubleshooting guidance
- Maps error patterns to specific solutions

**Key Methods**:
```javascript
class ErrorHandlerService {
  getActionableErrorMessage(error)         // Error translation
  showTroubleshootingHelp(error, logger)   // Guidance display
  createPermissionError(message)           // Permission error handler
  createFileNotFoundError(message)         // File error handler
}
```

### MetadataManager Class
**File**: `/lib/sync/metadata-manager.js`

**Primary Responsibilities**:
- Tracks installed files for updates and synchronization
- Manages file checksums and modification timestamps
- Enables intelligent update detection

### UITheme Module
**File**: `/lib/installer/ui-theme.js`

**Primary Responsibilities**:
- Provides consistent terminal styling
- Manages spinner and progress indicators
- Creates branded visual elements

---

## Error Handling Strategy

### Multi-Layer Error Handling

#### 1. Operation-Level Retry Logic
```javascript
async executeWithRetry(operation, maxRetries = 3, operationName, spinner) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt === maxRetries) throw error
      
      // Exponential backoff with jitter
      const delay = Math.min(1000 * Math.pow(2, attempt - 1) + Math.random() * 100, 10000)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
```

#### 2. User-Friendly Error Messages
```javascript
getActionableErrorMessage(error) {
  const errorMappings = {
    'EACCES': 'Permission denied. Try running with elevated permissions.',
    'ENOENT': 'File not found. Check the installation path exists.',
    'ENOSPC': 'Insufficient disk space. Free up space and try again.',
    'timeout': 'Operation timed out. Try again or check system load.'
  }
  
  return errorMappings[error.code] || `${error.message}\nRun with DEBUG_INSTALLER=1 for details`
}
```

#### 3. Graceful Degradation
- Non-critical operations continue on failure
- Clear feedback about what succeeded vs. failed
- Recovery suggestions for partial failures

#### 4. Debug Support
- Comprehensive logging with DEBUG_INSTALLER=1
- Operation timing and progress tracking
- File-level operation details

### Error Categories

1. **System Errors**: Permissions, disk space, file conflicts
2. **Network Errors**: MCP server installation failures
3. **Configuration Errors**: Invalid profiles, missing dependencies
4. **User Errors**: Invalid paths, cancelled operations

---

## Development Workflow

### Typical Development Flow

1. **Project Setup**
   ```bash
   lerian-protocol install ./my-project --profile frontend
   ```

2. **Claude Code Integration**
   - Open project in Claude Code
   - Agents and commands are automatically available
   - MCP servers provide enhanced capabilities

3. **Development Process**
   - Use `@tech-writer` for documentation
   - Use `/code-improve` for refactoring
   - Use `/ui-validate` for visual testing
   - Hooks automatically handle formatting and testing

4. **Quality Assurance**
   - Visual validation with Playwright MCP
   - Automated testing through hooks
   - Code quality checks on every edit

### Integration Points

#### Git Integration
- Automatic .gitignore updates
- Git safety hooks prevent destructive operations
- Branch-aware development workflows

#### CI/CD Ready
- Hooks can be adapted for CI/CD pipelines
- Quality gates align with build processes
- Documentation generation integrates with deployment

#### Team Collaboration
- Consistent agent behavior across team members
- Shared command vocabulary
- Standardized development practices

### Extensibility

#### Adding New Profiles
1. Create profile directory structure
2. Add profile-specific agents and commands
3. Update filtering logic in installer
4. Add profile-specific settings generation

#### Custom Agents
1. Create agent markdown file
2. Follow agent specification format
3. Add to appropriate domain directory
4. Include in installation filtering

#### Additional MCP Servers
1. Add server configuration to .mcp.json
2. Document server capabilities
3. Create integration commands if needed
4. Update installation documentation

---

## Performance Considerations

### File Operations
- Atomic file operations with temporary files
- Batch directory creation before file copying
- Progress feedback without blocking operations

### Memory Management
- Stream-based file copying for large assets
- Lazy loading of configuration files
- Cleanup of temporary files on completion

### Network Operations
- Timeout handling for MCP server installations
- Retry logic for network-dependent operations
- Offline fallback for optional components

---

## Security Considerations

### File System Security
- Path validation prevents directory traversal
- Permission checking before file operations
- Safe handling of executable files (hooks)

### Hook Security
- Hooks are installed with appropriate permissions
- No automatic execution of arbitrary scripts
- Clear documentation of hook capabilities

### Configuration Security
- Sensitive data excluded from .gitignore automatically
- MCP server configurations follow security best practices
- Permission restrictions in Claude Code settings

---

This architecture provides a robust, scalable foundation for AI-powered development environments, with clear separation of concerns, comprehensive error handling, and extensible design patterns that support both individual developers and team workflows.