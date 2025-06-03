# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a token-optimized AI prompts repository for the LerianStudio ecosystem, containing a complete **18-prompt analysis chain** with comprehensive dependency tracking. The repository provides systematic codebase analysis across multiple engineering disciplines with 50-75% token reduction while maintaining full functionality.

## Repository Structure

### Complete Analysis Chain (00-17)
- **Foundation (00-02)**: `00-codebase-overview.md`, `01-architecture-analysis.md`, `02-business-analysis.md`
- **Security Foundation (03-05)**: `03-security-vulnerability-analysis.md`, `04-dependency-security-analysis.md`, `05-privacy-compliance-analysis.md`
- **Technical Foundation (06-08)**: `06-api-contract-analysis.md`, `07-database-optimization.md`, `08-test-coverage-analysis.md`
- **Infrastructure & Quality (09-10)**: `09-observability-monitoring.md`, `10-pre-commit-quality-checks.md`
- **Documentation & Communication (11-12)**: `11-documentation-generation.md`, `12-api-documentation-generator.md`
- **Production & Deployment (13-15)**: `13-production-readiness-audit.md`, `14-deployment-preparation.md`, `15-sequence-diagram-visualization.md`
- **Integration & Planning (16-17)**: `16-business-workflow-consistency.md`, `17-comprehensive-todo-generation.md`

### Memory Management (m1-m5)
- **memory-related/**: Memory Context Protocol (MCP) integration prompts for session continuity and task tracking

## Key Prompt Patterns

### 🔗 Chaining System
Each prompt #01-15 includes comprehensive dependency checking:
- **REQUIRED**: Read ALL previous outputs `.claude/0-CODEBASE_OVERVIEW.md` through `.claude/[N-1]-*.md`
- **Cross-Reference**: Use findings from architectural, security, and business analysis
- **Output Review**: If existing analysis exists, review and update against current codebase
- **Chain Coordination**: Store findings with memory MCP tags for complete system understanding

### Memory Integration
All prompts are designed to work with the Memory Context Protocol (MCP):
- Use `memory_get_context` to resume work from checkpoints
- Store findings with `memory_store_chunk` and `memory_store_decision`
- Tag entries appropriately for organization and retrieval
- Use `memory-related/m1-m5` prompts for session management

### Documentation Standards
- Create documentation in `.claude/` directory with numbered prefixes (0-15)
- Use mermaid diagrams for visual representations in `diagrams/` directory
- Include specific file references for all claims (`file:line` format)
- Maintain comprehensive cross-references between analysis domains

## Common Development Tasks

### Complete System Analysis
Use the full 16-prompt chain for comprehensive codebase analysis:
```bash
claude 00-codebase-overview.md                    # Foundation
claude 01-architecture-analysis.md                # System design (uses #00)
claude 03-security-vulnerability-analysis.md      # Security (uses #00-01)
# ... continue through all 16 prompts
claude 15-sequence-diagram-visualization.md       # Final visualization (uses #00-14)
```

### Focused Analysis
For targeted analysis, use foundation + specific domain prompts:
```bash
# Security Assessment
claude 00-codebase-overview.md
claude 03-security-vulnerability-analysis.md
claude 04-dependency-security-analysis.md
claude 05-privacy-compliance-analysis.md

# Architecture Review  
claude 00-codebase-overview.md
claude 01-architecture-analysis.md
claude 06-api-contract-analysis.md
claude 07-database-optimization.md
```

### Memory Workflow Management
- Use `memory-related/m2-memory-retrieval.md` to check current context
- Use `memory-related/m3-task-management.md` for automated task tracking
- Use `memory-related/m4-memory-workflow.md` for session lifecycle management

## Integration with LerianStudio Ecosystem

This repository supports the broader LerianStudio monorepo by providing:
- Specialized analysis prompts for financial technology components
- Security and compliance analysis frameworks  
- Technical documentation generation workflows
- Multi-agent coordination patterns for large codebases

## File Naming Conventions
- **Sequential prompts (00-15)**: Complete analysis chain with dependency tracking
- **Memory prompts (m1-m5)**: Memory Context Protocol integration
- **Descriptive names**: Clear identification of prompt purpose and domain
- **Token-optimized**: 50-75% reduction while preserving full functionality

## Output Structure
Standard file organization for all analysis outputs:
```
.claude/
├── 0-CODEBASE_OVERVIEW.md
├── 1-ARCHITECTURE_ANALYSIS.md  
├── 2-BUSINESS_ANALYSIS.md
├── 3-SECURITY_ANALYSIS.md
├── ...
├── 17-COMPREHENSIVE_TODO_LIST.md
└── components/, api/, monitoring/

diagrams/
├── README.md
├── api-flows.md
├── auth-flows.md
└── system-interactions.md
```

## Custom Claude Code Commands

### Analysis Commands

#### `/analyze-full`
Run the complete 18-prompt analysis chain:
```bash
# Execute complete system analysis
claude 00-codebase-overview.md
claude 01-architecture-analysis.md  
claude 02-business-analysis.md
claude 03-security-vulnerability-analysis.md
claude 04-dependency-security-analysis.md
claude 05-privacy-compliance-analysis.md
claude 06-api-contract-analysis.md
claude 07-database-optimization.md
claude 08-test-coverage-analysis.md
claude 09-observability-monitoring.md
claude 10-pre-commit-quality-checks.md
claude 11-documentation-generation.md
claude 12-api-documentation-generator.md
claude 13-production-readiness-audit.md
claude 14-deployment-preparation.md
claude 15-sequence-diagram-visualization.md
claude 16-business-workflow-consistency.md
claude 17-comprehensive-todo-generation.md
```

#### `/analyze-security`
Run security-focused analysis:
```bash
# Security assessment workflow
claude 00-codebase-overview.md
claude 03-security-vulnerability-analysis.md
claude 04-dependency-security-analysis.md
claude 05-privacy-compliance-analysis.md
claude 13-production-readiness-audit.md
```

#### `/analyze-architecture`
Run architecture-focused analysis:
```bash
# Architecture review workflow
claude 00-codebase-overview.md
claude 01-architecture-analysis.md
claude 06-api-contract-analysis.md
claude 07-database-optimization.md
claude 15-sequence-diagram-visualization.md
```

#### `/analyze-quality`
Run quality and testing analysis:
```bash
# Quality assurance workflow
claude 00-codebase-overview.md
claude 08-test-coverage-analysis.md
claude 10-pre-commit-quality-checks.md
claude 13-production-readiness-audit.md
claude 14-deployment-preparation.md
```

### Memory Commands

#### `/memory-status`
Check current memory context and tasks:
```bash
# Get memory status
claude memory-related/m2-memory-retrieval.md
```

#### `/memory-init`
Initialize memory session for analysis:
```bash
# Initialize memory workflow
claude memory-related/m4-memory-workflow.md
```

#### `/memory-tasks`
Manage tasks and track progress:
```bash
# Task management
claude memory-related/m3-task-management.md
```

### Quick Commands

#### `/overview`
Get quick codebase overview:
```bash
claude 00-codebase-overview.md
```

#### `/security-scan`
Quick security vulnerability scan:
```bash
claude 03-security-vulnerability-analysis.md
```

#### `/docs-gen`
Generate documentation:
```bash
claude 11-documentation-generation.md
```

#### `/diagrams`
Generate sequence diagrams:
```bash
claude 15-sequence-diagram-visualization.md
```