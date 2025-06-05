## 🧠 Enhanced Reasoning Instructions

**IMPORTANT**: Use both Memory MCP and Sequential Thinking MCP for enhanced analysis:

### Memory MCP Integration
- Store findings, decisions, and patterns in memory for cross-session learning
- Reference previous analysis and build upon established knowledge
- Tag entries appropriately for organization and retrieval

### Sequential Thinking MCP Usage  
- Use `mcp__sequential-thinking__sequentialthinking` for complex analysis and reasoning
- Break down complex problems into systematic thinking steps
- Allow thoughts to evolve and build upon previous insights
- Question assumptions and explore alternative approaches
- Generate and verify solution hypotheses through structured reasoning

This approach enables deeper analysis, better pattern recognition, and more thorough problem-solving capabilities.

---

# Comprehensive Todo Generation from Analysis Chain

**Role**: Project Coordinator & Task Synthesizer  
**Goal**: Generate comprehensive, actionable todo lists from complete analysis chain outputs 
**Session ID**: `global` for cross-project task management

## Prerequisites

**REQUIRED**: Read ALL analysis outputs from the complete chain:
- `.claude/0-CODEBASE_OVERVIEW.md` - Foundation tasks and architectural improvements
- `.claude/1-ARCHITECTURE_ANALYSIS.md` - Design pattern improvements and refactoring tasks
- `.claude/2-SECURITY_ANALYSIS.md` - Security vulnerabilities and hardening tasks
- `.claude/3-BUSINESS_ANALYSIS.md` - Business logic improvements and feature gaps
- `.claude/4-API_CONTRACT_ANALYSIS.md` - API improvements and standardization tasks
- `.claude/5-DATABASE_OPTIMIZATION.md` - Database performance and schema improvements
- `.claude/6-OBSERVABILITY_MONITORING.md` - Monitoring and logging implementation tasks
- `.claude/7-DEPENDENCY_SECURITY_ANALYSIS.md` - Dependency updates and security patches
- `.claude/8-PRIVACY_COMPLIANCE_ANALYSIS.md` - Privacy compliance and data protection tasks
- `.claude/9-TEST_COVERAGE_ANALYSIS.md` - Testing improvements and coverage expansion
- `.claude/10-DOCUMENTATION_GENERATION.md` - Documentation creation and maintenance tasks
- `.claude/11-PRODUCTION_READINESS_AUDIT.md` - Production deployment and operations tasks
- `.claude/12-API_DOCUMENTATION_GENERATOR.md` - API documentation and client integration tasks
- `.claude/13-PRE_COMMIT_QUALITY_CHECKS.md` - Quality assurance and automation tasks
- `.claude/14-DEPLOYMENT_PREPARATION.md` - Deployment pipeline and infrastructure tasks
- `.claude/15-SEQUENCE_DIAGRAMS.md` - Visual documentation and communication tasks
- `.claude/16-BUSINESS_WORKFLOW_CONSISTENCY.md` - Process optimization and workflow tasks

**Cross-Reference**: Synthesize findings across all domains to create comprehensive action plans.

**Output Review**: If `.claude/17-COMPREHENSIVE_TODO_LIST.md` exists, review and merge with new findings.

## Core Task Synthesis Framework

### 1. Critical Issue Extraction (10min)

**High-Priority Task Discovery**:
```bash
# Extract critical findings from all analysis files
rg "🔴|Critical|High-Impact|CRITICAL|Security Risk" .claude/*.md -A 2 -B 1
rg "MUST|REQUIRED|URGENT|IMMEDIATE" .claude/*.md -A 1
rg "vulnerability|exploit|breach|failure" .claude/*.md -A 2
```

**Security & Compliance Tasks**:
```bash
# Security-related action items
rg "fix|patch|update|upgrade|implement" .claude/2-SECURITY*.md .claude/7-DEPENDENCY*.md .claude/8-PRIVACY*.md -A 1
rg "TODO|FIXME|BUG|ISSUE" .claude/*.md -A 1 -B 1
```

### 2. Development Task Classification (15min)

**Feature & Enhancement Tasks**:
```bash
# Development improvements from all analyses
rg "enhancement|improvement|optimize|refactor" .claude/*.md -A 2
rg "missing|lacking|incomplete|partial" .claude/*.md -A 1
rg "should|could|recommend|suggest" .claude/*.md -A 2
```

**Technical Debt & Quality Tasks**:
```bash
# Code quality and technical debt items
rg "debt|legacy|deprecated|outdated" .claude/*.md -A 1
rg "standardize|normalize|consolidate" .claude/*.md -A 1
rg "test|coverage|documentation" .claude/*.md -A 2
```

### 3. Infrastructure & Operations Tasks (10min)

**Deployment & Monitoring Tasks**:
```bash
# Infrastructure and operational improvements
rg "deploy|monitor|alert|metric|log" .claude/*.md -A 2
rg "scale|performance|availability|reliability" .claude/*.md -A 1
rg "backup|disaster|recovery|failover" .claude/*.md -A 1
```

### 4. Business Process Tasks (10min)

**Workflow & Process Improvements**:
```bash
# Business process and workflow tasks
rg "workflow|process|business|user.*experience" .claude/*.md -A 2
rg "integration|client|api.*contract" .claude/*.md -A 1
rg "compliance|audit|policy|procedure" .claude/*.md -A 1
```

### 5. Developer Comment Tags (5min)

**Personal Todo Comments Search**:
```bash
# Search for triple-slash developer comment tags
rg "///\w+" --type go,js,ts,py,java,rs,php,rb,kt,swift -A 1 -B 1
rg "///" . --include="*.{go,js,ts,py,java,rs,php,rb,kt,swift,c,cpp,h,hpp}" -A 1 -B 1
```

**Comment Context Analysis**:
- Extract developer-specific todos from inline code comments
- Parse comment format: `///NAME - description` or `///NAME: description`
- Understand context of where comment was placed (function, class, file)
- Determine priority based on code location (critical paths vs utilities)
- Add to memory_tasks todo list with proper attribution

## Token-Optimized Output Structure

Create `.claude/17-COMPREHENSIVE_TODO_LIST.md`:

```markdown
# Comprehensive Development Todo List

## Executive Summary
- **Total Tasks**: N tasks across M categories
- **Critical Issues**: X security/stability tasks requiring immediate attention
- **Development Tasks**: Y feature/enhancement tasks for sprint planning
- **Infrastructure Tasks**: Z operational/monitoring tasks for DevOps
- **Business Tasks**: W process/workflow improvements for product team

## Priority Matrix

### 🔴 CRITICAL (Immediate - This Week)
| Task                      | Category   | Impact | Effort | Files         | Owner   |
| ------------------------- | ---------- | ------ | ------ | ------------- | ------- |
| Fix SQL injection in auth | Security   | High   | 2h     | `auth.go:45`  | Backend |
| Implement rate limiting   | Security   | High   | 4h     | `middleware/` | Backend |
| Add health check endpoint | Operations | High   | 2h     | `handlers/`   | Backend |

### 🟡 HIGH (Sprint Priority - 2 Weeks)
| Task                           | Category     | Impact | Effort | Files          | Owner      |
| ------------------------------ | ------------ | ------ | ------ | -------------- | ---------- |
| Implement user onboarding flow | Feature      | Medium | 1w     | `user/`, `ui/` | Full-stack |
| Add API versioning             | Architecture | Medium | 3d     | `api/`         | Backend    |
| Setup automated testing        | Quality      | Medium | 1w     | `test/`        | DevOps     |

### 🟢 MEDIUM (Backlog - Next Quarter)
| Task                           | Category      | Impact | Effort | Files        | Owner      |
| ------------------------------ | ------------- | ------ | ------ | ------------ | ---------- |
| Refactor legacy payment module | Tech Debt     | Low    | 2w     | `payment/`   | Backend    |
| Add OpenAPI documentation      | Documentation | Low    | 1w     | `docs/`      | Backend    |
| Implement user analytics       | Feature       | Low    | 1w     | `analytics/` | Full-stack |

### 🔵 LOW (Future - No Timeline)
| Task                     | Category     | Impact | Effort | Files   | Owner        |
| ------------------------ | ------------ | ------ | ------ | ------- | ------------ |
| Migrate to microservices | Architecture | Low    | 3m     | `*`     | Architecture |
| Add internationalization | Feature      | Low    | 1m     | `i18n/` | Frontend     |

### 📝 DEVELOPER COMMENTS (Tagged by Author)
| Comment                   | Author | Context                  | File:Line      | Priority | Status  |
| ------------------------- | ------ | ------------------------ | -------------- | -------- | ------- |
| migrate from chi to fiber | FRED   | HTTP router replacement  | `server.go:15` | Medium   | Pending |
| refactor user validation  | JEFF   | Authentication flow      | `auth.go:45`   | High     | Pending |
| add caching layer         | ALICE  | Performance optimization | `api.go:120`   | Low      | Pending |

## Category Breakdown

### Security & Compliance (X tasks)
- **Critical**: [List critical security tasks]
- **Dependencies**: [Security patches, library updates]
- **Compliance**: [GDPR, SOC2, regulatory requirements]

### Development & Features (Y tasks)
- **New Features**: [User-facing functionality]
- **API Improvements**: [Endpoint enhancements, versioning]
- **Business Logic**: [Core functionality improvements]

### Infrastructure & Operations (Z tasks)
- **Monitoring**: [Logging, metrics, alerting]
- **Deployment**: [CI/CD, automation, scaling]
- **Performance**: [Optimization, caching, database tuning]

### Quality & Documentation (W tasks)
- **Testing**: [Unit, integration, E2E test improvements]
- **Documentation**: [API docs, user guides, architecture]
- **Code Quality**: [Refactoring, linting, standards]

### Developer Comments (P tasks)
- **Personal Todos**: [Author-specific tasks from inline comments]
- **Context Analysis**: [Function/class/module context where comment appears]
- **Priority Assessment**: [Based on code criticality and author input]

## Sprint Planning Guide

### Sprint 1 (Week 1-2): Critical Stability
- Focus on 🔴 CRITICAL tasks
- Priority: Security vulnerabilities and system stability
- Success metrics: Zero critical issues, basic monitoring

### Sprint 2 (Week 3-4): Core Features
- Focus on 🟡 HIGH priority development tasks
- Priority: User-facing features and API improvements
- Success metrics: Key user workflows functional

### Sprint 3 (Week 5-6): Quality & Documentation
- Focus on 🟢 MEDIUM priority quality tasks
- Priority: Testing, documentation, code quality
- Success metrics: Test coverage >80%, API documented

## Task Dependencies

### Prerequisite Chain
1. **Security Foundation** → Development Features → Quality Improvements
2. **Infrastructure Monitoring** → Performance Optimization → Scaling
3. **API Standardization** → Documentation → Client Integration
4. **Business Process Validation** → Workflow Automation → User Experience

### Blocking Dependencies
- [ ] Database migrations must complete before feature development
- [ ] Authentication system must be secured before user features
- [ ] Monitoring must be implemented before production deployment
- [ ] API contracts must be defined before client integration

## Resource Allocation

### Team Assignments
- **Backend Team**: Security tasks, API improvements, database optimization
- **Frontend Team**: User experience, client integration, documentation
- **DevOps Team**: Infrastructure, monitoring, deployment automation
- **QA Team**: Testing framework, coverage improvement, quality gates

### Time Estimates
- **Security & Critical**: 2-3 weeks (highest priority)
- **Development Features**: 4-6 weeks (parallel with security)
- **Infrastructure & Ops**: 3-4 weeks (ongoing)
- **Quality & Docs**: 2-3 weeks (continuous)

## Success Metrics

### Weekly Goals
- Week 1: All critical security issues resolved
- Week 2: Core user workflows functional and tested
- Week 3: Basic monitoring and alerting operational
- Week 4: API documentation complete and accurate

### Monthly Objectives
- Month 1: System secure, stable, and monitored
- Month 2: Core features complete with quality gates
- Month 3: Performance optimized and fully documented

## Risk Mitigation

### High-Risk Tasks
1. **Database migrations** - Plan rollback strategy
2. **Authentication changes** - Staged deployment approach
3. **Infrastructure changes** - Blue-green deployment
4. **API breaking changes** - Versioning and deprecation plan

### Contingency Plans
- **Security incident**: Emergency patch process defined
- **Performance degradation**: Rollback and optimization plan
- **Feature delivery delays**: MVP scope reduction strategy
- **Resource constraints**: External contractor engagement plan
```

## Memory Integration with Global Session

**Store Comprehensive Task Analysis**:
```bash
# Store in memory with global session for cross-project access
memory_store_chunk 
  content="Comprehensive todo analysis: X critical, Y high, Z medium priority tasks identified across security, development, infrastructure, and quality domains"
  session_id="global"
  repository="global"
  tags=["todo-generation", "project-planning", "task-synthesis", "cross-analysis"]

memory_store_decision
  decision="Task prioritization framework: Critical security first, then features, then quality improvements"
  rationale="Based on analysis of 17-prompt chain covering architecture, security, business, and operational domains"
  context="Session tagged as 'global' for cross-project task management and coordination"
  session_id="global"
  repository="global"

memory_create_thread
  name="Comprehensive Project Todo Management"
  description="Master task list synthesized from complete 17-prompt analysis chain covering all engineering domains"
  chunk_ids=["task-synthesis", "priority-matrix", "sprint-planning"]
  session_id="global"
  repository="global"
```

**Developer Comment Tasks Integration**:
```bash
# Process each found comment and add to memory_tasks
# For each comment found: ///AUTHOR - description at file:line
memory_tasks todo_write
  todos=[
    {
      "content": "[AUTHOR] - [description] (Context: [function/class context])",
      "status": "pending", 
      "priority": "[high|medium|low based on code location]",
      "id": "[unique-id]",
      "metadata": {
        "author": "[AUTHOR]",
        "file": "[file:line]",
        "context": "[function/class/module context]",
        "comment_type": "developer_todo"
      }
    }
  ]
  session_id="global"
  repository="global"
```

**Tags**: `todo-generation`, `task-synthesis`, `project-planning`, `cross-analysis`, `global-session`

## Validation Checklist

- [ ] All 17 analysis outputs reviewed and synthesized
- [ ] Critical security and stability tasks identified and prioritized
- [ ] Development tasks categorized by impact and effort
- [ ] Infrastructure and operational tasks included
- [ ] Business process improvements captured
- [ ] Developer comment tags (///) searched and processed
- [ ] Personal todos extracted with author attribution and context
- [ ] Comment priorities assessed based on code location criticality
- [ ] Task dependencies mapped and documented
- [ ] Resource allocation and timeline estimates provided
- [ ] Success metrics and risk mitigation plans defined
- [ ] Memory MCP entries created with global session tagging
- [ ] Developer comment tasks integrated into memory_tasks todo list
- [ ] Sprint planning guidance provided for immediate action

## Integration Notes

This prompt (#17) completes the analysis ecosystem by transforming technical findings into actionable project management artifacts. The global session tagging enables cross-project task coordination and resource planning across the LerianStudio ecosystem.

**Chain Completion**: This prompt synthesizes all previous analyses (#0-16) plus developer inline comments into executable project plans with clear priorities, timelines, and success metrics for immediate team implementation.

**Developer Comment Processing**: The prompt includes comprehensive search for `///AUTHOR` comment tags throughout the codebase, extracts the context where comments appear (function, class, module), assesses priority based on code criticality, and integrates them into the memory_tasks todo system with proper attribution and metadata for project coordination.