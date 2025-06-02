# AI Prompts for LerianStudio Ecosystem

A comprehensive collection of specialized AI prompts designed for engineering analysis, development workflows, and knowledge management within the LerianStudio ecosystem.

## 🎯 Purpose

This repository provides domain-specific prompts that enable AI-assisted analysis across multiple engineering disciplines. Each prompt is designed to work with the Memory Context Protocol (MCP) for persistent knowledge management and cross-session learning.

## 📋 Core Engineering Prompts

### Specialized Analysis Roles (1-10)

| Prompt | Role | Focus Area |
|--------|------|------------|
| `1-architecture-researcher.md` | Architecture Engineer | System design, component analysis, patterns |
| `2-security-researcher.md` | Security Researcher | Vulnerability analysis, threat modeling |
| `3-biz-product-improvement-analyst.md` | Business Analyst | Requirements, competitive analysis |
| `4-api-architect-researcher.md` | API Architect | API design, documentation, contracts |
| `5-database-researcher.md` | Database Architect | Schema design, optimization, modeling |
| `6-observability-engineer.md` | Observability Engineer | Monitoring, logging, tracing, metrics |
| `7-vendor-sec-anal-researcher.md` | Vendor Security Analyst | Third-party risk, compliance |
| `8-privacy-gdpr-analysis.md` | Privacy Analyst | GDPR compliance, data protection |
| `9-test-researcher.md` | Test Engineer | Test strategy, quality assurance |
| `10-tech-writer-engineer.md` | Technical Writer | Documentation generation, standards |

## 🔧 Utility Workflows

### Quality Assurance (`avulsos/`)
- **`language-agnostic-pre-push-quality-check.md`**: Comprehensive pre-commit quality pipeline
  - Multi-language support (Go, TypeScript, Python, Java, Rust, .NET, PHP)
  - Security scanning, linting, testing, build verification
  - CI/CD integration examples
- **`golang-pre-push-full-check.md`**: Go-specific quality checks (legacy)
- **`codebase-quick-overview.md`**: Rapid codebase analysis framework

### Memory Management (`memory-related/`)
- **`get-memory.md`**: Context retrieval and status checking
- **`analyze-memory.md`**: Pattern analysis and intelligence insights
- **`update-memory.md`**: Memory maintenance and task updates
- **`memory-workflow.md`**: Complete session lifecycle management

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

### 1. Choose Your Analysis Type
Select the appropriate prompt based on your needs:
- **Architecture**: Use `1-architecture-researcher.md` for system analysis
- **Security**: Use `2-security-researcher.md` for vulnerability assessment
- **Quality**: Use `avulsos/language-agnostic-pre-push-quality-check.md` for code quality

### 2. Initialize Memory Context
```bash
# Get current context
memory_get_context repository="github.com/your-org/your-repo"

# Check existing tasks
memory_tasks todo_read session_id="current-session" repository="github.com/your-org/your-repo"
```

### 3. Execute Analysis
Follow the systematic approach in each prompt:
1. **Session Initialization**: Load context and related patterns
2. **Analysis Phase**: Execute domain-specific investigations
3. **Pattern Recognition**: Identify architectural/security/business patterns
4. **Documentation**: Generate structured reports with citations
5. **Session Completion**: Store findings and complete workflow

### 4. Access Results
Analysis outputs are stored in `.claude/` directory:
- `ARCHITECTURE_ANALYSIS.md`
- `SECURITY_ANALYSIS.md`
- `QUALITY_REPORT.md`
- etc.

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

### Systematic Analysis Framework
All prompts follow a consistent 4-phase approach:

1. **Initial Exploration**
   - Technology stack identification
   - Entry point mapping
   - Build configuration analysis

2. **Deep Component Analysis**
   - Dependency relationship mapping
   - API surface cataloging
   - Data model extraction

3. **Pattern Recognition**
   - Design pattern identification
   - Service boundary analysis
   - Performance optimization detection

4. **Documentation Creation**
   - Structured markdown output
   - Mermaid diagram generation
   - File reference validation

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