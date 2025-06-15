# AI Prompts for LerianStudio Ecosystem

A comprehensive collection of AI prompts designed for complete software development lifecycle management within the LerianStudio ecosystem.

## 🎯 Overview

This repository provides integrated systems that work together to support the entire software development lifecycle:

| System | Purpose | Directory | Quick Start |
|--------|---------|-----------|-------------|
| **Memory System** | Cross-session learning & pattern recognition | [`0-memory-system/`](0-memory-system/) | `claude 0-memory-system/m0-memory-orchestrator.mdc` |
| **Product Development** | Comprehensive planning from idea to implementation | [`1-pre-dev-product/`](1-pre-dev-product/) | `claude 1-pre-dev-product/0-pre-dev-orchestrator.mdc` |
| **Feature Development** | Streamlined feature addition to existing products | [`2-pre-dev-feature/`](2-pre-dev-feature/) | `claude 2-pre-dev-feature/0-feature-orchestrator.mdc` |
| **Frontend Development** | Complete frontend development with flexible design inputs | [`3-frontend/`](3-frontend/) | `claude 3-frontend/0-frontend-orchestrator.mdc` |
| **Code Review** | 18-point systematic code analysis | [`4-code-review/`](4-code-review/) | `claude 4-code-review/00-code-review-orchestrator.mdc` |

## 📚 Documentation

- **[ORCHESTRATORS.md](ORCHESTRATORS.md)** - Comprehensive guide to all orchestrators and workflow integration
- **[Memory Management README](0-memory-system/README.md)** - Detailed memory system documentation
- **[Pre-Development README](1-pre-dev-product/README.md)** - Interactive planning workflow guide
- **[Frontend Development README](3-frontend/README.md)** - Complete frontend development workflow
- **[Code Review README](4-code-review/README.md)** - Systematic analysis documentation

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

### 4. Quick Security Check
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
    E --> F[Memory Storage]
    F --> A
```

1. **Initialize**: Start with memory context to leverage existing patterns
2. **Plan**: Use pre-development for interactive requirements and design
3. **Frontend**: Design and implement frontend with systematic precision
4. **Implement**: Follow generated tasks and sub-tasks
5. **Review**: Comprehensive code analysis and validation
6. **Learn**: Store insights back to memory for future projects

## 🎯 Key Features

### 🔗 Integrated Systems
- **Memory First**: Every workflow starts with context retrieval and ends with knowledge storage
- **Interactive Planning**: User feedback loops ensure alignment at every stage
- **Systematic Analysis**: 18-point code review covers all engineering disciplines
- **Continuous Learning**: Patterns and decisions persist across projects

### 📋 Todo Generation
- Consolidated todo lists from all code review analyses
- Priority-based organization (CRITICAL → HIGH → MEDIUM → LOW)
- Developer comment extraction (`///AUTHOR` tags)
- Actionable tasks with effort estimates

### 🚀 Workflow Features
- **Atomic Tasks**: Each task delivers complete, working software
- **Validation Gates**: Consistency checks prevent flawed implementations
- **Architecture Patterns**: Built-in best practices and standards
- **Language Agnostic**: Supports all major programming languages

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

## 🏆 Best Practices

1. **Start with Memory**: Always check for existing patterns before beginning new work
2. **Interactive Planning**: Engage with feedback loops during pre-development
3. **Systematic Review**: Follow the phased approach for comprehensive analysis
4. **Store Learnings**: Capture decisions and patterns back to memory
5. **Use Orchestrators**: Let the orchestrators guide you through complex workflows

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

## 🔧 Getting Started

1. **Choose Your Workflow**:
   - New project? Start with Pre-Development
   - Existing code? Begin with Code Review
   - Need context? Check Memory first

2. **Use the Orchestrators**:
   - Each system has an orchestrator file
   - Follow the guided workflows
   - Provide feedback when requested

3. **Store Your Learning**:
   - Capture decisions in memory
   - Build on previous patterns
   - Share knowledge across projects

## 📄 License

This project is part of the LerianStudio ecosystem. See the main repository for licensing information.

---

*Part of the [LerianStudio](https://github.com/lerianstudio) ecosystem - Building the future of financial technology with AI-assisted development.*