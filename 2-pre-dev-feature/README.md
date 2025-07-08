# Pre-Development Feature Workflow

## Overview

The Pre-Development Feature workflow is a streamlined 4-phase system designed for adding features to existing products. It leverages existing architecture and patterns to accelerate development while maintaining quality through validation gates.

## Architecture

### 4-Phase Structure

```
1. Feature Brief → Gate 1 → 
2. Technical Design → Gate 2 → 
3. Implementation Plan → Gate 3 → 
4. Subtasks → Gate 4 → Implementation Ready
```

### Key Design Principles

1. **Context Awareness**: Leverages existing product architecture and patterns
2. **Integration Focus**: Emphasizes seamless integration with existing features
3. **Streamlined Process**: 4 phases instead of 5 (no separate dependency phase)
4. **Mandatory Gate Validation**: All 4 gates are mandatory quality checkpoints
5. **Zero-Context Output**: Final subtasks require no system knowledge

## File Structure

```
2-pre-dev-feature/
├── 0-feature-orchestrator.mdc    # Entry point - manages workflow execution
├── 1-create-feature-brief.mdc    # Feature definition (WHAT/WHY)
├── 2-create-technical-design.mdc # Integration approach (HOW)
├── 3-create-implementation-plan.mdc # Task breakdown
├── 4-create-subtasks.mdc         # Atomic work units
└── README.md                     # This file
```

## Phase Details

### Phase 1: Feature Brief

**Purpose**: Define the feature and its value proposition within the existing product context.

**Key Components**:
- Feature description and user value
- Integration with existing features
- Success metrics
- Scope boundaries
- Rollout strategy

**Gate 1 Validation**:
- Feature aligns with product vision
- User value clearly defined
- Integration points identified
- Success metrics measurable

**Output**: `/docs/pre-development/features/briefs/feature-[name].md`

### Phase 2: Technical Design

**Purpose**: Design how the feature integrates with existing architecture without breaking current functionality.

**Key Components**:
- Component modifications
- API changes with backwards compatibility
- Data model updates
- Integration patterns
- Performance impact analysis

**Gate 2 Validation**:
- Integration approach sound
- No unmanaged breaking changes
- Performance impact acceptable
- Security maintained

**Output**: `/docs/pre-development/features/designs/design-[feature-name].md`

### Phase 3: Implementation Plan

**Purpose**: Break down the integration work into manageable tasks with clear dependencies.

**Key Components**:
- Task definitions with dependencies
- Phased implementation approach
- Testing strategy
- Rollback procedures
- Resource allocation

**Gate 3 Validation**:
- All integration work captured
- Dependencies clearly mapped
- Rollback strategy comprehensive
- Timeline realistic

**Output**: `/docs/pre-development/features/plans/plan-[feature-name].md`

### Phase 4: Subtasks

**Purpose**: Create atomic, zero-context work units that can be executed independently.

**Key Components**:
- Complete implementation steps
- Before/after code for modifications
- Verification procedures
- Rollback instructions
- Integration safety checks

**Gate 4 Validation**:
- Each subtask <4 hours
- Zero context required
- Rollback plan included
- Integration safe

**Output**: `/docs/pre-development/features/subtasks/F-[id]/T-F-[id]/ST-F[id]-XX-XX-[description].md`

## Workflow Execution

### Starting the Workflow

```bash
# Load product context first
claude 0-memory-system/m0-memory-orchestrator.mdc

# Begin feature development
claude 2-pre-dev-feature/0-feature-orchestrator.mdc
```

### Context Loading

The feature workflow always starts by loading:
1. Current product architecture
2. Existing feature set
3. Technology stack and patterns
4. Team conventions

This context informs all subsequent phases.

### Gate Processing

All 4 gates are mandatory validation checkpoints:
- **PASS**: Proceed to next phase
- **CONDITIONAL**: Address specific issues before proceeding
- **FAIL**: Return to previous phase for revision

**The 4 Mandatory Gates**:
1. **Gate 1** - Feature Validation (after Feature Brief)
2. **Gate 2** - Technical Validation (after Technical Design)
3. **Gate 3** - Implementation Readiness (after Implementation Plan)
4. **Gate 4** - Deployment Readiness (after Subtasks)

### Confidence-Based Flow

The system adapts based on confidence scores:

1. **High Confidence (80%+)**: Similar features exist, proceed autonomously
2. **Medium Confidence (50-79%)**: Present integration options for selection
3. **Low Confidence (<50%)**: Request additional context and guidance

## Folder Structures

### Documentation Output Structure

```
docs/pre-development/features/
├── briefs/
│   └── feature-[name].md
├── designs/
│   └── design-[feature-name].md
├── plans/
│   └── plan-[feature-name].md
└── subtasks/
    └── F-[feature-id]/
        └── T-F-[task-id]/
            ├── ST-F[id]-01-01-[description].md
            ├── ST-F[id]-01-02-[description].md
            └── ...
```

### Integration with Existing Code

Features integrate with the existing hexagonal architecture:

```
src/
├── adapters/        # API endpoints, controllers
├── application/     # Use cases, business logic
├── domain/          # Entity modifications
├── infrastructure/  # Service integrations
└── config/          # Feature flags, settings
```

## MCP Tool Integration

### Memory MCP
- **Essential**: Always starts by loading product context
- **Search**: Find similar features and patterns
- **Store**: Save integration decisions and learnings

### Sequential Thinking MCP
- Analyze integration complexity
- Break down feature impacts
- Plan migration strategies

### Zen MCP Tools
- **thinkdeep**: Complex integration analysis
- **analyze**: Impact assessment
- **planner**: Task sequencing
- **testgen**: Test generation for modifications

## Key Differences from Product Workflow

| Aspect | Product Workflow | Feature Workflow |
|--------|-----------------|------------------|
| Phases | 5 (includes dependency map) | 4 (integrated into design) |
| Context | Starts from scratch | Assumes existing system |
| Architecture | Defines new | Works within existing |
| Dependencies | Separate phase | Part of technical design |
| Risk | Higher (new system) | Lower (incremental) |
| Testing | Full suite creation | Integration focus |

## Success Metrics

- **Gate Pass Rate**: Target >90% (higher due to existing context)
- **Integration Issues**: <5% post-deployment
- **Pattern Reuse**: >80% from existing codebase
- **Time to Deploy**: 60% faster than new features

## Best Practices

1. **Always Load Context**: Start with Memory MCP to understand the product
2. **Respect Existing Patterns**: Don't reinvent what already works
3. **Plan for Rollback**: Every change must be reversible
4. **Test Incrementally**: Verify at each integration point
5. **Use Feature Flags**: For risky or large features
6. **Document Decisions**: Store integration choices in Memory MCP

## Common Integration Patterns

### Adding API Endpoints
```
1. Extend existing controllers
2. Follow current authentication
3. Match response formats
4. Version if breaking changes
```

### Modifying Data Models
```
1. Use migrations for schema changes
2. Provide default values
3. Plan data backfill if needed
4. Test rollback procedures
```

### UI Component Integration
```
1. Follow existing component patterns
2. Use current styling system
3. Implement behind feature flags
4. Plan gradual rollout
```

## Troubleshooting

### Gate Failures
- **Gate 1**: Review product-feature fit and user value
- **Gate 2**: Simplify integration approach, check for breaking changes
- **Gate 3**: Break down complex tasks, clarify dependencies
- **Gate 4**: Ensure true atomicity, add missing context

### Integration Issues
- Load more context from Memory MCP
- Review similar features for patterns
- Consider phased approach
- Add more comprehensive rollback plans

## Version History

- **v1.0**: Initial 4-phase streamlined workflow for feature additions

## Related Workflows

- `0-memory-system/`: Context and pattern storage
- `1-pre-dev-product/`: Full product development
- `3-frontend/`: Frontend-specific development
- `4-code-review/`: Code quality validation
- `5-generate-docs/`: Documentation generation