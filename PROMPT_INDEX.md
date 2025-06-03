# AI Prompts Index

Complete index of all AI prompts in the LerianStudio ecosystem, organized for systematic codebase analysis.

## 🔗 Main Analysis Chain (00-15)

Sequential prompts that build upon each other with comprehensive chaining dependencies:

| #  | File | Purpose | Chaining Dependencies |
|----|------|---------|----------------------|
| 00 | `00-codebase-overview.md` | Initial codebase exploration | None (foundation) |
| 01 | `01-architecture-analysis.md` | System architecture analysis | Depends on #00 |
| 02 | `02-security-vulnerability-analysis.md` | Security assessment | Depends on #00-01 |
| 03 | `03-business-analysis.md` | Business logic analysis | Depends on #00-02 |
| 04 | `04-api-contract-analysis.md` | API design analysis | Depends on #00-03 |
| 05 | `05-database-optimization.md` | Database design analysis | Depends on #00-04 |
| 06 | `06-observability-monitoring.md` | Monitoring & observability | Depends on #00-05 |
| 07 | `07-dependency-security-analysis.md` | Supply chain security | Depends on #00-06 |
| 08 | `08-privacy-compliance-analysis.md` | Privacy & GDPR compliance | Depends on #00-07 |
| 09 | `09-test-coverage-analysis.md` | Test strategy analysis | Depends on #00-08 |
| 10 | `10-documentation-generation.md` | Documentation synthesis | Depends on #00-09 |
| 11 | `11-production-readiness-audit.md` | Deployment readiness | Depends on #00-10 |
| 12 | `12-api-documentation-generator.md` | OpenAPI/Postman generation | Depends on #00-11 |
| 13 | `13-pre-commit-quality-checks.md` | Quality validation pipeline | Depends on #00-12 |
| 14 | `14-deployment-preparation.md` | Production cleanup | Depends on #00-13 |
| 15 | `15-sequence-diagram-visualization.md` | System flow visualization | Depends on #00-14 |

## 🧠 Memory Management Prompts (m1-m5)

Memory Context Protocol (MCP) integration for session continuity:

| # | File | Purpose |
|---|------|---------|
| m1 | `memory-related/m1-memory-analysis.md` | Memory pattern analysis & intelligence |
| m2 | `memory-related/m2-memory-retrieval.md` | Context retrieval & task status |
| m3 | `memory-related/m3-task-management.md` | Automated task tracking |
| m4 | `memory-related/m4-memory-workflow.md` | Session lifecycle management |
| m5 | `memory-related/m5-memory-maintenance.md` | Memory updates & cleanup |

## 🎯 Usage Patterns

### Complete System Analysis
Run prompts **00-15** in sequence for comprehensive codebase analysis:
```bash
# Foundation
claude 00-codebase-overview.md

# Core Analysis (sequential dependency chain)
claude 01-architecture-analysis.md
claude 02-security-vulnerability-analysis.md
claude 03-business-analysis.md
# ... continue through 15
```

### Focused Analysis
For specific concerns, run foundation + targeted prompts:
```bash
# Security Focus
claude 00-codebase-overview.md
claude 02-security-vulnerability-analysis.md
claude 07-dependency-security-analysis.md
claude 08-privacy-compliance-analysis.md

# Architecture Focus  
claude 00-codebase-overview.md
claude 01-architecture-analysis.md
claude 04-api-contract-analysis.md
claude 05-database-optimization.md
```

### Memory Integration
Use memory prompts alongside main analysis for session continuity:
```bash
# Start with memory context
claude memory-related/m2-memory-retrieval.md

# Run analysis with task tracking
claude memory-related/m3-task-management.md + 01-architecture-analysis.md

# Maintain memory state
claude memory-related/m5-memory-maintenance.md
```

## 📊 Token Optimization

All prompts have been optimized for token efficiency:
- **50-75% token reduction** from original versions
- **Preserved core functionality** and chaining dependencies
- **Practical examples** with working code snippets
- **Language-agnostic** support for multiple tech stacks

## 🔄 Chaining System

Each prompt #1-15 includes:
- **Dependency checking** on all previous prompt outputs
- **Output review** capabilities for existing analysis
- **Cross-reference validation** with comprehensive findings
- **Memory MCP integration** for session continuity

## 📁 Output Structure

Standard output locations for all prompts:
```
.claude/
├── 0-CODEBASE_OVERVIEW.md
├── 1-ARCHITECTURE_ANALYSIS.md
├── 2-SECURITY_ANALYSIS.md
├── ...
├── 15-SEQUENCE_DIAGRAMS.md
├── components/
├── api/
└── monitoring/

diagrams/
├── README.md
├── api-flows.md
├── auth-flows.md
└── system-interactions.md
```

## 🚀 Quick Start

1. **Initialize**: Run `00-codebase-overview.md` for baseline understanding
2. **Analyze**: Execute sequential prompts 01-15 based on needs
3. **Track**: Use memory prompts m1-m5 for session continuity
4. **Document**: Outputs organized in `.claude/` directory structure
5. **Visualize**: Final sequence diagrams in `diagrams/` directory

This systematic approach ensures comprehensive, token-efficient codebase analysis with full dependency tracking and memory continuity.