---
allowed-tools: Glob(*), Read(*), Grep(*), LS(*)
description: Comprehensive codebase analysis to understand architecture, patterns, and project structure
argument-hint: [--target=<directory-or-component>]
---

# /shared:documentation:analyze-codebase

<instructions>
I'll analyze your entire application to understand its architecture, patterns, and how everything works together.

## Analysis Objectives

- Understand project type and main technologies
- Map architecture patterns (MVC, microservices, etc.)
- Document directory structure and organization
- Identify dependencies and external integrations
- Assess build and deployment setup
- Provide comprehensive understanding of how the application works

## Target Focus

When `--target` argument is provided, focus analysis on the specified directory or component while maintaining context of the overall system architecture.
</instructions>

<process>
## Analysis Process

### Phase 1: Project Discovery

Using native tools for comprehensive analysis:

- **Glob** to map entire project structure
- **Read** key files (README, docs, configs)
- **Grep** to identify technology patterns
- **Read** entry points and main files

Discovery focus areas:

- Project type and main technologies
- Architecture patterns (MVC, microservices, etc.)
- Directory structure and organization
- Dependencies and external integrations
- Build and deployment setup

### Phase 2: Code Architecture Analysis

**Entry points**: Main files, index files, app initializers
**Core modules**: Business logic organization
**Data layer**: Database, models, repositories
**API layer**: Routes, controllers, endpoints
**Frontend**: Components, views, templates
**Configuration**: Environment setup, constants
**Testing**: Test structure and coverage

### Phase 3: Pattern Recognition

Identify established patterns:

- Naming conventions for files and functions
- Code style and formatting rules
- Error handling approaches
- Authentication/authorization flow
- State management strategy
- Communication patterns between modules

### Phase 4: Dependency Mapping

- Internal dependencies between modules
- External library usage patterns
- Service integrations
- API dependencies
- Database relationships
- Asset and resource management

### Phase 5: Integration Points Analysis

Identify how components interact:

- API endpoints and their consumers
- Database queries and their callers
- Event systems and listeners
- Shared utilities and helpers
- Cross-cutting concerns (logging, auth)
  </process>

<formatting>
## Output Format

```
PROJECT OVERVIEW
├── Architecture: [Type]
├── Main Technologies: [List]
├── Key Patterns: [List]
└── Entry Point: [File]

COMPONENT MAP
├── Frontend
│   └── [Structure]
├── Backend
│   └── [Structure]
├── Database
│   └── [Schema approach]
└── Tests
    └── [Test strategy]

KEY INSIGHTS
- [Important finding 1]
- [Important finding 2]
- [Unique patterns]
```

### Detailed Analysis Sections

When analysis reveals complex systems, provide structured breakdown of:

**Technology Stack Analysis**

- Primary languages and frameworks
- Key dependencies and their purposes
- Development and build tools
- Testing frameworks and strategies

**Architecture Pattern Documentation**

- Overall architectural style (monolith, microservices, etc.)
- Design patterns in use (MVC, Observer, etc.)
- Data flow patterns
- Error handling strategies

**Component Relationship Mapping**

- How major components communicate
- Dependency injection patterns
- Event flow and messaging
- Shared state management

**Configuration and Environment Analysis**

- Environment variable usage
- Configuration file structure
- Deployment-specific settings
- Feature flags and toggles
  </formatting>

<context>
## Analysis Depth Considerations

**For Large Codebases:**
When the analysis reveals a large and complex system, I'll create a todo list to explore specific areas in detail, allowing for focused deep-dives into:

- Specific domain areas
- Complex integration points
- Performance-critical components
- Security implementations

**Mental Model Creation:**
The goal is to provide you with a complete mental model of how your application works, including:

- How data flows through the system
- Where business logic is implemented
- How components are structured and interact
- What patterns and conventions are followed
- Where key configurations and settings live

**Practical Application:**
This analysis serves as the foundation for:

- Understanding existing code before making changes
- Identifying areas for refactoring or improvement
- Planning new feature implementations
- Onboarding new team members
- Documentation and knowledge transfer
  </context>
