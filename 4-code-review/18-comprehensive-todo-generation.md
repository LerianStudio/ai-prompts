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

### 🧠 Zen MCP Integration (CRITICAL FOR SYNTHESIS)
**Use Zen tools for comprehensive task prioritization:**
- **`mcp__zen__thinkdeep`** - Strategic task prioritization
  ```bash
  mcp__zen__thinkdeep
    prompt="Given all the findings from code review, what is the optimal order of addressing issues considering dependencies, risk, and effort?"
    model="pro"
    thinking_mode="high"
    focus_areas=["risk_mitigation", "quick_wins", "long_term_health", "dependencies"]
  ```
- **`mcp__zen__chat`** - Validate task groupings and priorities
  ```bash
  mcp__zen__chat
    prompt="Review this task prioritization and suggest improvements for team execution"
    model="flash"
  ```
- **Benefits**: Strategic prioritization, dependency analysis, execution optimization

### 🚀 Task Tool Usage (ESSENTIAL FOR CONSOLIDATION)
**Use Task tool for comprehensive finding aggregation:**
```bash
Task(
  description="Consolidate all findings",
  prompt="Search all code review outputs for:
    1. Critical security vulnerabilities that need immediate attention
    2. Performance bottlenecks affecting user experience
    3. Technical debt impacting maintainability
    4. Missing tests for critical paths
    5. Documentation gaps blocking onboarding
    6. Deployment risks and production readiness issues
    7. Quick wins that can be fixed immediately
    8. Long-term architectural improvements"
)
```
**Benefits**: Complete finding aggregation, no missed issues, efficient consolidation

This multi-tool approach ensures comprehensive task synthesis and strategic prioritization.

---

# Comprehensive Todo Generation from Analysis Chain

**Role**: Project Coordinator & Task Synthesizer  
**Goal**: Consolidate ACTUAL findings from all analysis outputs into prioritized, actionable todo lists 
**Session ID**: `global` for cross-project task management

## 🚨 CRITICAL: Evidence-Based Todo Consolidation

**MANDATORY PROCESS:**
1. **READ** actual todo entries from each analysis output
2. **VERIFY** every task references real findings with evidence
3. **CONSOLIDATE** duplicate tasks across analyses
4. **PRIORITIZE** based on actual impact and evidence
5. **NEVER** add hypothetical tasks without source evidence

## Prerequisites

**PRIMARY SOURCE**: Read the consolidated todo list if it exists:
- `docs/code-review/code-review-todo-list.md` - Todo entries from all analysis prompts

**REQUIRED**: Read ALL analysis outputs that exist to extract actual findings:
- `docs/code-review/1-CODEBASE_OVERVIEW.md` through `docs/code-review/17-DEPLOYMENT_PREPARATION.md`

**Evidence Requirements:**
- Every todo MUST reference the source analysis document
- Every task MUST have file:line evidence or "NOT FOUND" status
- Every priority MUST be based on actual discovered issues
- Every effort estimate MUST reflect real scope
- NO generic tasks without specific evidence

**Output Validation**: 
- If todo entries conflict, use the most specific evidence
- If duplicates exist, merge with combined context
- If no evidence exists, exclude from final list

## Core Task Synthesis Framework

### 0. Verify Analysis Outputs Exist

```bash
echo "=== Verifying which analysis outputs exist ==="

# Check which analysis files were actually generated
ANALYSIS_FILES=""
for i in {1..17}; do
  if [ -f "docs/code-review/$i-*.md" ]; then
    FILE=$(ls docs/code-review/$i-*.md 2>/dev/null | head -1)
    echo "✓ Found: $FILE"
    ANALYSIS_FILES="$ANALYSIS_FILES $FILE"
  else
    echo "❌ Missing: Analysis #$i"
  fi
done

# Check for consolidated todo list
if [ -f "docs/code-review/code-review-todo-list.md" ]; then
  echo "✓ Found consolidated todo list"
else
  echo "❌ No consolidated todo list found"
fi
```

### 1. Extract Actual Todo Entries

**Read Existing Todo Entries**:
```bash
echo "=== Extracting actual todo entries from analyses ==="

# If consolidated list exists, extract todos
if [ -f "docs/code-review/code-review-todo-list.md" ]; then
  echo "--- Extracting from consolidated list ---"
  
  # Count tasks by priority
  CRITICAL_COUNT=$(grep -c "^- \[ \].*" docs/code-review/code-review-todo-list.md | grep -B1 "🔴 CRITICAL" | wc -l)
  HIGH_COUNT=$(grep -c "^- \[ \].*" docs/code-review/code-review-todo-list.md | grep -B1 "🟡 HIGH" | wc -l)
  MEDIUM_COUNT=$(grep -c "^- \[ \].*" docs/code-review/code-review-todo-list.md | grep -B1 "🟢 MEDIUM" | wc -l)
  
  echo "Critical tasks: $CRITICAL_COUNT"
  echo "High priority tasks: $HIGH_COUNT"
  echo "Medium priority tasks: $MEDIUM_COUNT"
fi

# Extract todos with evidence from individual analyses
echo "--- Extracting todos with evidence ---"
for file in $ANALYSIS_FILES; do
  echo "Checking $file for todo entries..."
  
  # Look for todo sections
  grep -A20 "## 📋 Todo List\|### 🔴 CRITICAL\|### 🟡 HIGH" "$file" 2>/dev/null | grep -E "^- \[ \]" | head -5
done
```

### 2. Verify Evidence for Each Task

**Evidence Validation**:
```bash
echo "=== Validating task evidence ==="

# For each todo entry found, verify it has evidence
# Pattern: Look for file:line references or "Evidence:" fields

# Extract tasks with file:line evidence
echo "--- Tasks with file:line evidence ---"
grep -E "\`[^:]+:[0-9]+\`|file:line|Evidence:" docs/code-review/code-review-todo-list.md 2>/dev/null | head -20

# Extract tasks referencing "NOT FOUND" discoveries
echo "--- Tasks for missing components ---"
grep -B2 -A2 "NOT FOUND\|No .* found\|Missing" docs/code-review/code-review-todo-list.md 2>/dev/null | head -20

# Look for specific evidence patterns
echo "--- Security issues with evidence ---"
grep -B2 -A2 "hardcoded.*password\|SQL injection\|vulnerable" $ANALYSIS_FILES 2>/dev/null | grep -E ":[0-9]+|found at|Evidence:" | head -10
```

### 3. Consolidate and Deduplicate

**Task Deduplication**:
```bash
echo "=== Consolidating duplicate tasks ==="

# Common duplicate patterns to merge
DUPLICATE_PATTERNS=(
  "health.*check.*endpoint"
  "README.*missing"
  "test.*coverage"
  "error.*handling"
  "documentation.*API"
  "hardcoded.*secret"
  "no.*dockerfile"
)

# For each pattern, find all occurrences
for pattern in "${DUPLICATE_PATTERNS[@]}"; do
  echo "--- Checking for duplicate: $pattern ---"
  MATCHES=$(grep -i "$pattern" docs/code-review/code-review-todo-list.md 2>/dev/null | wc -l)
  if [ "$MATCHES" -gt 1 ]; then
    echo "Found $MATCHES instances of '$pattern' - should be merged"
    grep -i "$pattern" docs/code-review/code-review-todo-list.md | head -3
  fi
done
```

### 4. Extract Developer Comments

**Search for Developer TODO Comments**:
```bash
echo "=== Searching for developer TODO comments ==="

# Find source files
SOURCE_FILES=$(find . -name "*.go" -o -name "*.js" -o -name "*.ts" -o -name "*.py" -o -name "*.java" | grep -v node_modules | grep -v vendor)

# Search for triple-slash comments
echo "--- Searching for /// comments ---"
AUTHOR_COMMENTS=$(grep -n "///[A-Z]" $SOURCE_FILES 2>/dev/null | grep -E "///.*(TODO|FIXME|todo|fix)")

if [ -n "$AUTHOR_COMMENTS" ]; then
  echo "✓ Found developer comments:"
  echo "$AUTHOR_COMMENTS" | head -10
  
  # Extract author and task
  echo "$AUTHOR_COMMENTS" | while read line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    COMMENT=$(echo "$line" | cut -d: -f3-)
    
    # Parse author from comment
    if echo "$COMMENT" | grep -q "///[A-Z][A-Z]*"; then
      AUTHOR=$(echo "$COMMENT" | sed 's/.*\/\/\/\([A-Z][A-Z]*\).*/\1/')
      TASK=$(echo "$COMMENT" | sed 's/.*\/\/\/[A-Z][A-Z]*[: -]*//')
      echo "Author: $AUTHOR, Task: $TASK, Location: $FILE:$LINE_NUM"
    fi
  done
else
  echo "No /// developer comments found"
fi
```

### 5. Priority Assessment Based on Evidence

**Categorize by Actual Impact**:
```bash
echo "=== Assessing priority based on evidence ==="

# Critical: Security issues with evidence
echo "--- Critical security issues ---"
grep -E "hardcoded.*password.*found|SQL.*injection.*at|vulnerable.*dependency" $ANALYSIS_FILES 2>/dev/null | head -10

# High: Missing core functionality
echo "--- High priority gaps ---"
grep -E "NO.*FOUND.*test|missing.*error.*handling|no.*health.*check" $ANALYSIS_FILES 2>/dev/null | head -10

# Medium: Quality improvements
echo "--- Medium priority improvements ---"
grep -E "coverage.*[0-9]+%|TODO.*found|console\.log.*found" $ANALYSIS_FILES 2>/dev/null | head -10
```

## Token-Optimized Output Structure

Create `docs/code-review/18-COMPREHENSIVE_TODO_LIST.md` with ONLY discovered issues:

```markdown
# Comprehensive Development Todo List - EVIDENCE-BASED ONLY

## Executive Summary
- **Total Tasks**: [Actual count from consolidated findings]
- **Critical Issues**: [Count of actual security/stability blockers found]
- **Development Tasks**: [Count of missing features/implementations found]
- **Infrastructure Tasks**: [Count of missing monitoring/deployment items]
- **Quality Tasks**: [Count of test/documentation gaps found]

## Priority Matrix - DISCOVERED ISSUES ONLY

### 🔴 CRITICAL (Immediate - This Week)
[Only include items with evidence from analyses #1-17]

| Task                      | Category   | Impact | Effort | Evidence              | Source Analysis |
| ------------------------- | ---------- | ------ | ------ | --------------------- | --------------- |
| [Actual task from scan]   | Security   | High   | [Est]  | `[file:line]` found   | Prompt #7       |
| [Actual missing feature]  | Stability  | High   | [Est]  | NOT FOUND in project  | Prompt #16      |

### 🟡 HIGH (Sprint Priority - 2 Weeks)
[Only include verified issues from analyses]

| Task                      | Category   | Impact | Effort | Evidence              | Source Analysis |
| ------------------------- | ---------- | ------ | ------ | --------------------- | --------------- |
| [Actual gap found]        | Feature    | Medium | [Est]  | Missing in `[file]`   | Prompt #3       |
| [Actual test gap]         | Quality    | Medium | [Est]  | 0% coverage `[comp]`  | Prompt #10      |

### 🟢 MEDIUM (Backlog - Next Quarter)
[Only include improvements based on findings]

| Task                      | Category   | Impact | Effort | Evidence              | Source Analysis |
| ------------------------- | ---------- | ------ | ------ | --------------------- | --------------- |
| [Actual tech debt]        | Tech Debt  | Low    | [Est]  | TODO at `[file:line]` | Prompt #16      |
| [Missing docs found]      | Docs       | Low    | [Est]  | No API docs found     | Prompt #13      |

### 🔵 LOW (Future - No Timeline)
[Only include nice-to-haves based on discoveries]

| Task                      | Category   | Impact | Effort | Evidence              | Source Analysis |
| ------------------------- | ---------- | ------ | ------ | --------------------- | --------------- |
| [Actual enhancement]      | Feature    | Low    | [Est]  | Suggested in comment  | Prompt #6       |

### 📝 DEVELOPER COMMENTS (Extracted from Code)
[Only include actual /// comments found in Step 4]

| Comment                   | Author | Context                  | File:Line      | Priority | Extracted |
| ------------------------- | ------ | ------------------------ | -------------- | -------- | --------- |
| [Actual TODO comment]     | [AUTH] | [Function/class context] | `[file:line]`  | [Based]  | ✓         |

## Category Breakdown - BASED ON ACTUAL FINDINGS

### Security & Compliance ([Actual count] tasks)
[Only include if security issues were found in analyses]
- **Critical**: [List actual security vulnerabilities found]
- **Dependencies**: [Actual vulnerable dependencies discovered]
- **Compliance**: [Actual compliance gaps identified]

### Development & Features ([Actual count] tasks)
[Only include if missing features were found]
- **Missing Features**: [Features marked as NOT IMPLEMENTED]
- **API Gaps**: [Endpoints without implementations]
- **Business Logic**: [Incomplete implementations found]

### Infrastructure & Operations ([Actual count] tasks)
[Only include if infrastructure gaps were found]
- **Monitoring**: [Missing logging/metrics from analysis #11]
- **Deployment**: [Missing CI/CD from analysis #17]
- **Performance**: [Actual bottlenecks from analysis #6]

### Quality & Documentation ([Actual count] tasks)
[Only include if quality issues were found]
- **Testing**: [Actual coverage gaps from analysis #10]
- **Documentation**: [Missing docs from analysis #13]
- **Code Quality**: [Quality issues from analysis #12]

### Developer Comments ([Actual count] tasks)
[Only include if /// comments were found]
- **By Author**: [Group actual comments by author]
- **By Component**: [Group by file/module]
- **By Priority**: [Based on code criticality]

## Sprint Planning Guide - EVIDENCE-BASED

### Sprint 1 (Week 1-2): Address Critical Findings
- Focus on actual 🔴 CRITICAL issues found
- Priority: [List specific critical items discovered]
- Success metrics: [Based on actual gaps to close]

### Sprint 2 (Week 3-4): High Priority Gaps
- Focus on actual 🟡 HIGH priority findings
- Priority: [List specific high priority items]
- Success metrics: [Based on coverage improvements needed]

### Sprint 3 (Week 5-6): Quality Improvements
- Focus on actual 🟢 MEDIUM priority issues
- Priority: [List specific quality gaps found]
- Success metrics: [Based on current vs target state]

## Task Dependencies - DISCOVERED RELATIONSHIPS

### Actual Prerequisite Chains
[Only include dependencies discovered in analyses]
1. [Actual dependency found] → [What it blocks]
2. [Security fix needed] → [Before feature can proceed]

### Actual Blocking Issues
[Only include real blockers found]
- [ ] [Specific blocker from analysis]
- [ ] [Missing component that blocks another]

## Resource Allocation - BASED ON FINDINGS

### Suggested Team Focus
[Based on actual issues found]
- **Backend**: [Count] security issues, [Count] API gaps
- **Frontend**: [Count] UI issues, [Count] missing features
- **DevOps**: [Count] infrastructure gaps
- **QA**: [Count] test coverage gaps

### Realistic Time Estimates
[Based on actual work discovered]
- **Critical fixes**: [Based on count and complexity]
- **Feature completion**: [Based on gaps found]
- **Infrastructure**: [Based on missing components]
- **Quality**: [Based on coverage gaps]

## Success Metrics - BASED ON ACTUAL GAPS

### Weekly Goals (Evidence-Based)
[Only include goals for actual issues found]
- Week 1: Fix [Count] critical security issues found in analysis #7
- Week 2: Close [Count] missing implementations from analysis #16
- Week 3: Add monitoring to [Count] unlogged components from #11
- Week 4: Document [Count] undocumented APIs from analysis #13

### Monthly Objectives (From Discoveries)
- Month 1: Close all [Count] security gaps + [Count] critical TODOs
- Month 2: Achieve [Target]% test coverage (from current [X]%)
- Month 3: Complete [Count] missing features + documentation

## Risk Mitigation - ACTUAL RISKS FOUND

### High-Risk Items Discovered
[Only include risks actually found in analyses]
1. **[Actual risky component]** - [Evidence from analysis]
2. **[Security vulnerability]** - Found at [file:line]
3. **[Missing critical feature]** - Impact on [component]

### Mitigation for Discovered Issues
[Based on actual findings]
- **For hardcoded secrets**: [If found] Immediate rotation + env vars
- **For missing tests**: [If found] Block deployments until covered
- **For no monitoring**: [If found] Add before next incident
- **For missing docs**: [If found] Document as we fix

## Validation Summary

### Analysis Coverage
- Prompts executed: [1-17 or subset]
- Files analyzed: [Total count from scans]
- Issues discovered: [Total count]
- Evidence collected: [Count of file:line references]

### Confidence Level
- 🟢 High confidence: Issues with file:line evidence
- 🟡 Medium confidence: Issues found via pattern matching
- 🔴 Low confidence: Expected but NOT FOUND items

### Next Steps
1. Review all evidence-based findings
2. Validate priority assignments
3. Assign owners based on expertise
4. Begin with critical security fixes
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

## Validation Checklist - EVIDENCE-BASED

- [ ] All existing analysis outputs (1-17) loaded and verified
- [ ] Only findings with evidence included in consolidated list  
- [ ] Every task references source analysis and evidence
- [ ] No hypothetical or aspirational tasks included
- [ ] Developer comments (///) actually searched in codebase
- [ ] TODO/FIXME comments extracted with file:line references
- [ ] Missing components documented in NOT FOUND sections
- [ ] Duplicate tasks across analyses consolidated
- [ ] Priority based on actual impact and evidence
- [ ] Resource estimates based on real scope discovered
- [ ] Success metrics tied to closing actual gaps
- [ ] Risk items based on discovered vulnerabilities
- [ ] Memory MCP stores only verified findings
- [ ] Sprint planning reflects actual work needed

## Integration Notes

This prompt (#18) completes the analysis chain by consolidating ONLY discovered issues from all previous analyses into an evidence-based action plan. 

**Chain Validation**: This prompt reads actual outputs from analyses #1-17, extracts only verified findings with evidence, and creates a consolidated todo list based on real discoveries - not hypothetical improvements.

**Developer Comment Discovery**: The prompt searches for actual `///AUTHOR` patterns in source code, extracts the real comments found, identifies the code context, and includes them with proper file:line attribution - not example comments.

**Evidence Requirements**: Every item in the final todo list MUST trace back to a specific finding from a previous analysis or a discovered comment in the codebase. Items marked "NOT FOUND" represent expected components that were searched for but don't exist.

## File Organization

**REQUIRED OUTPUT LOCATIONS:**
- `docs/code-review/18-COMPREHENSIVE_TODO_LIST.md` - Final consolidated task list with evidence
- `docs/code-review/code-review-todo-list.md` - Update with final comprehensive findings

**MANDATORY**: Use the Write tool to create these files after completing the synthesis analysis.