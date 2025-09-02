# Agents - Domain-Organized Specialists

This directory contains specialized Claude agent definitions organized by development domain (frontend, backend, shared) for targeted expertise and workflow optimization.

## Purpose

The agents folder provides domain-specific AI specialists for:

- **Frontend Development** - React components, UI/UX design, visual validation with Playwright
- **Backend Development** - APIs, databases, server architecture, performance optimization
- **Cross-Domain Tasks** - Documentation, project management, code quality, user stories

## Domain Organization

```
agents/
├── frontend/           # Frontend-specific agents
│   ├── frontend-developer.md          # React & TypeScript specialist
│   ├── ui-ux-specialist.md           # Design-first development
│   ├── react-state-management.md     # State management patterns
│   ├── react-performance-optimization.md  # Performance tuning
│   └── playwright-validator.md       # Visual testing & validation
├── shared/             # Cross-domain agents  
│   ├── tech-writer.md                # Documentation specialist
│   ├── todo-manager.md               # Task management & planning
│   ├── user-story-generator.md       # Agile story creation
│   └── task-breakdown-specialist.md  # Complex task decomposition
└── backend/            # Backend-specific agents (structure ready)
    └── [Backend agents to be added based on profile needs]
```

## Agent Capabilities

### Frontend Agents
- **Component Development** - React components with TypeScript, hooks, and modern patterns
- **Visual Design** - UI/UX specifications and design-first development
- **State Management** - Redux, Context API, Zustand, and performance patterns
- **Visual Testing** - Playwright automation for screenshot validation

### Shared Agents
- **Technical Writing** - API docs, architecture guides, user documentation
- **Project Management** - TodoWrite integration, task breakdown, sprint planning
- **Story Creation** - User story generation following agile methodologies
- **Task Planning** - Complex feature breakdown into manageable development tasks

### Agent Coordination

Agents work together through:
- **Multi-agent handoffs** with context preservation
- **TodoWrite integration** for task tracking across agents
- **Domain expertise** that prevents overlap and ensures quality
- **Claude Code native integration** with slash commands and hooks

## Usage Patterns

### UI Development Flow
1. `ui-ux-specialist` → Creates design specifications
2. `frontend-developer` → Implements React components  
3. `playwright-validator` → Validates visual implementation
4. `todo-manager` → Tracks progress and completion

### Documentation Flow
1. `tech-writer` → Creates comprehensive documentation
2. `user-story-generator` → Generates development stories
3. `task-breakdown-specialist` → Creates implementation tasks

## Integration with Lerian Protocol

These agents integrate seamlessly with:
- **MCP Servers** - Context7, Playwright, Fetch, Shadcn for enhanced capabilities
- **Profile Installation** - Domain-specific agents installed based on project needs
- **Protocol Assets** - Leverage domain-specific workflows and standards
- **Claude Code Hooks** - Automated quality checks and formatting

## Getting Started

1. **Choose Domain**: Select agents based on your development focus
2. **Use Slash Commands**: Access agents through Claude Code's native @ syntax
3. **Combine Workflows**: Use multiple agents for complex multi-step tasks
4. **Track Progress**: Agents integrate with TodoWrite for task management

Example usage:
```
@frontend-developer create a user dashboard component
@playwright-validator test the new dashboard component
@tech-writer document the dashboard API integration
```
