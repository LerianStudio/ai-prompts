# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **AI Prompts for LerianStudio Ecosystem** - a comprehensive collection of AI prompts designed for complete software development lifecycle management. The repository contains 6 integrated workflow systems that work together through orchestrator patterns to support planning, development, review, and documentation.

## Core Architecture

### 6-System Workflow Architecture

```
0-memory-system/     → Cross-session learning & pattern recognition
1-pre-dev-product/   → Comprehensive planning from idea to implementation (Dynamic 4-phase, 2 checkpoints)
2-pre-dev-feature/   → Streamlined feature addition to existing products (Adaptive 4-phase)
3-frontend/          → Complete frontend development with flexible design inputs
4-code-review/       → 18-point systematic code analysis across 6 phases
5-generate-docs/     → Comprehensive documentation generation and distribution
```

### Orchestrator Pattern

Each system has a `0-*-orchestrator.mdc` entry point that manages phase execution. Key patterns:

- **Mandatory Checkpoints**: Marked with ✓ require user approval
- **Confidence-Based Execution**: Pre-Development uses AI confidence scores (80%+ = autonomous, 50-79% = options, <50% = guidance)
- **Phase Dependencies**: Later phases depend on outputs from earlier phases
- **Memory Integration**: All workflows start with context retrieval and end with knowledge storage

## Essential Commands

### Starting New Development

```bash
# Full new product workflow
claude 0-memory-system/m0-memory-orchestrator.mdc
claude 1-pre-dev-product/0-pre-dev-orchestrator.mdc
claude 3-frontend/0-frontend-orchestrator.mdc
claude 4-code-review/00-code-review-orchestrator.mdc
claude 5-generate-docs/0-docs-orchestrator.mdc

# Quick feature addition
claude 0-memory-system/m0-memory-orchestrator.mdc
claude 2-pre-dev-feature/0-feature-orchestrator.mdc
```

### Analyzing Existing Code

```bash
# Full 18-point code review
claude 4-code-review/00-code-review-orchestrator.mdc

# Security-focused analysis
claude 4-code-review/01-codebase-overview.md
claude 4-code-review/07-security-vulnerability-analysis.md
claude 4-code-review/08-dependency-security-analysis.md
```

### Memory Operations

```bash
# Search for patterns before starting
claude 0-memory-system/m2-memory-retrieval.md

# Store learnings after completion
claude 0-memory-system/m4-memory-workflow.md
```

## High-Level Architecture

### Workflow Dependencies

1. **Memory System** is the foundation - always start here to leverage existing patterns
2. **Pre-Development** workflows generate requirements and technical specifications
3. **Frontend Development** takes design inputs and creates implementation tasks
4. **Code Review** validates implementation against quality standards
5. **Documentation Generation** creates comprehensive docs for all audiences

### Key Integration Points

- **Confidence Scoring**: Pre-Development Product dynamically adjusts user interaction based on:
  - Memory match (0-40 points)
  - Requirement clarity (0-30 points)  
  - Technical complexity (0-30 points)
  - Total 80+ = proceed autonomously

- **Tool Integration**:
  - **Memory MCP**: Persistent knowledge across sessions
  - **Sequential Thinking MCP**: Complex problem decomposition
  - **Zen MCP**: Deep analysis (`thinkdeep`), code review (`codereview`), debugging (`debug`)
  - **Task Tool**: Parallel search and pattern discovery

### Output Organization

All outputs follow consistent patterns:

```
docs/
├── pre-development/
│   ├── prd-[feature].md
│   ├── trd-[feature].md
│   └── tasks/
│       └── MT-[XX]-[name]/
├── code-review/
│   ├── code-review-todo-list.md
│   └── [1-18]-[ANALYSIS].md
├── frontend-development/
│   └── tasks/frontend-[feature]/
└── documentation/
    └── [business|technical|integration|operations]/
```

### Phase Execution Patterns

**Pre-Development Product (Dynamic):**
- Discovery → Strategic Decision✓ → Autonomous Refinement → Validation✓
- Only 2 mandatory checkpoints vs traditional 6+

**Feature Development (Adaptive):**
- Complexity Assessment → Brief✓ → Technical Approach✓ → Implementation Plan → Test Strategy✓
- Workflow adapts based on feature complexity

**Code Review (Systematic):**
- Foundation (01-06) → Security (07-09) → Quality (10-12) → Documentation (13-15) → Production (16-17) → Synthesis (18)
- Each phase builds on previous findings

## Repository Context

When using Memory MCP, use these repository contexts:
- `repository="github.com/lerianstudio/midaz"` - Midaz Financial Ledger
- `repository="github.com/lerianstudio/midaz-private"` - Private components
- `repository="github.com/lerianstudio/monorepo"` - Main monorepo
- `repository="global"` - Cross-project patterns

## File Types

- **`.mdc` files**: Interactive prompts requiring user feedback
- **`.md` files**: Autonomous analysis prompts
- **`0-*-orchestrator.mdc`**: Workflow entry points
- **File size limits**: Target <300 lines, max 500 lines for LLM optimization