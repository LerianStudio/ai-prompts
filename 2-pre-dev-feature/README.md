# 2-pre-dev-feature: Streamlined Feature Development Workflow

## Overview

The **2-pre-dev-feature** workflow is designed for rapid feature development within existing products. This streamlined 4-phase process assumes established architecture and focuses on efficient integration rather than foundational design.

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

### 🔍 Phase 0: Complexity Assessment (NEW - 15-30 minutes)
**File:** Handled by `0-feature-orchestrator.mdc`

**Purpose:** Evaluate feature complexity to determine optimal workflow path

**Key Activities:**
- Analyze feature scope and integration requirements
- Search Memory MCP for similar past features
- Propose adapted workflow (Simple/Medium/Complex)
- Get user approval for workflow structure

**Adaptive Paths:**
- **Simple (1-2 days):** Merge phases for speed
- **Medium (3-5 days):** Standard 4-phase workflow
- **Complex (5+ days):** Add architecture review phase

### 🚀 Phase 1: Feature Brief (Complexity-Scaled)
**File:** `1-feature-brief.mdc`

**Purpose:** Capture requirements with appropriate depth

**Key Outputs:**
- User stories and acceptance criteria
- Integration points with existing features
- **[NEW]** Risk assessment for complex features
- **[NEW]** Pattern references from similar features
- Scope boundaries and assumptions

**User Interaction:** Required - questions scaled to complexity (1-7 based on assessment)

### 🔧 Phase 2: Technical Approach (With Estimates)  
**File:** `2-technical-approach.mdc`

**Purpose:** Define implementation strategy with cost analysis

**Key Outputs:**
- Architecture integration strategy
- **[NEW]** Cost estimates for each approach
- **[NEW]** Pattern reuse opportunities
- **[NEW]** Multiple options for complex features
- Technology choices within existing stack

**User Interaction:** Required for medium/complex, optional for simple

### 📝 Phase 3: Implementation Plan (Deliverable-Focused)
**File:** `3-implementation-plan.mdc`

**Purpose:** Define deliverables and decompose into work units

**Key Outputs:**
- **[NEW]** Hierarchical deliverable structure
- **[NEW]** Flexible task sizing (2-8 hours)
- Work units demonstrating measurable progress
- Complete git workflow for each deliverable
- Integration specifications

**User Interaction:** Optional - scaled to complexity

### 🧪 Phase 4: Test Strategy (Acceptance-Linked)
**File:** `4-test-strategy.mdc`

**Purpose:** Define test coverage directly from acceptance criteria

**Key Outputs:**
- **[NEW]** Direct mapping to acceptance criteria
- **[NEW]** Risk-based test prioritization
- **[NEW]** Reusable test pattern references
- Feature-specific test coverage targets
- Performance and security thresholds

**User Interaction:** Required for complex, optional for simple/medium

## Key Advantages

### ⚡ Speed
- **Adaptive workflow** adjusts to feature complexity
- **1-2 days** for most features (vs 1-2 weeks)
- **Pattern reuse** accelerates implementation

### 🎯 Smart Adaptation
- **[NEW] Complexity assessment** guides workflow depth
- **[NEW] Flexible phase structure** merges/expands as needed
- **[NEW] Agent discretion points** for autonomous optimization

### 📏 Enhanced Planning
- **[NEW] Deliverable-focused** rather than task-focused
- **[NEW] Cost estimates** for informed decisions
- **[NEW] Direct acceptance criteria mapping** for tests

### 🤖 AI-Optimized
- **[NEW] Pattern matching** from past implementations
- **[NEW] Risk-based prioritization** for complex features
- **[NEW] Hierarchical task decomposition** for clarity

## Tool Integration

### 🧩 Memory MCP Integration
All phases include comprehensive Memory MCP integration:
- **Context Retrieval:** Access existing product decisions and patterns
- **Decision Storage:** Store feature choices for future reference
- **Pattern Building:** Learn from successful integration approaches
- **Knowledge Continuity:** Maintain context across development sessions

### 🧠 Zen MCP Integration (NEW)
Enhanced analysis and validation throughout:
- **`thinkdeep`:** Complex decision analysis and alternative exploration
- **`analyze`:** Codebase pattern identification and architecture review
- **`codereview`:** Approach validation and quality assurance
- **`chat`:** Collaborative brainstorming and idea validation

### 🚀 Task Tool Usage (NEW)
Efficient parallel exploration:
- **Pattern Search:** Find similar implementations across codebase
- **Comprehensive Results:** Parallel search reduces context usage
- **Example Discovery:** Learn from existing successful patterns
- **Reduced Tokens:** More efficient than sequential searches

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

# 4. Test Strategy (Required user interaction)
claude 2-pre-dev-feature/4-test-strategy.mdc
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
├── features/
│   └── test-plan-[feature-name].md      # Feature-specific test strategy  
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
| **Phases** | 4 | 6 |
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

## Recent Enhancements Summary

### 🚀 What's New
1. **Complexity Assessment Phase** - Automatically evaluates feature scope and adapts workflow
2. **Flexible Phase Structure** - Merges or expands phases based on complexity
3. **Deliverable-Focused Planning** - Shifts from tasks to outcomes
4. **Enhanced MCP Integration** - Better pattern matching and reuse
5. **Agent Discretion Points** - [FLEX], [ADAPT], [OPTIMIZE] markers for autonomous decisions

### 💡 Key Improvements
- **Risk Assessment** integrated into Feature Brief for complex features
- **Cost Estimates** in Technical Approach for informed decisions  
- **Pattern References** throughout for faster implementation
- **Acceptance Criteria Mapping** in Test Strategy for complete coverage
- **Hierarchical Task Structure** for better work organization
- **Zen MCP Integration** for deeper analysis and validation
- **Task Tool Usage** for efficient pattern discovery

### 🎯 Result
This enhanced workflow provides the perfect balance of structure, flexibility, and speed for feature development within established systems. The adaptive approach ensures appropriate depth without over-engineering, while the combination of Memory MCP, Zen MCP, and Task tool accelerates delivery through:
- **Intelligent Pattern Reuse** - Learn from past implementations
- **Deep Analysis** - Uncover non-obvious requirements and risks
- **Efficient Search** - Parallel exploration reduces time and tokens
- **Validated Approaches** - Multiple perspectives ensure quality