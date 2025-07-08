# Pre-Development Product Workflow

## Overview

The Pre-Development Product workflow is a comprehensive 5-phase system that transforms product ideas into implementation-ready atomic subtasks. It employs a **revolving cycle approach** with validation gates between each phase to ensure quality and prevent cascade failures.

## Architecture

### 5-Phase Structure

```
1. PRD (Product Requirements) → Gate 1 → 
2. TRD (Technical Requirements) → Gate 2 → 
3. Dependency Map → Gate 3 → 
4. Tasks → Gate 4 → 
5. Subtasks → Gate 5 → Implementation Ready
```

### Key Design Principles

1. **Separation of Concerns**: Business requirements (PRD) are strictly separated from technical implementation (TRD)
2. **Confidence-Based Execution**: AI agents adjust their interaction model based on confidence scores (80%+ autonomous, 50-79% options, <50% guidance)
3. **Zero-Context Subtasks**: Final outputs are atomic units requiring no system knowledge
4. **Mandatory Gate Validation**: All 5 gates are mandatory - each phase must pass its quality gate before proceeding

## File Structure

```
1-pre-dev-product/
├── 0-pre-dev-orchestrator.mdc    # Entry point - manages workflow execution
├── 1-create-prd.mdc              # Business requirements (WHAT/WHY)
├── 2-create-trd.mdc              # Technical architecture (HOW/WHERE)
├── 3-create-dependency-map.mdc   # Technology choices & dependencies
├── 4-create-tasks.mdc            # Macro implementation units
├── 5-create-subtasks.mdc         # Atomic, zero-context work items
└── README.md                     # This file
```

## Phase Details

### Phase 1: PRD - Product Requirements Document

**Purpose**: Capture business vision, user needs, and feature requirements without technical details.

**Key Components**:
- Executive Summary
- Problem Definition
- User Personas & Stories
- Feature Requirements (business-focused)
- Success Metrics
- Scope & Constraints

**Gate 1 Validation**:
- Problem clearly articulated
- Users specifically identified
- Success metrics measurable
- Business case sound

**Confidence Scoring**:
- Market Validation (0-25)
- Problem Clarity (0-25)
- Solution Fit (0-25)
- Business Value (0-25)

### Phase 2: TRD - Technical Requirements Document

**Purpose**: Translate business requirements into technical architecture without specifying implementation.

**Key Components**:
- System Architecture (style: Microservices, Modular Monolith, Serverless)
- Component Design
- Data Architecture
- API Design
- Security Architecture
- Integration Patterns

**Gate 2 Validation**:
- All PRD features mapped to components
- Component boundaries clear
- Quality attributes achievable
- Integration patterns selected

**Architecture Options**:
- Hexagonal Architecture (with specific folder structure)
- Modular Monolith approach
- Event-Driven patterns

### Phase 3: Dependency Map

**Purpose**: Make concrete technology decisions and map all dependencies.

**Key Components**:
- Technology Stack (Go 1.24+/Fiber v2, PostgreSQL 16, Valkey 8, MinIO)
- Core Dependencies per component
- Infrastructure Map
- Development Environment
- Security Dependencies
- Version Constraints

**Gate 3 Validation**:
- All dependencies compatible
- No critical vulnerabilities
- Team has expertise
- Costs acceptable

**Tech Stack Defaults**:
```yaml
Core Stack:
  Language: Go 1.24+
  Framework: Fiber v2.52+
  Architecture: Hexagonal
  Approach: Modular Monolith

Infrastructure:
  Database: PostgreSQL 16
  Cache: Valkey 8
  Object Storage: MinIO
  Logging: Zap (Go)
  Security Scan: Dependabot
```

### Phase 4: Tasks

**Purpose**: Break down technical solution into macro implementation units delivering working increments.

**Key Components**:
- Task Overview (ID, Type, Priority, Size)
- Deliverables & Scope
- Success Criteria
- Dependencies & Sequencing
- Effort Estimates (S/M/L/XL)
- Testing Strategy

**Gate 4 Validation**:
- All TRD components covered
- Each task delivers value
- Dependencies mapped correctly
- Success criteria measurable

**Task Categories**:
- Foundation (database, core services)
- Feature (user-facing functionality)
- Integration (third-party services)
- Polish (optimization, refinements)

### Phase 5: Subtasks

**Purpose**: Decompose tasks into atomic, self-contained units requiring zero context.

**Key Components**:
- Complete code/configuration
- All file paths explicit
- Step-by-step instructions
- Verification commands
- Success criteria
- Rollback procedures

**Gate 5 Validation**:
- Each subtask <4 hours
- Zero context required
- All code complete
- Success measurable

**Subtask Pattern**:
```markdown
Prerequisites → Implementation Steps → Verification → Success Criteria → Rollback Plan
```

## Workflow Execution

### Starting the Workflow

```bash
# Start with memory context retrieval
claude 0-memory-system/m0-memory-orchestrator.mdc

# Begin pre-development workflow
claude 1-pre-dev-product/0-pre-dev-orchestrator.mdc
```

### Gate Processing

All 5 gates are mandatory validation checkpoints. Each gate represents a quality checkpoint:
- **PASS**: Proceed to next phase
- **CONDITIONAL**: Address specific issues before proceeding
- **FAIL**: Return to previous phase for revision

**The 5 Mandatory Gates**:
1. **Gate 1** - Business Validation (after PRD)
2. **Gate 2** - Technical Feasibility (after TRD)
3. **Gate 3** - Stack Validation (after Dependency Map)
4. **Gate 4** - Implementation Readiness (after Tasks)
5. **Gate 5** - Deployment Readiness (after Subtasks)

### Confidence-Based Flow

The system adapts based on confidence scores:

1. **High Confidence (80%+)**: AI proceeds autonomously using proven patterns
2. **Medium Confidence (50-79%)**: AI presents options for user selection
3. **Low Confidence (<50%)**: AI requests additional information

## MCP Tool Integration

### Memory MCP
- **Search**: Find patterns, similar products, architectural decisions
- **Store**: Save decisions, requirements, learnings
- **Retrieve**: Get proven solutions, user feedback patterns

### Sequential Thinking MCP
- Break down complex problems
- Explore alternatives systematically
- Handle revision and branching

### Zen MCP Tools
- **thinkdeep**: Complex analysis and trade-offs
- **analyze**: System design and patterns
- **planner**: Task breakdown and dependencies
- **codereview**: Validate approaches
- **testgen**: Generate test cases

## Folder Structures

### Documentation Output Structure

All workflow outputs are organized under `docs/pre-development/`:

```
docs/
└── pre-development/
    ├── prd/
    │   └── prd-[feature-name].md
    ├── trd/
    │   └── trd-[feature-name].md
    ├── dependencies/
    │   └── dep-map-[feature-name].md
    ├── tasks/
    │   └── tasks-[feature-name].md
    └── subtasks/
        └── T-[task-id]/
            ├── ST-[task-id]-01-[description].md
            ├── ST-[task-id]-02-[description].md
            └── ...
```

### Implementation Folder Structure (Hexagonal Architecture)

The actual project code follows the hexagonal architecture pattern defined in the Dependency Map:

```
src/
├── adapters/        # External interfaces (HTTP, gRPC, DB)
├── application/     # Use cases and business rules
├── bootstrap/       # App initialization and config
├── config/          # Configuration management
├── domain/          # Core business entities
└── infrastructure/  # External service implementations
```

**Note**: These are two separate folder structures:
- Documentation outputs go in `docs/pre-development/`
- Implementation code follows hexagonal architecture in `src/`

## Quality Assurance

### Consistency Audit Results

✅ **Strengths**:
1. Clear separation of concerns between phases
2. Consistent gate validation pattern
3. Progressive refinement from business to technical
4. Well-defined confidence scoring mechanisms
5. Comprehensive MCP tool integration

⚠️ **Areas for Attention**:
1. Ensure technology choices in Dependency Map align with TRD patterns
2. Maintain consistency in effort estimation between Tasks and Subtasks
3. Validate that atomic subtasks truly require zero context

### Best Practices

1. **Always start with Memory MCP** to leverage existing patterns
2. **Respect phase boundaries** - don't mix concerns
3. **Use confidence scores** to guide interaction model
4. **Validate at gates** before proceeding
5. **Keep subtasks atomic** - <4 hours, zero context
6. **Store learnings** back to Memory MCP

## Common Patterns

### For Web Applications
```
PRD → API-First TRD → Fiber v2 + PostgreSQL → Feature Tasks → Atomic Endpoints
```

### For Microservices
```
PRD → Domain-Driven TRD → Service Boundaries → Integration Tasks → Service Subtasks
```

### For Modular Monoliths
```
PRD → Hexagonal TRD → Module Structure → Domain Tasks → Module Subtasks
```

## Troubleshooting

### Gate Failures
- **Gate 1**: Return to user research and problem validation
- **Gate 2**: Revisit architecture patterns and component boundaries
- **Gate 3**: Check dependency compatibility and team expertise
- **Gate 4**: Refine task breakdown and dependencies
- **Gate 5**: Ensure true atomicity and completeness

### Low Confidence Scores
- Search Memory MCP for similar patterns
- Break down problem into smaller pieces
- Request specific user input on unknowns
- Consider alternative approaches

## Gate Clarification

**Important**: All 5 gates are mandatory validation checkpoints:
- Each phase produces outputs that must be validated
- Gates ensure quality before progression
- No phase can be skipped
- Gate failures require returning to the previous phase
- This creates a quality-assured progressive refinement process

## Version History

- **v2.0**: Current - 5-phase structure with 5 mandatory gates
- **v1.0**: Legacy - 6-phase with less separation of concerns

## Related Workflows

- `0-memory-system/`: Persistent knowledge management
- `2-pre-dev-feature/`: Streamlined feature addition
- `3-frontend/`: Frontend development workflow
- `4-code-review/`: Systematic code analysis
- `5-generate-docs/`: Documentation generation