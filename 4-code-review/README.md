# Code Review Workflow

## Overview

The Code Review workflow is a streamlined 5-phase system designed for comprehensive codebase analysis. It consolidates what was previously 18 separate analyses into manageable phases with mandatory validation gates, ensuring thorough review without overwhelming complexity.

## Architecture

### 5-Phase Structure

```
1. Foundation Analysis → Gate 1 → 
2. Security & Compliance → Gate 2 → 
3. Quality & Operations → Gate 3 → 
4. Business & Documentation → Gate 4 → 
5. Production Readiness → Gate 5 → Ready for Deployment
```

### Key Design Principles

1. **Comprehensive Coverage**: Each phase combines multiple related analyses
2. **Progressive Validation**: Mandatory gates ensure quality before proceeding
3. **Tool Integration**: Leverages Memory MCP, Sequential Thinking, Zen MCP, and Task tool
4. **Confidence-Based Execution**: Adapts review depth based on codebase complexity
5. **Actionable Output**: Generates prioritized todos throughout review

## File Structure

```
4-code-review/
├── 0-review-orchestrator.mdc     # Entry point - manages workflow execution
├── 1-foundation-analysis.mdc     # Technical foundation (overview, architecture, APIs, DB)
├── 2-security-compliance.mdc     # Security and compliance assessment
├── 3-quality-operations.mdc      # Testing, monitoring, and code quality
├── 4-business-documentation.mdc  # Business logic and documentation review
├── 5-production-readiness.mdc    # Deployment readiness and action planning
└── README.md                     # This file
```

## Phase Details

### Phase 1: Foundation Analysis

**Purpose**: Establish comprehensive technical understanding of the codebase.

**Combines**:
- Codebase overview and structure
- Architecture patterns and design
- API contracts and design quality
- Database schema and optimization

**Key Outputs**:
- System architecture diagram
- Technology stack assessment
- API inventory
- Technical debt catalog

**Gate 1 Validation**:
- Architecture fully mapped
- All components identified
- Dependencies understood
- Critical issues documented

**Output**: `/docs/code-review/1-foundation-analysis.md`

### Phase 2: Security & Compliance

**Purpose**: Identify all security vulnerabilities and compliance gaps.

**Combines**:
- Security vulnerability analysis (OWASP Top 10)
- Dependency security assessment
- Privacy compliance (GDPR, industry standards)

**Key Outputs**:
- Vulnerability report by severity
- Dependency risk matrix
- Compliance gap analysis
- Threat model

**Gate 2 Validation**:
- All critical vulnerabilities found
- Dependencies scanned for CVEs
- Compliance requirements checked
- Remediation priorities set

**Output**: `/docs/code-review/2-security-compliance.md`

### Phase 3: Quality & Operations

**Purpose**: Assess code quality, test coverage, and operational readiness.

**Combines**:
- Test coverage analysis
- Observability and monitoring assessment
- Code quality and development practices

**Key Outputs**:
- Test coverage metrics
- Monitoring gap analysis
- Code quality report
- CI/CD assessment

**Gate 3 Validation**:
- Critical paths test coverage >80%
- Monitoring implemented
- Quality standards enforced
- CI/CD pipeline functional

**Output**: `/docs/code-review/3-quality-operations.md`

### Phase 4: Business & Documentation

**Purpose**: Validate business logic implementation and knowledge transfer capability.

**Combines**:
- Business logic validation
- Documentation quality assessment
- Workflow consistency verification

**Key Outputs**:
- Business rule compliance
- Documentation coverage report
- Knowledge gap analysis
- Workflow validation

**Gate 4 Validation**:
- Business rules correctly implemented
- Documentation adequate
- No critical knowledge gaps
- Workflows properly implemented

**Output**: `/docs/code-review/4-business-documentation.md`

### Phase 5: Production Readiness

**Purpose**: Final validation and comprehensive action planning.

**Combines**:
- Production readiness audit
- Deployment preparation
- Comprehensive todo generation
- ///AUTHOR comment integration

**Key Outputs**:
- Go/No-Go decision
- Deployment checklist
- Prioritized action items
- Timeline recommendations

**Gate 5 Validation**:
- Infrastructure ready
- Operations prepared
- Deployment process tested
- Team ready

**Outputs**: 
- `/docs/code-review/5-production-readiness.md`
- `/docs/code-review/code-review-todos.md`

## Workflow Execution

### Starting the Review

```bash
# Load any previous review context
claude 0-memory-system/m0-memory-orchestrator.mdc

# Begin code review
claude 4-code-review/0-review-orchestrator.mdc
```

### Confidence-Based Flow

The system adapts based on confidence scoring:

1. **High Confidence (80%+)**: 
   - Familiar tech stack
   - Good documentation
   - Previous reviews exist
   - → Autonomous execution

2. **Medium Confidence (50-79%)**:
   - Mixed technology
   - Some documentation
   - First review
   - → Interactive validation

3. **Low Confidence (<50%)**:
   - Legacy/unusual tech
   - Minimal documentation
   - Complex architecture
   - → Guided exploration

### Gate Processing

All 5 gates are mandatory validation checkpoints using a comprehensive multi-dimensional framework:

#### Gate Validation Framework

Each gate validates across 5 dimensions:
1. **Accuracy** - Correctness of analysis
2. **Completeness** - Coverage of all areas
3. **Quality** - Depth and usefulness of findings
4. **Actionability** - Clear next steps identified
5. **Risk Assessment** - Critical issues found

#### Gate Decision Matrix

Each gate uses quantitative scoring:
- **PASS**: All criteria met (typically ≥85% score)
- **CONDITIONAL**: Minor gaps exist (typically 70-84% score)
- **FAIL**: Critical gaps prevent progress (typically <70% score)

**The 5 Mandatory Gates**:

1. **Gate 1 - Technical Foundation**
   - Validates: Architecture understanding, API completeness, database analysis
   - Pass Criteria: Technical understanding ≥85%, all critical components mapped
   - Evidence: Architecture diagrams, API inventory, technical debt register

2. **Gate 2 - Security Validation**
   - Validates: Vulnerability coverage, compliance status, remediation feasibility
   - Pass Criteria: No unmitigated CRITICAL issues, compliance ≥80%
   - Evidence: Security scan reports, CVE analysis, compliance mapping

3. **Gate 3 - Quality Assurance**
   - Validates: Test effectiveness, operational readiness, code quality
   - Pass Criteria: Critical path coverage ≥80%, monitoring complete
   - Evidence: Coverage reports, monitoring dashboards, quality metrics

4. **Gate 4 - Business Alignment**
   - Validates: Business logic accuracy, documentation quality, knowledge transfer
   - Pass Criteria: Business accuracy ≥90%, documentation ≥80%
   - Evidence: Requirements traceability, onboarding tests, workflow validation

5. **Gate 5 - Production Readiness**
   - Validates: Technical readiness, operational capability, deployment safety
   - Pass Criteria: All issues resolved, team ready, rollback tested
   - Evidence: Final test results, operational checklists, deployment runbook

## MCP Tool Integration

### Memory MCP
- **Essential**: Always starts by searching for previous reviews
- **Search**: Find patterns, standards, past issues
- **Store**: Save findings, decisions, improvement patterns
- **Tags**: Use consistent tags for retrieval

### Sequential Thinking MCP
- Analyze complex architectures
- Break down security vulnerabilities
- Plan improvement strategies
- Reason about production risks

### Zen MCP Tools
- **codereview**: Comprehensive quality analysis
- **analyze**: Architecture and pattern review
- **secaudit**: Security vulnerability assessment
- **debug**: Root cause analysis
- **thinkdeep**: Complex problem exploration

### Task Tool
- **Essential for**: Parallel pattern discovery
- **Use cases**: Finding security issues, API endpoints, test coverage
- **Benefits**: Reduces context usage, faster analysis

## Common Review Patterns

### Full Review (All 5 Phases)
- New codebases
- Pre-production validation
- Quarterly assessments
- Major refactoring preparation

### Security-Focused Review
```bash
# Phases 1, 2, and 5 only
claude 4-code-review/1-foundation-analysis.mdc
claude 4-code-review/2-security-compliance.mdc
claude 4-code-review/5-production-readiness.mdc
```

### Quality-Focused Review
```bash
# Phases 1, 3, and 5 only
claude 4-code-review/1-foundation-analysis.mdc
claude 4-code-review/3-quality-operations.mdc
claude 4-code-review/5-production-readiness.mdc
```

### Quick Review
```bash
# Phases 1 and 5 only
claude 4-code-review/1-foundation-analysis.mdc
claude 4-code-review/5-production-readiness.mdc
```

## Output Organization

```
docs/code-review/
├── review-summary.md              # Executive summary
├── 1-foundation-analysis.md       # Technical foundation
├── 2-security-compliance.md       # Security findings
├── 3-quality-operations.md        # Quality assessment
├── 4-business-documentation.md    # Business alignment
├── 5-production-readiness.md      # Final validation
├── code-review-todos.md           # Consolidated action items
└── artifacts/                     # Diagrams, reports, etc.
```

## Todo Prioritization

### 🔴 CRITICAL - Production Blockers
- Security vulnerabilities
- Data loss risks
- Service unavailability
- Compliance violations

### 🟡 HIGH - Sprint Priorities  
- Performance issues
- Missing critical tests
- Important monitoring gaps
- Key documentation missing

### 🟢 MEDIUM - Backlog Items
- Code quality improvements
- Non-critical documentation
- Enhancement opportunities
- Technical debt

### 🔵 LOW - Future Considerations
- Nice-to-have features
- Minor optimizations
- Style improvements
- Long-term refactoring

## Best Practices

1. **Always Start with Memory**: Check for previous reviews and patterns
2. **Use All Tools**: Combine Task for search, Zen for analysis, Sequential for reasoning
3. **Document at Gates**: Record validation decisions and rationale
4. **Generate Todos Continuously**: Don't wait until the end
5. **Prioritize Ruthlessly**: Focus on what blocks production
6. **Store Insights**: Use Memory MCP for future reviews

## Success Metrics

- **Review Completeness**: All phases executed or consciously skipped
- **Issue Discovery**: Critical issues identified early
- **Action Clarity**: Clear, prioritized todo list
- **Knowledge Capture**: Insights stored for future use
- **Team Enablement**: Review enables immediate action

## Key Differences from Previous 18-File System

| Aspect | Previous (18 files) | Current (5 phases) |
|--------|-------------------|-------------------|
| Files | 18 separate analyses | 5 comprehensive phases |
| Execution | Sequential, lengthy | Streamlined with gates |
| Validation | End-only | Gate at each phase |
| Flexibility | Fixed path | Confidence-based |
| Output | 18 separate docs | 5 consolidated reports |
| Time | 4-6 hours | 2-3 hours |
| Cognitive Load | High | Manageable |

## Common Issues and Solutions

### Large Codebases
- Start with targeted analysis of critical paths
- Use Task tool extensively for parallel search
- Focus on high-risk areas first

### Legacy Code
- Lower confidence score triggers guided approach
- Extra focus on documentation gaps
- Emphasize security and quality phases

### Time Constraints
- Use quick review pattern (phases 1 & 5)
- Focus on production blockers only
- Generate critical todos only

## Version History

- **v2.0**: Streamlined 5-phase workflow with mandatory gates
- **v1.0**: Original 18-file comprehensive analysis

## Related Workflows

- `0-memory-system/`: Context and pattern storage
- `1-pre-dev-product/`: New product development
- `2-pre-dev-feature/`: Feature addition workflow
- `3-frontend/`: Frontend-specific development
- `5-generate-docs/`: Documentation generation