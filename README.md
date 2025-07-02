# AI Prompts for LerianStudio Ecosystem

A comprehensive collection of AI prompts designed for complete software development lifecycle management within the LerianStudio ecosystem.

## 🎯 Overview

This repository provides integrated systems that work together to support the entire software development lifecycle:

| System | Purpose | Workflow Type | Quick Start |
|--------|---------|---------------|-------------|
| **Memory System** | Cross-session learning & pattern recognition | Sequential (5 phases) | `claude 0-memory-system/m0-memory-orchestrator.mdc` |
| **Product Development** | Comprehensive planning from idea to implementation | **Dynamic (4 phases, 2 checkpoints)** | `claude 1-pre-dev-product/0-pre-dev-orchestrator.mdc` |
| **Feature Development** | Streamlined feature addition to existing products | Streamlined (3 phases) | `claude 2-pre-dev-feature/0-feature-orchestrator.mdc` |
| **Frontend Development** | Complete frontend development with flexible design inputs | Flexible (5 phases) | `claude 3-frontend/0-frontend-orchestrator.mdc` |
| **Code Review** | 18-point systematic code analysis | Systematic (6 phases) | `claude 4-code-review/00-code-review-orchestrator.mdc` |
| **Documentation Generation** | Comprehensive documentation generation and distribution | Comprehensive (5 phases) | `claude 5-generate-docs/0-docs-orchestrator.mdc` |

## 📚 Documentation

- **[CLAUDE.md](CLAUDE.md)** - Complete orchestrator architecture and execution patterns for AI assistants
- **[Memory Management README](0-memory-system/README.md)** - Detailed memory system documentation
- **[Pre-Development README](1-pre-dev-product/README.md)** - Interactive planning workflow guide
- **[Frontend Development README](3-frontend/README.md)** - Complete frontend development workflow
- **[Code Review README](4-code-review/README.md)** - Systematic analysis documentation
- **[Documentation Generation README](5-generate-docs/README.md)** - Comprehensive documentation workflow guide

## 🆕 Dynamic Workflow Innovation

### Confidence-Based Interactions
The Pre-Development Product workflow now uses AI confidence scoring to minimize user interaction:

```yaml
High Confidence (80-100%):
  - AI proceeds autonomously
  - Notifies user of decisions
  - User can intervene if needed

Medium Confidence (50-79%):
  - AI presents 2-3 options
  - User selects preferred approach
  - AI refines based on selection

Low Confidence (<50%):
  - AI requests specific guidance
  - Presents gaps in understanding
  - User provides targeted input
```

### Tool Integration
- **Memory MCP**: Pattern recognition and knowledge persistence
- **Sequential Thinking MCP**: Complex problem decomposition
- **Zen MCP**: Deep analysis, code review, debugging, and collaboration
- **Task Tool**: Parallel search operations for maximum efficiency

## 🚀 Quick Start Workflows

### 1. New Feature Development
```bash
# Initialize memory context
claude 0-memory-system/m0-memory-orchestrator.mdc

# Plan the feature interactively
claude 1-pre-dev-product/0-pre-dev-orchestrator.mdc

# Analyze integration points
claude 4-code-review/01-codebase-overview.md
```

### 2. Frontend Development
```bash
# Design input analysis (any format: sketches, Figma, specs)
claude 3-frontend/1-design-input-analysis.mdc

# Complete frontend implementation
claude 3-frontend/0-frontend-orchestrator.mdc

# Validate with code review
claude 4-code-review/00-code-review-orchestrator.mdc
```

### 3. Existing Code Analysis
```bash
# Full code review
claude 4-code-review/00-code-review-orchestrator.mdc

# Store findings
claude 0-memory-system/m4-memory-workflow.md
```

### 4. Documentation Generation
```bash
# Comprehensive documentation suite
claude 5-generate-docs/0-docs-orchestrator.mdc

# Store documentation patterns
claude 0-memory-system/m4-memory-workflow.md
```

### 5. Quick Security Check
```bash
# Security-focused analysis
claude 4-code-review/01-codebase-overview.md
claude 4-code-review/07-security-vulnerability-analysis.md
claude 4-code-review/08-dependency-security-analysis.md
```

## 🔄 Development Lifecycle Integration

### Complete Development Cycle
```mermaid
graph LR
    A[Memory Context] --> B[Pre-Development Planning]
    B --> C[Frontend Development]
    C --> D[Implementation]
    D --> E[Code Review]
    E --> F[Documentation Generation]
    F --> G[Memory Storage]
    G --> A
```

1. **Initialize**: Start with memory context to leverage existing patterns
2. **Plan**: Use pre-development for interactive requirements and design
3. **Frontend**: Design and implement frontend with systematic precision
4. **Implement**: Follow generated tasks and sub-tasks
5. **Review**: Comprehensive code analysis and validation
6. **Document**: Generate comprehensive documentation for all audiences
7. **Learn**: Store insights back to memory for future projects

## 🎯 Key Features

### 🔗 Orchestrator Architecture
- **Dynamic Phase Execution**: Pre-Development now uses confidence-based execution with only 2 mandatory checkpoints
- **Memory MCP Integration**: Context retrieval, decision storage, pattern analysis across sessions
- **Multi-Tool Integration**: Sequential Thinking, Zen MCP, and Task tool for enhanced capabilities
- **Cross-System Dependencies**: Workflows feed into each other with validation gates

### 📋 User Interaction Patterns
- **Confidence-Based Interactions**: AI decides when user input is needed based on confidence scores
- **Structured Feedback Loops**: Draft → User feedback → AI incorporation → Approval
- **Minimal Interruption**: From 6+ checkpoints down to just 2 in Pre-Development workflow
- **Flexible Design Inputs**: iPad sketches, Figma designs, written specs, reference apps

### 🚀 Workflow Features
- **Autonomous Refinement**: AI works independently when confidence is high
- **Parallel Processing**: Multiple operations execute simultaneously for efficiency
- **Atomic Tasks**: Each task delivers complete, working software with git workflow
- **Smart Validation**: Consistency checks with auto-correction capabilities
- **Priority-Based Todos**: 🔴 CRITICAL → 🟡 HIGH → 🟢 MEDIUM → 🔵 LOW organization

## 📦 Output Organization

### Pre-Development Outputs
```
docs/pre-development/
├── prd-[feature].md              # Product requirements
├── trd-[feature].md              # Technical specifications
├── validation-report-[feature].md # Consistency validation
└── tasks/
    ├── tasks-[feature].md        # Atomic phases
    └── MT-[XX]-[name]/           # Sub-task details
```

### Code Review Outputs
```
docs/code-review/
├── code-review-todo-list.md     # Consolidated todos
├── 1-CODEBASE_OVERVIEW.md       # Foundation analysis
├── 2-ARCHITECTURE_ANALYSIS.md   # Architecture patterns
├── ...
└── 18-COMPREHENSIVE_TODO_LIST.md # Final synthesis
```

### Documentation Generation Outputs
```
docs/documentation/
├── documentation-audit.md        # Discovery phase audit
├── documentation-plan.md         # Strategic planning
├── validation-report.md          # Quality validation
├── distribution-strategy.md      # Multi-channel distribution
└── content/
    ├── business/                 # Product team docs
    ├── technical/                # Developer docs
    ├── integration/              # API consumer docs
    └── operations/               # DevOps docs
```

## 🏆 Orchestrator Best Practices

### Execution Order Guidelines
1. **Memory First**: Always start with `memory_search` and `memory_get_context` before any workflow
2. **Follow Phase Dependencies**: 
   - Pre-Development: Discovery (conditional) → Strategic Decision✓ → Autonomous Refinement → Final Validation✓
   - Code Review: Foundation → Security → Quality → Documentation → Production → Synthesis
   - Frontend: Design✓ → Tech✓ → Architecture → Tasks → Validation
   - Documentation: Discovery✓ → Planning✓ → Generation✓ → Validation✓ → Distribution
3. **Leverage AI Autonomy**: Let confidence scores guide interaction needs
4. **Use Tools Liberally**: Zen MCP for deep analysis, Task tool for parallel searches
5. **Store All Decisions**: Use `memory_store_decision` for architectural choices and `memory_store_chunk` for insights

### Integration Patterns
- **New Product**: Memory → Pre-Development Product → Frontend → Code Review → Documentation → Memory
- **Feature Enhancement**: Memory → Pre-Development Feature → Implementation → Code Review → Documentation → Memory  
- **Existing Analysis**: Memory → Code Review → Memory
- **Documentation Focus**: Memory → Documentation Generation → Distribution → Memory
- **Security Focus**: Memory → Code Review (phases 1,7,8,9) → Memory

## 🏗️ Integration with LerianStudio

This repository supports the broader LerianStudio ecosystem:
- **Midaz Financial Ledger**: Architecture and security analysis
- **Plugin Ecosystem**: Component analysis and integration patterns
- **SDK Development**: API design and documentation workflows
- **Infrastructure**: Observability and deployment analysis

### Repository Context
```bash
# Use appropriate repository context
repository="github.com/lerianstudio/midaz"
repository="github.com/lerianstudio/midaz-private"
repository="github.com/lerianstudio/monorepo"
```

## 📈 Key Benefits

- **Consistency**: Standardized workflows across all projects
- **Quality**: Comprehensive analysis at every stage
- **Learning**: Continuous improvement through memory
- **Efficiency**: Reuse patterns and decisions
- **Collaboration**: Clear user interaction points

### 🚀 Efficiency Improvements
- **70% Reduction in Interactions**: Pre-Development workflow reduced from 6+ to 2 mandatory checkpoints
- **Parallel Processing**: Multiple analyses run simultaneously instead of sequentially
- **Pattern Reuse**: Memory MCP enables >60% pattern reuse from similar projects
- **Autonomous Refinement**: AI works independently when confidence is high (>80%)
- **Smart Validation**: Auto-correction of minor issues without user intervention

## 🔧 Getting Started

### For AI Assistants
1. **Read CLAUDE.md First**: Complete orchestrator architecture and execution patterns
2. **Choose Your Workflow**:
   - New project? Start with Pre-Development Product (4-phase dynamic, only 2 checkpoints!)
   - Existing code? Begin with Code Review (6-phase systematic)
   - Frontend focus? Use Frontend Development (5-phase flexible)
   - Quick feature? Use Pre-Development Feature (3-phase streamlined)
3. **Leverage Tools**:
   - Use Zen MCP for deep analysis and collaboration
   - Use Task tool for parallel pattern searches
   - Let confidence scores guide your interactions

### For Developers
1. **Start with Orchestrators**: Each system has a `0-*-orchestrator.mdc` entry point
2. **Follow Phase Dependencies**: Respect mandatory checkpoints and user feedback loops
3. **Leverage Memory**: Check context before starting, store learnings after completion
4. **Use Integration Patterns**: Connect workflows for complete development lifecycle

### Command Examples
```bash
# Complete new feature workflow
claude 0-memory-system/m0-memory-orchestrator.mdc
claude 1-pre-dev-product/0-pre-dev-orchestrator.mdc  
claude 3-frontend/0-frontend-orchestrator.mdc
claude 4-code-review/00-code-review-orchestrator.mdc
claude 5-generate-docs/0-docs-orchestrator.mdc
```

## 📄 License

This project is part of the LerianStudio ecosystem. See the main repository for licensing information.

---

*Part of the [LerianStudio](https://github.com/lerianstudio) ecosystem - Building the future of financial technology with AI-assisted development.*