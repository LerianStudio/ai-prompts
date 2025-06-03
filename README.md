# AI Prompts for LerianStudio Ecosystem

A comprehensive collection of token-optimized AI prompts designed for systematic codebase analysis, development workflows, and knowledge management within the LerianStudio ecosystem.

## 🎯 Purpose

This repository provides a complete **16-prompt analysis chain** that enables comprehensive, AI-assisted codebase analysis across multiple engineering disciplines. All prompts are optimized for token efficiency (50-75% reduction) while maintaining full functionality and chaining dependencies.

## 🔗 Complete Analysis Chain (00-15)

Sequential prompts that build upon each other with comprehensive dependency tracking:

| # | Prompt | Role | Focus Area |
|---|--------|------|------------|
| 00 | `00-codebase-overview.md` | Foundation | Initial codebase exploration |
| 01 | `01-architecture-analysis.md` | Architecture Engineer | System design, component analysis |
| 02 | `02-security-vulnerability-analysis.md` | Security Researcher | Vulnerability analysis, threat modeling |
| 03 | `03-business-analysis.md` | Business Analyst | Requirements, competitive analysis |
| 04 | `04-api-contract-analysis.md` | API Architect | API design, documentation, contracts |
| 05 | `05-database-optimization.md` | Database Architect | Schema design, optimization, modeling |
| 06 | `06-observability-monitoring.md` | Observability Engineer | Monitoring, logging, tracing, metrics |
| 07 | `07-dependency-security-analysis.md` | Vendor Security Analyst | Third-party risk, supply chain security |
| 08 | `08-privacy-compliance-analysis.md` | Privacy Analyst | GDPR compliance, data protection |
| 09 | `09-test-coverage-analysis.md` | Test Engineer | Test strategy, quality assurance |
| 10 | `10-documentation-generation.md` | Technical Writer | Documentation synthesis |
| 11 | `11-production-readiness-audit.md` | Production Auditor | Deployment readiness assessment |
| 12 | `12-api-documentation-generator.md` | API Docs Generator | OpenAPI/Postman generation |
| 13 | `13-pre-commit-quality-checks.md` | Quality Engineer | Pre-commit validation pipeline |
| 14 | `14-deployment-preparation.md` | Deployment Engineer | Production cleanup & preparation |
| 15 | `15-sequence-diagram-visualization.md` | System Visualizer | Mermaid sequence diagrams |

## 🧠 Memory Management Prompts (m1-m5)

Memory Context Protocol (MCP) integration for session continuity:

| # | Prompt | Purpose |
|---|--------|---------|
| m1 | `memory-related/m1-memory-analysis.md` | Memory pattern analysis & intelligence |
| m2 | `memory-related/m2-memory-retrieval.md` | Context retrieval & task status |
| m3 | `memory-related/m3-task-management.md` | Automated task tracking |
| m4 | `memory-related/m4-memory-workflow.md` | Session lifecycle management |
| m5 | `memory-related/m5-memory-maintenance.md` | Memory updates & cleanup |

## 🎯 Key Features

### 🔗 Chaining System
- **Sequential Dependencies**: Each prompt #1-15 references all previous outputs
- **Comprehensive Integration**: Architectural, security, and business findings cross-referenced
- **Output Review**: Existing analysis automatically updated with new findings
- **Memory MCP Integration**: Full session continuity and pattern learning

### ⚡ Token Optimization
- **50-75% Token Reduction** from original versions
- **Preserved Functionality**: All core analysis capabilities maintained
- **Practical Examples**: Working code snippets and monitoring scripts
- **Language Agnostic**: Support for Go, TypeScript, Python, Java, Rust, .NET

## 🧠 Memory Integration

All prompts are designed with Memory Context Protocol (MCP) integration:

### Key Features
- **Session Management**: Consistent lifecycle tracking
- **Knowledge Persistence**: Findings stored across sessions
- **Pattern Learning**: Cross-repository insights
- **Relationship Mapping**: Component and dependency analysis
- **Quality Monitoring**: Health checks and validation
- **Citation Generation**: Technical reference documentation

### Common Memory Operations
```bash
# Initialize session
memory_tasks session_create session_id="[role]-analysis-[timestamp]" repository="github.com/org/repo"

# Store findings
memory_store_chunk content="[analysis results]" session_id="[session]" repository="github.com/org/repo" tags="[relevant-tags]"

# Store decisions
memory_store_decision decision="[architectural choice]" rationale="[reasoning]" context="[background]" session_id="[session]" repository="github.com/org/repo"

# Generate insights
memory_intelligence auto_insights repository="github.com/org/repo" session_id="[session]"

# Complete session
memory_tasks session_end session_id="[session]" repository="github.com/org/repo"
```

## 🚀 Quick Start

### 1. Complete System Analysis
Run the full **16-prompt chain** for comprehensive codebase analysis:
```bash
# Foundation analysis
claude 00-codebase-overview.md

# Core engineering analysis (with chaining dependencies)
claude 01-architecture-analysis.md      # Uses output from #00
claude 02-security-vulnerability-analysis.md  # Uses outputs from #00-01
claude 03-business-analysis.md          # Uses outputs from #00-02
# ... continue through all 16 prompts
claude 15-sequence-diagram-visualization.md   # Uses all previous outputs
```

### 2. Focused Analysis
For specific concerns, run foundation + targeted prompts:
```bash
# Security-focused analysis
claude 00-codebase-overview.md
claude 02-security-vulnerability-analysis.md
claude 07-dependency-security-analysis.md
claude 08-privacy-compliance-analysis.md

# Architecture-focused analysis
claude 00-codebase-overview.md
claude 01-architecture-analysis.md
claude 04-api-contract-analysis.md
claude 05-database-optimization.md
```

### 3. Memory Integration
Use memory prompts for session continuity:
```bash
# Start with memory context
claude memory-related/m2-memory-retrieval.md

# Run analysis with task tracking
claude memory-related/m3-task-management.md + 01-architecture-analysis.md

# Maintain memory state
claude memory-related/m5-memory-maintenance.md
```

### 4. Access Results
Analysis outputs are systematically organized:
```
.claude/
├── 0-CODEBASE_OVERVIEW.md
├── 1-ARCHITECTURE_ANALYSIS.md
├── 2-SECURITY_ANALYSIS.md
├── ...
├── 15-SEQUENCE_DIAGRAMS.md
└── components/, api/, monitoring/

diagrams/
├── README.md
├── api-flows.md
├── auth-flows.md
└── system-interactions.md
```

## 🏗️ Integration with LerianStudio

### Ecosystem Context
This repository supports the broader LerianStudio monorepo by providing:
- **Midaz Financial Ledger**: Architecture and security analysis
- **Plugin Ecosystem**: Component analysis and integration patterns
- **SDK Development**: API design and documentation workflows
- **Infrastructure**: Observability and deployment analysis

### Repository Integration
```bash
# For LerianStudio main components
repository="github.com/lerianstudio/midaz"

# For private enterprise features  
repository="github.com/lerianstudio/midaz-private"

# For unified development
repository="github.com/lerianstudio/monorepo"
```

## 📊 Analysis Patterns

### Chained Analysis Framework
All prompts follow a systematic approach with cross-referencing:

1. **Foundation Phase (Prompt #00)**
   - Technology stack identification
   - Entry point mapping  
   - Build configuration analysis

2. **Specialist Analysis (Prompts #01-10)**
   - Architecture, security, business, API, database analysis
   - Each prompt references all previous findings
   - Cross-domain pattern recognition

3. **Production Readiness (Prompts #11-14)**
   - Readiness auditing, documentation generation
   - Quality validation, deployment preparation
   - Integration of all previous findings

4. **Visualization Synthesis (Prompt #15)**
   - Mermaid sequence diagrams
   - Complete system interaction flows
   - Final visual documentation

### Documentation Standards
- **File References**: All claims include `file:line` references
- **Mermaid Diagrams**: Component, flow, and relationship visualizations
- **Structured Output**: Consistent heading hierarchy and navigation
- **Citation Generation**: Technical and legal reference documentation

## 🔄 Workflow Examples

### Architecture Analysis Workflow
```bash
# 1. Initialize
memory_tasks session_create session_id="arch-analysis-$(date +%s)" repository="github.com/org/repo"

# 2. Load context
memory_get_context repository="github.com/org/repo"

# 3. Execute analysis (following 1-architecture-researcher.md)
# ... perform systematic analysis ...

# 4. Generate documentation
# Creates .claude/ARCHITECTURE_ANALYSIS.md with comprehensive findings

# 5. Complete session
memory_tasks session_end session_id="arch-analysis-$(date +%s)" repository="github.com/org/repo"
```

### Quality Check Workflow
```bash
# Run comprehensive quality pipeline
bash avulsos/language-agnostic-pre-push-quality-check.md

# Results in:
# - Language detection and appropriate toolchain execution
# - Security scanning and vulnerability assessment
# - Test execution and build verification
# - Quality report generation
```

## 🛠️ Customization

### Environment Variables
- `SKIP_SECURITY=true`: Skip security scans
- `QUALITY_LEVEL=strict|normal|quick`: Adjust analysis depth
- `FORCE_ANALYSIS=true`: Bypass quality gates

### Configuration Files
Create `.quality-config.json` for language-specific overrides:
```json
{
  "go": {
    "coverage_threshold": 80,
    "skip_gosec": false
  },
  "typescript": {
    "eslint_max_warnings": 0
  },
  "python": {
    "mypy_strict": true
  }
}
```

## 📈 Benefits

### For Development Teams
- **Consistent Analysis**: Standardized approaches across projects
- **Knowledge Persistence**: Insights preserved across sessions
- **Pattern Learning**: Cross-project intelligence sharing
- **Quality Assurance**: Automated quality gates and reporting

### For AI Systems
- **Structured Prompts**: Clear, systematic analysis frameworks
- **Memory Integration**: Persistent context and learning
- **Cross-Domain Insights**: Multi-disciplinary pattern recognition
- **Citation Support**: Technical reference validation

## 🤝 Contributing

### Adding New Prompts
1. Follow the established naming convention: `N-role-description.md`
2. Include memory MCP integration patterns
3. Provide structured output formats
4. Add appropriate tags and session management

### Improving Existing Prompts
1. Maintain backward compatibility
2. Enhance memory operation coverage
3. Improve token efficiency
4. Add relevant examples

## 📄 License

This project is part of the LerianStudio ecosystem. See the main repository for licensing information.

---

*Part of the [LerianStudio](https://github.com/lerianstudio) ecosystem - Building the future of financial technology with AI-assisted development.*