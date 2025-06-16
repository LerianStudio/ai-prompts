# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **AI Prompts for LerianStudio Ecosystem** - a comprehensive collection of AI prompts designed for complete software development lifecycle management. The repository provides 5 integrated workflow systems that work together through orchestrator patterns.

## Core Architecture

### 5-System Workflow Architecture
The repository is organized into numbered directories representing the complete development lifecycle:

```
0-memory-system/     → Cross-session learning & pattern recognition
1-pre-dev-product/   → Comprehensive planning from idea to implementation  
2-pre-dev-feature/   → Streamlined feature addition to existing products
3-frontend/          → Complete frontend development with flexible design inputs
4-code-review/       → 18-point systematic code analysis
```

### Orchestrator Pattern Architecture
Each system uses an orchestrator file (numbered `0-*-orchestrator.mdc`) that implements:

**Phase-Based Execution Model:**
- Memory System: 5 phases (m1→m2→m3→m4→m5)
- Pre-Development Product: 5 phases with mandatory user checkpoints (PRD✓→TRD✓→Tasks✓→Validation✓→Sub-tasks)
- Feature Development: 3 phases optimized for speed (Brief✓→Approach✓→Plan)
- Frontend Development: 5 phases with flexible design inputs (Design✓→Tech✓→Architecture→Tasks→Validation)
- Code Review: 6 phases with systematic analysis (Foundation→Security→Quality→Documentation→Production→Synthesis)

**User Interaction Patterns:**
- **Mandatory Checkpoints**: ✓ = User approval required before next phase
- **Structured Feedback Loops**: Draft→User feedback→AI incorporation→Approval
- **Context Acknowledgment**: AI confirms understanding before proceeding
- **Iterative Refinement**: Multiple feedback rounds until user satisfaction

**Memory MCP Integration:**
- **Phase Start**: `memory_search` for existing patterns, `memory_get_context` for project background
- **During Execution**: `memory_store_decision` for choices, `memory_store_chunk` for insights
- **Phase End**: `memory_create_thread` for linking, `memory_tasks` for progress tracking
- **Cross-Session**: `memory_export_project`/`memory_import_context` for continuity

**Sequential Thinking MCP Usage:**
- Complex requirement analysis and feature prioritization
- Design interpretation and component architecture planning
- System analysis and security assessment
- Pattern detection and relationship analysis

### Memory-First Architecture
All workflows start with memory context retrieval and end with knowledge storage:
1. Check for existing patterns before starting work
2. Store decisions and learnings during work
3. Build persistent knowledge across projects

## Orchestrator Execution Patterns

### Phase Dependency Management

**Pre-Development Product (5-phase linear):**
```bash
# Phase 1: PRD Creation (REQUIRED user feedback)
claude 1-pre-dev-product/1-create-prd.mdc
# → User answers clarifying questions → PRD review/approval

# Phase 2: TRD Creation (REQUIRED user feedback) 
claude 1-pre-dev-product/2-create-trd.mdc
# → User makes technical decisions → TRD review/approval

# Phase 3: Task Generation (REQUIRED user feedback)
claude 1-pre-dev-product/3-generate-tasks.mdc
# → User prioritizes tasks → task breakdown approval

# Phase 4: Chain Validation (REQUIRED user review)
claude 1-pre-dev-product/4-validate-chain.mdc
# → User reviews consistency report → acknowledgment

# Phase 5: Sub-Task Generation (OPTIONAL user review)
claude 1-pre-dev-product/5-generate-sub-tasks.mdc
# → Implementation-ready atomic tasks
```

**Code Review (6-phase systematic - optimized order):**
```bash
# Phase 1: Foundation & Technical Architecture (execute in order)
claude 4-code-review/01-codebase-overview.md          # Foundation for all
claude 4-code-review/02-architecture-analysis.md      # Architecture foundation
claude 4-code-review/03-api-contract-analysis.md      # API understanding
claude 4-code-review/04-database-optimization.md      # Data layer foundation
claude 4-code-review/05-sequence-diagram-visualization.md # Visual foundation
claude 4-code-review/06-business-analysis.md          # Business context

# Phase 2: Security & Compliance (after foundation)
claude 4-code-review/07-security-vulnerability-analysis.md
claude 4-code-review/08-dependency-security-analysis.md
claude 4-code-review/09-privacy-compliance-analysis.md

# Phase 3: Quality & Testing (after architecture + security)
claude 4-code-review/10-test-coverage-analysis.md
claude 4-code-review/11-observability-monitoring.md
claude 4-code-review/12-pre-commit-quality-checks.md

# Phase 4: Documentation & Workflow (after quality foundation)
claude 4-code-review/13-documentation-generation.md
claude 4-code-review/14-api-documentation-generator.md
claude 4-code-review/15-business-workflow-consistency.md

# Phase 5: Production Readiness (after all analysis)
claude 4-code-review/16-production-readiness-audit.md
claude 4-code-review/17-deployment-preparation.md

# Phase 6: Final Synthesis (comprehensive action planning)
claude 4-code-review/18-comprehensive-todo-generation.md
```

**Frontend Development (5-phase flexible):**
```bash
# Phase 1: Design Input Analysis (REQUIRED user feedback)
claude 3-frontend/1-design-input-analysis.mdc
# → Works with iPad sketches, Figma, written specs, references

# Phase 2: Frontend Technical Planning (REQUIRED user feedback)
claude 3-frontend/2-frontend-tech-planning.mdc
# → Technical decision validation

# Phase 3: Component Integration Architecture (OPTIONAL review)
claude 3-frontend/3-component-integration-arch.mdc

# Phase 4: Atomic Implementation Tasks (OPTIONAL review)
claude 3-frontend/4-atomic-implementation-tasks.mdc

# Phase 5: Design Validation Integration (OPTIONAL review)
claude 3-frontend/5-design-validation-integration.mdc
```

## Common Development Commands

### Quick Start Workflows

**New Feature Development:**
```bash
# Initialize memory context
claude 0-memory-system/m0-memory-orchestrator.mdc

# Plan the feature interactively  
claude 1-pre-dev-product/0-pre-dev-orchestrator.mdc

# Analyze integration points
claude 4-code-review/01-codebase-overview.md
```

**Frontend Development:**
```bash
# Design input analysis (any format: sketches, Figma, specs)
claude 3-frontend/1-design-input-analysis.mdc

# Complete frontend implementation
claude 3-frontend/0-frontend-orchestrator.mdc

# Validate with code review
claude 4-code-review/00-code-review-orchestrator.mdc
```

**Existing Code Analysis:**
```bash
# Full 18-point systematic code review
claude 4-code-review/00-code-review-orchestrator.mdc

# Store findings
claude 0-memory-system/m4-memory-workflow.md
```

**Security-Focused Analysis:**
```bash
claude 4-code-review/01-codebase-overview.md
claude 4-code-review/07-security-vulnerability-analysis.md
claude 4-code-review/08-dependency-security-analysis.md
```

### Memory Operations

**Start any workflow with memory context:**
```bash
# Search for existing patterns
claude 0-memory-system/m2-memory-retrieval.md

# Analyze patterns from similar projects  
claude 0-memory-system/m1-memory-analysis.md
```

**Store important decisions:**
```bash
# Store significant learnings
claude 0-memory-system/m4-memory-workflow.md
```

**System maintenance:**
```bash
# Weekly health check
claude 0-memory-system/m5-memory-maintenance.md
```

## File Structure & Patterns

### Prompt File Types & Execution Model
- **`.mdc` files**: Interactive prompts with mandatory user feedback loops (phases with ✓)
- **`.md` files**: Analysis prompts that execute independently with memory integration
- **`README.md`**: System documentation and workflow guides
- **Orchestrators**: `0-*-orchestrator.mdc` - entry points with complete phase management

### Document Generation Flow
**Pre-Development Product:**
```
User Input → PRD Draft → docs/pre-development/prd-[feature].md
PRD → TRD Draft → docs/pre-development/trd-[feature].md  
PRD+TRD → Task Analysis → docs/pre-development/tasks/tasks-[feature].md
All docs → Validation → docs/pre-development/validation-report-[feature].md
Tasks → Sub-tasks → docs/pre-development/tasks/MT-[XX]-[name]/
```

**Code Review:**
```
Each prompt → Individual analysis → docs/code-review/[1-18]-[ANALYSIS].md
All prompts → Consolidated todo → docs/code-review/code-review-todo-list.md
Final synthesis → Action plan → docs/code-review/18-COMPREHENSIVE_TODO_LIST.md
```

**Frontend Development:**
```
Design Input → Analysis → docs/frontend-development/design-analysis-[feature].md
Analysis → Tech Plan → docs/frontend-development/frontend-tech-plan-[feature].md
Tech Plan → Architecture → docs/frontend-development/component-integration-[feature].md
Architecture → Tasks → docs/frontend-development/tasks/frontend-[feature]/FE-[XX]-[task].md
```

### Naming Conventions & File Size Guidelines
- **Features**: `[type]-[feature-name].md` (kebab-case)
- **Tasks**: `[prefix]-[XX]-[task-name].md` with numeric ordering
- **Code Review**: `[NN]-[ANALYSIS_NAME].md` with consistent numbering
- **Target**: <300 lines per file for LLM optimization
- **Maximum**: 500 lines (hard limit for processing efficiency)
- **Strategy**: Component-based splitting with complete git workflow per task

## Integration Patterns

### Cross-System Workflow Dependencies
**Integration Hierarchy:**
```
Memory System (Foundation)
    ↓
Pre-Development (Planning) ← → Feature Development (Incremental)
    ↓                              ↓
Frontend Development (UI) ← → Code Review (Validation)
    ↓                              ↓
Implementation (Git Tasks) → Quality Assurance (Systematic)
    ↓
Memory Storage (Learning)
```

**Workflow Transition Points:**
- **New Product**: Memory → Pre-Development Product → Frontend → Code Review → Memory
- **Feature Enhancement**: Memory → Pre-Development Feature → Implementation → Code Review → Memory
- **Existing Analysis**: Memory → Code Review → Memory
- **Quick Security Check**: Memory → Code Review (phases 1,7,8,9) → Memory

**Cross-Orchestrator Dependencies:**
- Memory First: All workflows start with context retrieval (`memory_search`, `memory_get_context`)
- Validation Gates: Code review can trigger pre-development iteration for major issues
- Pattern Sharing: Successful implementations feed back to memory with structured tagging
- Quality Feedback: Code review findings influence future planning workflows

### Repository Context Usage
When using Memory MCP, specify appropriate repository context:
```bash
repository="github.com/lerianstudio/midaz"          # Midaz Financial Ledger
repository="github.com/lerianstudio/midaz-private"  # Private components
repository="github.com/lerianstudio/monorepo"       # Main monorepo
repository="global"                                  # Cross-project patterns
```

### Tagging Strategy
Use consistent memory tags:
- Architecture: `["architecture", "decision", "project-name"]`
- Bug Fixes: `["bug-fix", "component", "error-type"]`  
- Features: `["feature", "implementation", "technology"]`
- Learning: `["learning", "pattern", "anti-pattern"]`

## Quality Standards Integration

### LerianStudio Ecosystem Context
This repository supports analysis of the broader LerianStudio ecosystem:
- **Midaz Financial Ledger**: Double-entry accounting, transaction processing
- **Plugin Ecosystem**: Component analysis and integration patterns
- **SDK Development**: API design and documentation workflows
- **Infrastructure**: Observability and deployment analysis

### Code Review Standards  
The 18-point code review system covers:
- **Foundation** (01-06): Overview, architecture, APIs, database, visualization, business
- **Security** (07-09): Vulnerabilities, dependencies, privacy compliance
- **Quality** (10-12): Testing, observability, pre-commit checks
- **Documentation** (13-15): Technical docs, API docs, workflow consistency
- **Production** (16-18): Readiness audit, deployment prep, comprehensive todos

### Todo Management
- Consolidated todo lists with priority levels (🔴 CRITICAL → 🔵 LOW)
- Integration with `///AUTHOR` comment extraction
- Memory-backed task tracking across sessions

## Best Practices

1. **Always Start with Memory**: Check for existing patterns before beginning new work
2. **Use Orchestrators**: Let orchestrator files guide you through complex workflows  
3. **Interactive Planning**: Engage with feedback loops during pre-development phases
4. **Systematic Analysis**: Follow the 18-point code review for comprehensive analysis
5. **Store Learnings**: Capture decisions and patterns back to memory for future use
6. **Maintain Context**: Use consistent repository and session identifiers
7. **Follow Output Structure**: Respect the documented directory and naming conventions

## Integration with LerianStudio Development

This prompt system is designed to accelerate development across the LerianStudio ecosystem by providing:
- **Consistency**: Standardized workflows across all projects
- **Quality**: Comprehensive analysis at every development stage  
- **Learning**: Continuous improvement through persistent memory
- **Efficiency**: Reuse of patterns and architectural decisions
- **Collaboration**: Clear user interaction points and feedback loops