# Code Review Analysis System

Comprehensive codebase analysis across 18 different engineering disciplines, from architecture to production readiness.

## 🎯 Purpose

The Code Review Analysis System provides systematic, multi-perspective analysis of existing codebases, delivering:
- Architecture and design pattern analysis
- Security vulnerability assessment
- Performance and scalability insights
- Production readiness validation
- Comprehensive todo list generation

## 📚 Quick Start

Start with the orchestrator to understand the 6-phase workflow:

```bash
claude 2-code-review/00-code-review-orchestrator.mdc
```

## 📋 Analysis Phases

### Phase 1: Foundation & Technical Architecture (01-06)
| File | Role | Focus Area |
|------|------|------------|
| `01-codebase-overview.md` | Foundation Analyst | Initial exploration, tech stack identification |
| `02-architecture-analysis.md` | Architecture Engineer | System design, patterns, component analysis |
| `03-api-contract-analysis.md` | API Architect | API design, contracts, documentation |
| `04-database-optimization.md` | Database Architect | Schema design, optimization, modeling |
| `05-sequence-diagram-visualization.md` | System Visualizer | Mermaid sequence diagrams |
| `06-business-analysis.md` | Business Analyst | Requirements alignment, ROI analysis |

### Phase 2: Security & Compliance (07-09)
| File | Role | Focus Area |
|------|------|------------|
| `07-security-vulnerability-analysis.md` | Security Researcher | Vulnerability analysis, threat modeling |
| `08-dependency-security-analysis.md` | Vendor Security Analyst | Third-party risk, supply chain security |
| `09-privacy-compliance-analysis.md` | Privacy Analyst | GDPR compliance, data protection |

### Phase 3: Quality & Testing (10-12)
| File | Role | Focus Area |
|------|------|------------|
| `10-test-coverage-analysis.md` | Test Engineer | Test strategy, coverage analysis |
| `11-observability-monitoring.md` | Observability Engineer | Logging, metrics, tracing |
| `12-pre-commit-quality-checks.md` | Quality Engineer | Pre-commit validation pipeline |

### Phase 4: Documentation & Workflow (13-15)
| File | Role | Focus Area |
|------|------|------------|
| `13-documentation-generation.md` | Technical Writer | Documentation synthesis |
| `14-api-documentation-generator.md` | API Docs Generator | OpenAPI/Postman generation |
| `15-business-workflow-consistency.md` | Business Process Analyst | End-to-end workflow validation |

### Phase 5: Production Readiness (16-17)
| File | Role | Focus Area |
|------|------|------------|
| `16-production-readiness-audit.md` | Production Auditor | Deployment readiness assessment |
| `17-deployment-preparation.md` | Deployment Engineer | Production cleanup & preparation |

### Phase 6: Final Synthesis (18)
| File | Role | Focus Area |
|------|------|------------|
| `18-comprehensive-todo-generation.md` | Project Coordinator | Action planning, todo consolidation |

## 🔄 Common Workflows

### 1. Full Analysis (All Phases)
```bash
# Run complete 18-prompt analysis chain
# Phase 1: Foundation
claude 2-code-review/01-codebase-overview.md
claude 2-code-review/02-architecture-analysis.md
claude 2-code-review/03-api-contract-analysis.md
claude 2-code-review/04-database-optimization.md
claude 2-code-review/05-sequence-diagram-visualization.md
claude 2-code-review/06-business-analysis.md

# Phase 2: Security
claude 2-code-review/07-security-vulnerability-analysis.md
claude 2-code-review/08-dependency-security-analysis.md
claude 2-code-review/09-privacy-compliance-analysis.md

# Continue through all phases...
# Final synthesis
claude 2-code-review/18-comprehensive-todo-generation.md
```

### 2. Security-Focused Analysis
```bash
# Foundation + Security focus
claude 2-code-review/01-codebase-overview.md
claude 2-code-review/07-security-vulnerability-analysis.md
claude 2-code-review/08-dependency-security-analysis.md
claude 2-code-review/09-privacy-compliance-analysis.md
claude 2-code-review/18-comprehensive-todo-generation.md
```

### 3. Architecture Review
```bash
# Foundation + Architecture focus
claude 2-code-review/01-codebase-overview.md
claude 2-code-review/02-architecture-analysis.md
claude 2-code-review/03-api-contract-analysis.md
claude 2-code-review/04-database-optimization.md
claude 2-code-review/05-sequence-diagram-visualization.md
```

### 4. Quick Production Check
```bash
# Essential production readiness
claude 2-code-review/01-codebase-overview.md
claude 2-code-review/10-test-coverage-analysis.md
claude 2-code-review/16-production-readiness-audit.md
claude 2-code-review/17-deployment-preparation.md
```

## 📊 Output Organization

All analysis outputs are systematically organized:

```
docs/code-review/
├── code-review-todo-list.md           # Consolidated todo list (NEW!)
├── 1-CODEBASE_OVERVIEW.md
├── 2-ARCHITECTURE_ANALYSIS.md
├── 3-API_CONTRACT_ANALYSIS.md
├── 4-DATABASE_OPTIMIZATION.md
├── 5-SEQUENCE_DIAGRAM_VISUALIZATION.md
├── 6-BUSINESS_ANALYSIS.md
├── 7-SECURITY_ANALYSIS.md
├── 8-DEPENDENCY_SECURITY_ANALYSIS.md
├── 9-PRIVACY_COMPLIANCE_ANALYSIS.md
├── 10-TEST_COVERAGE_ANALYSIS.md
├── 11-OBSERVABILITY_MONITORING.md
├── 12-PRE_COMMIT_QUALITY_CHECKS.md
├── 13-DOCUMENTATION.md
├── 14-API_DOCUMENTATION.md
├── 15-BUSINESS_WORKFLOW_CONSISTENCY.md
├── 16-PRODUCTION_READINESS_AUDIT.md
├── 17-DEPLOYMENT_PREPARATION.md
├── 18-COMPREHENSIVE_TODO_LIST.md
└── components/, api/, monitoring/, diagrams/
```

## 💡 Key Features

### Todo List Generation
Each analysis prompt now generates entries in a consolidated `code-review-todo-list.md` file with:
- 🔴 CRITICAL - Immediate action required
- 🟡 HIGH - Sprint priority
- 🟢 MEDIUM - Backlog
- 🔵 LOW - Future consideration

### Developer Comment Integration
The comprehensive todo generation (prompt #18) includes:
- Search for `///AUTHOR` comment tags
- Context extraction from code location
- Priority assessment based on criticality
- Integration with memory_tasks todo system

### Cross-Reference Analysis
Each prompt builds upon previous findings:
- Sequential dependencies tracked
- Findings referenced across analyses
- Patterns detected and consolidated

## 🛠️ Tool Integration

### 🧩 Memory MCP Integration
All prompts include comprehensive Memory MCP integration:
- **Context Retrieval:** Access existing patterns and decisions
- **Finding Storage:** Persist critical issues for future reference
- **Pattern Building:** Learn from recurring issues
- **Knowledge Continuity:** Maintain context across sessions

### 🧠 Zen MCP Integration (NEW)
Enhanced analysis capabilities throughout all prompts:
- **`codereview`:** Deep code quality analysis with severity prioritization
- **`analyze`:** Architecture and pattern analysis across directories
- **`thinkdeep`:** Complex problem exploration and solution validation
- **`debug`:** Root cause analysis for identified issues
- **`chat`:** Collaborative validation and brainstorming

### 🚀 Task Tool Usage (NEW)
Efficient parallel exploration in every prompt:
- **Pattern Discovery:** Finding code patterns comprehensively
- **Security Scanning:** Identifying vulnerabilities systematically
- **Dependency Mapping:** Understanding system-wide relationships
- **Performance Analysis:** Discovering bottlenecks and issues
- **Documentation Gaps:** Finding missing or outdated docs

### 🔄 Sequential Thinking MCP
Complex reasoning for all analyses:
- **Multi-step Analysis:** Breaking down complex problems
- **Hypothesis Testing:** Validating assumptions systematically
- **Pattern Recognition:** Identifying recurring issues
- **Solution Synthesis:** Building comprehensive fixes

## 🔗 Integration Points

### With Pre-Development
```bash
# After planning, analyze integration points
claude 1-pre-development/1-create-prd.mdc
claude 2-code-review/01-codebase-overview.md
claude 2-code-review/02-architecture-analysis.md
```

### With Memory System
```bash
# Store review findings
claude 0-memory-related/m4-memory-workflow.md
# Tags: ["code-review", "findings", "project-name"]

# Track review todos
claude 0-memory-related/m3-task-management.md
```

## 📈 Success Metrics

### Review Completeness
- All 18 analyses completed
- Todo list generated and prioritized
- Critical issues identified
- Production blockers resolved

### Quality Indicators
- Architecture compliance verified
- Security vulnerabilities < threshold
- Test coverage > 80%
- Documentation complete

## 🚨 Common Issues

### 1. Large Codebases
- Start with targeted analysis
- Use focused workflows
- Leverage memory for patterns

### 2. Legacy Code
- Begin with architecture analysis
- Focus on critical paths
- Document technical debt

### 3. Time Constraints
- Use quick analysis workflows
- Focus on critical areas
- Generate essential todos only

## 📋 Best Practices

1. **Always Start with Overview** - File 01 provides essential context
2. **Follow Phase Order** - Each phase builds on previous findings
3. **Generate Todos Continuously** - Each analysis contributes to todo list
4. **Use Memory Integration** - Store patterns and decisions
5. **Validate with Production Audit** - Ensure deployment readiness

## 🧠 Tool Usage Guidelines

### When to Use Task Tool
- **Initial Discovery:** Codebase exploration in phases 1-2
- **Pattern Search:** Finding similar code patterns across files
- **Security Scanning:** Comprehensive vulnerability discovery
- **Performance Issues:** Finding bottlenecks and slow operations
- **Example:** `Task(description="Find API endpoints", prompt="Search for all REST, GraphQL, and RPC endpoints")`

### When to Use Zen MCP
- **Deep Analysis:** Use `codereview` for quality assessment
- **Architecture Review:** Use `analyze` for pattern identification
- **Problem Solving:** Use `debug` for root cause analysis
- **Strategic Planning:** Use `thinkdeep` for complex decisions
- **Validation:** Use `chat` for quick validation of findings

### When to Combine Tools
- **Security Reviews:** Task finds patterns → Zen analyzes risks → Memory stores findings
- **Architecture Analysis:** Task maps structure → Zen evaluates design → Sequential reasons about improvements
- **Performance Optimization:** Task identifies issues → Zen analyzes causes → Memory tracks solutions

---

*Part of the AI Prompts for LerianStudio ecosystem - Systematic code analysis for quality improvement*