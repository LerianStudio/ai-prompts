# Business Workflow Consistency Analysis

**Role**: Product Business Analyst  
**Goal**: Validate end-to-end business process integrity and workflow consistency  
**Token Optimization**: 70% reduction via focused validation matrices and dependency analysis

## Prerequisites

**REQUIRED**: Read ALL previous analysis outputs:
- `.claude/0-CODEBASE_OVERVIEW.md` - Foundation understanding
- `.claude/1-ARCHITECTURE_ANALYSIS.md` - System design patterns
- `.claude/2-SECURITY_ANALYSIS.md` - Auth/authorization flows
- `.claude/3-BUSINESS_ANALYSIS.md` - Business logic and rules
- `.claude/4-API_CONTRACT_ANALYSIS.md` - Endpoint specifications
- `.claude/5-DATABASE_OPTIMIZATION.md` - Data flow patterns
- `.claude/6-OBSERVABILITY_MONITORING.md` - Process tracking
- `.claude/7-DEPENDENCY_SECURITY_ANALYSIS.md` - External service dependencies
- `.claude/8-PRIVACY_COMPLIANCE_ANALYSIS.md` - Data handling workflows
- `.claude/9-TEST_COVERAGE_ANALYSIS.md` - Business scenario coverage
- `.claude/10-DOCUMENTATION_GENERATION.md` - Process documentation
- `.claude/11-PRODUCTION_READINESS_AUDIT.md` - Operational workflows
- `.claude/12-API_DOCUMENTATION_GENERATOR.md` - Client integration patterns
- `.claude/13-PRE_COMMIT_QUALITY_CHECKS.md` - Quality gates
- `.claude/14-DEPLOYMENT_PREPARATION.md` - Release workflows
- `.claude/15-SEQUENCE_DIAGRAMS.md` - Process visualizations

**Cross-Reference**: Use findings from architectural (#1), business (#3), API (#4), and testing (#9) analysis.

**Output Review**: If `.claude/16-BUSINESS_WORKFLOW_CONSISTENCY.md` exists, review and update against current codebase state.

## Core Analysis Framework

### 1. Business Process Mapping (15min)

**Workflow Discovery**:
```bash
# Critical business processes identification
rg -i "workflow|process|journey|funnel" --type md,js,ts,go,py -A 3 -B 1
rg "(create|update|delete|approve|reject|submit)" controllers/ handlers/ services/ -A 2
rg "state|status|transition" --type go,js,ts,py -A 2
```

**Process Chain Validation**:
- Map complete user journeys from entry to completion
- Identify process dependencies and prerequisites
- Validate state transitions and business rules
- Check for process dead-ends or infinite loops

### 2. Client Integration Consistency (10min)

**Entry Point Analysis**:
```bash
# API endpoint accessibility validation
rg "router\.|app\.|mux\." --type go,js,ts -A 1 | grep -E "(GET|POST|PUT|DELETE|PATCH)"
rg "@(Get|Post|Put|Delete|Patch)" --type ts,js -A 1
rg "func.*Handler|ServeHTTP" --type go -A 3
```

**Client Journey Mapping**:
- Validate all endpoints are discoverable and documented
- Check required vs optional parameters consistency
- Verify authentication/authorization requirements
- Ensure error responses guide next actions

### 3. Information Flow Validation (10min)

**Data Consistency Checks**:
```bash
# Required field validation across layers
rg "required|mandatory|must" validation/ models/ schemas/ -A 2 -B 1
rg "validate|check|verify" --type go,js,ts,py -A 2
rg "missing|empty|null|undefined" error/ --type go,js,ts,py -A 1
```

**Workflow Information Requirements**:
- Map information collection points vs usage points
- Validate required data is collected before needed
- Check for information gaps in business processes
- Verify data transformations preserve business meaning

### 4. Process Completeness Audit (10min)

**Business Logic Integrity**:
```bash
# Critical business operations validation
rg "(transaction|payment|order|booking|approval)" --type go,js,ts,py -A 3 -B 1
rg "rollback|compensate|undo|cancel" --type go,js,ts,py -A 2
rg "(success|failure|error).*callback" --type go,js,ts,py -A 2
```

**End-to-End Process Validation**:
- Verify all business processes have clear completion criteria
- Check for proper error handling and recovery paths
- Validate notification and feedback mechanisms
- Ensure audit trails for critical operations

## Token-Optimized Output Structure

Create `.claude/16-BUSINESS_WORKFLOW_CONSISTENCY.md`:

```markdown
# Business Workflow Consistency Analysis

## Executive Summary
- **Process Coverage**: X of Y critical workflows validated
- **Integration Gaps**: N client-facing inconsistencies found
- **Information Flow**: M data requirement mismatches identified
- **Business Logic**: P process integrity issues discovered

## Critical Findings

### 🔴 High-Impact Issues
1. **[Process Name]** - `file:line` - Impact: [business consequence]
2. **[Integration Gap]** - `file:line` - Impact: [client experience]

### 🟡 Medium-Impact Issues
- [Issue] - `file:line` - [quick fix description]

### ✅ Validated Workflows
- [Process] - Complete end-to-end validation
- [Integration] - Client journey confirmed

## Business Process Matrix

| Process | Entry Points | Required Data | Completion Criteria | Gaps |
|---------|-------------|---------------|-------------------|------|
| [Name] | API/UI paths | Data fields | Success conditions | Issues |

## Client Integration Validation

### Endpoint Accessibility
- **Discoverable**: [list] - All endpoints documented
- **Authentication**: [list] - Auth requirements clear
- **Error Guidance**: [list] - Error responses actionable

### Information Requirements
- **Data Collection**: [points] - Where data is gathered
- **Data Usage**: [points] - Where data is required
- **Gaps**: [mismatches] - Missing information flows

## Recommendations

### Immediate Actions (High Priority)
1. **[Issue]** - `file:line` - [specific fix]
2. **[Gap]** - `file:line` - [implementation needed]

### Process Improvements (Medium Priority)
- [Enhancement] - [business value]
- [Optimization] - [efficiency gain]

### Monitoring & Validation
- [Metric] - Track business process success rates
- [Alert] - Monitor critical workflow failures
```

## Memory Integration

**Store Key Findings**:
```bash
# Use MCP to store critical business workflow insights
memory_store_decision "Business Process Gap: [description]" session_id repository
memory_store_chunk "Workflow Validation: [summary]" session_id repository
```

**Tags**: `business-workflow`, `process-validation`, `client-integration`, `final-analysis`

## Validation Checklist

- [ ] All 16 critical business processes mapped and validated
- [ ] Client integration points tested for consistency
- [ ] Information flow requirements verified across workflows
- [ ] Process completion criteria clearly defined
- [ ] Error handling and recovery paths documented
- [ ] Cross-referenced findings with previous analysis outputs
- [ ] Memory MCP entries created for key insights
- [ ] Recommendations prioritized by business impact

## Chain Integration Notes

This prompt completes the 16-prompt analysis chain by validating that technical implementations serve business needs effectively. Cross-reference architectural decisions (#1), API contracts (#4), and business analysis (#3) to ensure technical solutions align with business workflow requirements.

**Final Chain Validation**: Ensure all technical analysis outputs (#1-15) support identified business workflows and client integration patterns.