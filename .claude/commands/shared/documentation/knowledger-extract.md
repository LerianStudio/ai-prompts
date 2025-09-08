---
allowed-tools: Read(*), Glob(*), Grep(*), Bash(*), Write(*), Task(*)
description: Extract and document domain knowledge, business logic, and architectural patterns from codebases
argument-hint: [--path=<file-or-directory-path>] [--git-scope=<scope>]
---

# /shared:documentation:knowledger-extract

<instructions>
Extract and document domain knowledge, business logic, and architectural patterns from the specified codebase.

## Usage Options

### Git-focused knowledge extraction (recommended for active development)

```bash
/shared:documentation:knowledger-extract --git-scope=all-changes         # Extract knowledge from changed areas
/shared:documentation:knowledger-extract --git-scope=branch              # Extract knowledge from feature branch
/shared:documentation:knowledger-extract --git-scope=staged              # Extract knowledge from staged changes
/shared:documentation:knowledger-extract --git-scope=last-commit         # Extract knowledge from last commit
```

### Traditional path-based extraction

```bash
/shared:documentation:knowledger-extract --path=src/                     # Extract from specific directory
/shared:documentation:knowledger-extract --path=src/models/              # Extract from models directory
/shared:documentation:knowledger-extract                                 # Extract from current directory
```

## Arguments

- `--path`: File or directory path to analyze (optional, defaults to current directory)
- `--git-scope`: Git scope for focusing knowledge extraction on specific changes - staged|unstaged|all-changes|branch|last-commit|commit-range=<range>

## Git-Scope Benefits

- **Contextual Knowledge**: Focus on knowledge in areas you're actively developing
- **Change Documentation**: Extract knowledge from newly implemented features or changes
- **Incremental Learning**: Build knowledge base alongside code development
- **Relevant Insights**: Avoid information overload from full-codebase analysis
  </instructions>

<process>
## Knowledge Extraction Process

### Initial Setup (when --git-scope used)

If `--git-scope` is specified:

```bash
# Source git utilities
if ! source .claude/utils/git-utilities.sh; then
    echo "Error: Could not load git utilities. Please ensure git-utilities.sh exists." >&2
    exit 1
fi

# Process git scope (this function handles validation, stats, and file listing)
target_files=$(process_git_scope "$git_scope")
```

### 1. Codebase Analysis

- Scan project structure to understand organization
- Identify main modules, packages, and entry points
- Map data flow and component relationships
- Locate configuration and environment files

### 2. Domain Model Discovery

#### Core Entities and Types

```bash
# Find domain models and entities
rg "class|interface|type.*=" --type ts --type js
rg "enum|const.*=" --type ts --type js

# Look for data transfer objects
rg "DTO|Request|Response|Model|Entity" --type ts --type js
```

#### Business Logic Patterns

```bash
# Find service layers and business logic
rg "Service|Handler|Controller|Manager|Repository" -A 3 -B 1
rg "impl.*for|func.*\(|public.*class" -A 5

# Identify validation rules and constraints
rg "validate|verify|check|ensure|require" -A 2 -B 1
```

### 3. API and Interface Documentation

#### REST Endpoints

```bash
# Find HTTP routes and handlers
rg "GET|POST|PUT|DELETE|PATCH" --type ts --type js
rg "Route|Path|Endpoint|@.*Mapping" -A 2 -B 1

# Look for OpenAPI/Swagger definitions
fd "openapi|swagger" --type f
rg "openapi|swagger" --type yaml --type json
```

#### RPC and Internal APIs

```bash
# Find gRPC/ConnectRPC services (preferred)
rg "service|rpc|proto" --type proto
fd "*.proto" --type f

# Find internal service interfaces
rg "trait|interface.*Service|interface.*Handler" -A 5
```

### 4. Data Architecture

#### Database Schema

```bash
# Find migration files and schema definitions
fd "migration|schema" --type f
rg "CREATE TABLE|ALTER TABLE|DROP TABLE" --type sql
rg "Migration|migration" -A 3 -B 1

# Look for ORM models and queries
rg "Model|Entity|@Table|@Column" -A 2
rg "SELECT|INSERT|UPDATE|DELETE" --type sql
```

#### Data Flow Patterns

```bash
# Find data transformation and mapping
rg "map|transform|convert|serialize|deserialize" -A 2 -B 1
rg "JSON.parse|JSON.stringify" --type ts --type js
rg "yaml:|toml:" --type ts --type js
```

### 5. Business Rules and Workflows

#### State Machines and Workflows

```bash
# Find state management and transitions
rg "State|Status|Phase|Stage" -A 3 -B 1
rg "match.*{|switch.*{|if.*state" -A 5

# Look for workflow engines or state machines
rg "workflow|state.*machine|transition|step" -A 2
```

#### Business Logic Patterns

```bash
# Find domain-specific calculations and rules
rg "calculate|compute|process|apply|execute" -A 3 -B 1
rg "business|domain|rule|policy|strategy" -A 2 -B 1

# Look for feature flags and conditional logic
rg "feature.*flag|toggle|enable|disable" -A 2
```

### 6. Configuration and Environment

#### Application Configuration

```bash
# Find configuration structures and defaults
rg "Config|Settings|Options" -A 5 -B 1
rg "default|DefaultConfig|default.*=" -A 3

# Look for environment variable usage
rg "env|ENV|getenv|std::env" -A 1 -B 1
fd ".env*" --type f
```

#### Infrastructure Configuration

```bash
# Find deployment and infrastructure configs
fd "docker|k8s|kubernetes|terraform" --type d
fd "Dockerfile|docker-compose|*.yaml|*.yml" --type f
rg "image:|port:|volume:|secret:" --type yaml
```

### 7. Error Handling and Monitoring

#### Error Patterns

```bash
# Find error definitions and handling
rg "Error|Exception|Err|Result" -A 2 -B 1
rg "try|catch|unwrap|expect|panic" -A 1 -B 1

# Look for error codes and messages
rg "error.*code|error.*message|status.*code" -A 1
```

#### Logging and Observability

```bash
# Find logging and metrics
rg "log|info|warn|error|debug|trace" -A 1
rg "metric|counter|gauge|histogram" -A 1
rg "span|trace|opentelemetry" -A 1
```

### 8. Testing Patterns and Examples

#### Test Structure

```bash
# Find test patterns and examples
fd "test|spec" --type d
rg "test|Test|spec|Spec|describe|it" --type ts --type js -A 2

# Look for test data and fixtures
fd "fixture|mock|stub|testdata" --type f
rg "mock|stub|fake|test.*data" -A 1
```

#### Integration Examples

```bash
# Find integration and end-to-end tests
rg "integration|e2e|end.*to.*end" -A 3
rg "client|api.*test|http.*test" -A 2
```

</process>

<deliverables>
## Knowledge Artifacts

### Generated Documentation Files

- `docs/architecture.md` - High-level system design
- `docs/domain-model.md` - Business entities and relationships
- `docs/api-reference.md` - API endpoints and usage
- `docs/development-guide.md` - Developer workflows and patterns
- `docs/deployment.md` - Infrastructure and deployment processes

### Decision Records

- Document architectural decisions (ADRs)
- Explain technology choices and trade-offs
- Record domain modeling decisions

### Code Examples

- Common usage patterns and idioms
- Integration examples and recipes
- Error handling best practices

### Output Deliverables

- Comprehensive domain model documentation
- API reference with examples
- Architecture diagrams and explanations
- Developer onboarding guide
- Business logic and workflow documentation
- Configuration and deployment guides
- Testing patterns and examples
- Troubleshooting and debugging guides
  </deliverables>

<formatting>
## Documentation Synthesis

### Architecture Overview Template

```markdown
# Architecture Overview

## Core Domains

- [List main business domains and entities]

## Service Architecture

- [Describe service layers and boundaries]

## Data Flow

- [Document how data moves through the system]

## Key Patterns

- [Identify recurring design patterns]
```

### Developer Guide Template

```markdown
# Developer Guide

## Getting Started

- [Key entry points and main files]

## Domain Concepts

- [Business terminology and concepts]

## Common Operations

- [Typical development tasks and workflows]

## Testing Strategy

- [How to write and run tests]
```

</formatting>

<context>
## Follow-up Actions

### Knowledge Validation

- Review extracted knowledge with domain experts
- Update documentation based on feedback
- Create knowledge documentation
- Set up documentation maintenance processes

### Integration Workflows

- Integrate with onboarding workflow (`/project:onboard`)
- Connect to architecture documentation processes
- Link to code review and development workflows
- Establish knowledge sharing practices

### Maintenance Strategy

- Set up automated knowledge extraction pipelines
- Create processes for keeping documentation current
- Establish review cycles for domain knowledge updates
- Train team on knowledge extraction and documentation practices
  </context>
