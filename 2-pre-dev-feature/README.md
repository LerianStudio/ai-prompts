# 2-pre-dev-feature: Streamlined Feature Development Workflow

## Overview

The **2-pre-dev-feature** workflow is designed for rapid feature development within existing products. This streamlined 3-phase process assumes established architecture and focuses on efficient integration rather than foundational design.

## When to Use This Workflow

### ✅ Use 2-pre-dev-feature for:
- Adding new functionality to existing products
- Enhancing existing features  
- Integration with new third-party services
- Performance improvements
- Bug fixes requiring significant changes

### ❌ Use 1-pre-dev-product instead for:
- New products or applications
- Major architectural changes
- Complete system redesigns
- New technology stack adoption
- Complex multi-feature initiatives

## Workflow Phases

### 🚀 Phase 1: Feature Brief (1-2 hours)
**File:** `1-feature-brief.mdc`

**Purpose:** Capture feature requirements and user stories quickly

**Key Outputs:**
- User stories and acceptance criteria
- Integration points with existing features
- Business priority and success metrics
- Scope boundaries and assumptions

**User Interaction:** Required - clarifying questions and brief review

### 🔧 Phase 2: Technical Approach (1-3 hours)  
**File:** `2-technical-approach.mdc`

**Purpose:** Define implementation strategy within existing architecture

**Key Outputs:**
- Architecture integration strategy
- Technology choices within existing stack
- API and database integration approach
- Performance and security considerations

**User Interaction:** Required - technical decisions and approach review

### 📝 Phase 3: Implementation Plan (2-4 hours)
**File:** `3-implementation-plan.mdc`

**Purpose:** Break down into atomic, implementable tasks with git workflow

**Key Outputs:**
- Atomic feature tasks (2-4 hours each)
- Complete git workflow for each task
- Integration specifications
- Task dependencies and sequencing

**User Interaction:** Optional - review task breakdown

## Key Advantages

### ⚡ Speed
- **3 phases** vs 5 phases (product workflow)
- **1-2 days** vs 1-2 weeks planning time
- **Focused feedback** loops with minimal overhead

### 🎯 Integration Focus
- Assumes existing architecture and patterns
- Leverages established tech stack and conventions
- Minimizes architectural risk and complexity

### 📏 Right-Sized Planning
- Sufficient structure to avoid integration issues
- Not over-engineered for iterative development
- Balances speed with quality

## Memory MCP Integration

All phases include comprehensive Memory MCP integration:

- **Context Retrieval:** Access existing product decisions and patterns
- **Decision Storage:** Store feature choices for future reference
- **Pattern Building:** Learn from successful integration approaches
- **Knowledge Continuity:** Maintain context across development sessions

## File Size Guidelines

All generated code follows LLM-optimized guidelines:
- **Target:** <300 lines per file
- **Maximum:** 500 lines per file (hard limit)
- **Strategy:** Logical splitting when approaching limits

## Git Workflow Integration

Every implementation task includes complete git workflow:

```bash
# Before starting each task
git checkout -b feature/FT-[feature-id]-[num]-[desc]

# After completing each task  
git commit -m "feat(FT-[feature-id]-[num]): [description]
Implemented: [what was built]
Integration: [how it connects]
Notes: [implementation details]"

git push -u origin feature/FT-[feature-id]-[num]-[desc]
```

## Quick Start

### Express Workflow
```bash
# 1. Feature Brief (Required user interaction)
claude 2-pre-dev-feature/1-feature-brief.mdc

# 2. Technical Approach (Required user interaction)  
claude 2-pre-dev-feature/2-technical-approach.mdc

# 3. Implementation Plan (Optional user review)
claude 2-pre-dev-feature/3-implementation-plan.mdc
```

### Full Workflow with Orchestrator
```bash
# Start with orchestrator for complete guidance
claude 2-pre-dev-feature/0-feature-orchestrator.mdc
```

## Output Organization

```
docs/pre-development/
├── feature-brief-[feature-name].md       # Feature requirements
├── tech-approach-[feature-name].md       # Implementation strategy  
└── tasks/
    └── feature-[feature-name]/           # Implementation tasks
        ├── overview.md                   # Implementation overview
        └── FT-[XX]-[task-name].md        # Individual tasks
```

## Integration with Other Workflows

### Code Review Chain
After feature implementation:
```bash
claude 2-code-review/00-code-review-orchestrator.mdc
```

### Memory Management
Throughout development:
```bash
claude 0-memory-related/m0-memory-orchestrator.mdc
```

## Success Metrics

### Speed Metrics
- Feature brief: <2 hours
- Technical approach: <3 hours  
- Implementation plan: <4 hours
- **Total planning: <1 day**

### Quality Metrics
- Features integrate seamlessly with existing system
- Implementation tasks are atomic and completable
- No major architectural disruption
- Clear path from request to implementation

## Best Practices

### For Teams
1. **Use for incremental development** - perfect for sprint-based feature development
2. **Maintain context** - leverage Memory MCP for consistency across features
3. **Review integration points** - always validate how features connect with existing system
4. **Follow git discipline** - use provided git workflow for all tasks

### For Solo Developers
1. **Quick iteration** - rapid prototyping and validation
2. **Integration confidence** - systematic approach reduces integration risk
3. **Knowledge building** - Memory MCP captures learnings for future features
4. **Quality maintenance** - structured approach maintains code quality

## Comparison with Product Workflow

| Aspect | 2-pre-dev-feature | 1-pre-dev-product |
|--------|-------------------|-------------------|
| **Phases** | 3 | 5 |
| **Planning Time** | 1 day | 1-2 weeks |
| **Documentation** | Focused | Comprehensive |
| **User Interaction** | Targeted | Extensive |
| **Architecture** | Assumes existing | Designs new |
| **Use Case** | Feature addition | Product creation |

## Troubleshooting

### Common Issues

**"Feature seems too complex for this workflow"**
- Consider using 1-pre-dev-product for major architectural changes
- Break large features into smaller, incremental features

**"Integration points are unclear"**
- Use Memory MCP to retrieve more architecture context
- Ask more specific technical questions in Phase 2

**"Tasks are too large"**
- Revisit task boundaries in Phase 3
- Aim for 2-4 hour atomic tasks
- Consider file size limits when splitting tasks

**"Feature conflicts with existing system"**
- Review existing architecture patterns in Memory MCP
- Consider technical debt or refactoring before feature development
- Validate assumptions in technical approach phase

This workflow provides the perfect balance of structure and speed for feature development within established systems.