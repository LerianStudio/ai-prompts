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

### Zen MCP Integration
Use Zen MCP tools for comprehensive business workflow analysis:

**1. Business Process Deep Analysis:**
```bash
mcp__zen__thinkdeep \
  prompt="Analyze the entire business workflow from user perspective. Map user journeys, identify decision points, validate data flow consistency, and find gaps in process implementation." \
  files=["/services", "/workflows", "/state-machines", "/api", "/models"] \
  model="pro" \
  thinking_mode="max" \
  focus_areas=["user journey", "state transitions", "data consistency", "error recovery", "business rules"]
```

**2. Workflow Consistency Review:**
```bash
mcp__zen__codereview \
  files=["/workflows", "/processes", "/services/**/*.js", "/handlers"] \
  prompt="Review business workflow implementations for consistency, completeness, and error handling. Check state transitions, transaction boundaries, and data validation at each step." \
  model="pro" \
  review_type="full" \
  focus_on="workflow completeness, state consistency, error paths, rollback mechanisms"
```

**3. Integration Point Analysis:**
```bash
mcp__zen__analyze \
  files=["/api", "/integrations", "/external-services", "/event-handlers"] \
  prompt="Analyze all integration points in business workflows. Verify data contracts, error handling, retry logic, and fallback mechanisms for external dependencies." \
  model="pro" \
  analysis_type="architecture" \
  output_format="actionable"
```

### Task Tool Usage
Search for business workflow patterns:

```bash
# Find workflow and process implementations
task search "workflow|process|state|status|flow" --context "class|function|service"

# Search for state transitions
task search "setState|updateStatus|transition|changeState|status.*="

# Find business operations
task search "create.*Order|process.*Payment|approve.*|submit.*|complete.*"

# Look for validation rules
task search "validate|validator|validation|rules|business.*rule"

# Find transaction boundaries
task search "transaction|beginTx|commit|rollback|atomic"

# Search for workflow orchestration
task search "orchestrate|coordinate|saga|workflow.*engine"

# Find event-driven patterns
task search "emit|publish|subscribe|event.*handler|on.*event"

# Look for compensation logic
task search "compensate|undo|revert|rollback|reverse"
```

**Benefits:**
- Zen MCP provides holistic business process analysis and validation
- Task tool rapidly discovers workflow implementations and patterns
- Combined approach ensures comprehensive business consistency verification

---

# Business Workflow Consistency Analysis

You are a product business analyst specializing in discovering ACTUAL business workflows through code analysis. Your goal is to identify real workflows, validate their consistency, and find gaps based on evidence.

## 🚨 CRITICAL: Discovery-First Workflow Analysis

**MANDATORY PROCESS:**
1. **DISCOVER** actual business workflows in the codebase
2. **TRACE** real user journeys through code paths
3. **VALIDATE** workflow consistency with evidence
4. **IDENTIFY** gaps in business process implementation
5. **NEVER** create hypothetical workflows without code evidence

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #15 in the analysis chain.**

**Input Validation:**
- **REQUIRED**: First read ALL outputs from prompts #1-14 if they exist
- **VERIFY**: Business processes from prompt #6 still exist
- **USE**: API endpoints from prompt #3 for entry points
- **CHECK**: Database operations from prompt #4 for data flow
- **EXAMINE**: Test scenarios from prompt #10 for coverage

**Evidence Requirements:**
- Every workflow MUST be traced through actual code
- Every state transition MUST have file:line evidence
- Every process gap MUST reference missing implementation
- Every validation MUST show actual business rules
- NO template workflows without code paths

**Chain Foundation:**
- Store only verified findings with tags: `["business-workflow", "consistency", "verified", "prompt-15"]`
- Document actual workflow implementations
- Map real user journeys with evidence
- Create consistency report based on discovered flows

## Core Analysis Framework

### 1. Discover Actual Business Workflows

#### Step 1: Find Real Business Processes

```bash
echo "=== Discovering actual business workflows in codebase ==="

# Find workflow/process implementations
echo "--- Searching for workflow implementations ---"
WORKFLOW_FILES=$(grep -r "workflow\|process\|state\|status" --include="*.{js,ts,go,py,java}" . | grep -v test | grep -v node_modules)
if [ -n "$WORKFLOW_FILES" ]; then
  echo "Workflow references found:"
  echo "$WORKFLOW_FILES" | head -20
  WORKFLOW_COUNT=$(echo "$WORKFLOW_FILES" | wc -l)
  echo "Total workflow references: $WORKFLOW_COUNT"
else
  echo "❌ NO WORKFLOW IMPLEMENTATIONS FOUND"
fi

# Find state transitions
echo "--- Searching for state transitions ---"
STATE_TRANSITIONS=$(grep -r "setState\|updateStatus\|transition\|changeState" --include="*.{js,ts,go,py}" . | grep -v test | head -20)
if [ -n "$STATE_TRANSITIONS" ]; then
  echo "State transition code found:"
  echo "$STATE_TRANSITIONS"
else
  echo "❌ NO STATE TRANSITION CODE FOUND"
fi

# Find business operations
echo "--- Searching for business operations ---"
BUSINESS_OPS=$(grep -r "create.*Order\|process.*Payment\|approve.*Request\|submit.*Application" --include="*.{js,ts,go,py}" . | grep -v test | head -20)
if [ -n "$BUSINESS_OPS" ]; then
  echo "Business operations found:"
  echo "$BUSINESS_OPS"
else
  echo "No standard business operations found - checking for custom operations"
fi
```

### 2. Trace User Journey Entry Points

#### Step 2: Map Actual Entry Points to Workflows

```bash
echo "=== Tracing user journey entry points ==="

# Find actual API endpoints that start workflows
echo "--- Finding workflow entry points ---"
if [ -f "docs/code-review/3-API_CONTRACT_ANALYSIS.md" ]; then
  echo "Using API analysis from prompt #3..."
  ENTRY_POINTS=$(grep -E "POST|PUT" docs/code-review/3-API_CONTRACT_ANALYSIS.md | grep -E "create|submit|start|initiate")
  echo "Workflow entry points from API analysis:"
  echo "$ENTRY_POINTS"
fi

# Map endpoints to handlers
echo "--- Mapping endpoints to business logic ---"
for endpoint in $(echo "$ENTRY_POINTS" | awk '{print $2}' | head -5); do
  echo "\nTracing endpoint: $endpoint"
  # Find handler for this endpoint
  HANDLER=$(grep -r "$endpoint" --include="*.{js,ts,go,py}" . | grep -E "router|app|handle" | head -1)
  if [ -n "$HANDLER" ]; then
    echo "  Handler found: $HANDLER"
    # Extract the handler function name
    HANDLER_FILE=$(echo "$HANDLER" | cut -d: -f1)
    HANDLER_LINE=$(echo "$HANDLER" | cut -d: -f2)
    echo "  Location: $HANDLER_FILE:$HANDLER_LINE"
  else
    echo "  ❌ NO HANDLER FOUND for $endpoint"
  fi
done

# Check authentication requirements
echo "--- Checking authentication for workflows ---"
AUTH_MIDDLEWARE=$(grep -r "authenticate\|requireAuth\|isAuthenticated" --include="*.{js,ts,go,py}" . | grep -v test | head -10)
if [ -n "$AUTH_MIDDLEWARE" ]; then
  echo "Authentication middleware found:"
  echo "$AUTH_MIDDLEWARE"
fi
```

### 3. Validate Workflow Data Flow

#### Step 3: Trace Data Requirements Through Workflows

```bash
echo "=== Validating workflow data consistency ==="

# Find validation rules
echo "--- Discovering validation rules ---"
VALIDATION_FILES=$(find . -name "*validat*" -o -name "*schema*" | grep -v node_modules | grep -v test)
if [ -n "$VALIDATION_FILES" ]; then
  echo "Validation files found:"
  for file in $(echo "$VALIDATION_FILES" | head -5); do
    echo "\nChecking $file:"
    # Look for required fields
    REQUIRED_FIELDS=$(grep -n "required\|mandatory" "$file" 2>/dev/null | head -5)
    if [ -n "$REQUIRED_FIELDS" ]; then
      echo "Required fields:"
      echo "$REQUIRED_FIELDS"
    fi
  done
else
  echo "❌ NO VALIDATION FILES FOUND"
fi

# Trace data flow through workflow
echo "--- Tracing data through workflow stages ---"
if [ -n "$BUSINESS_OPS" ]; then
  # For each business operation, check data flow
  for op_line in $(echo "$BUSINESS_OPS" | head -3 | cut -d: -f1,2); do
    FILE=$(echo "$op_line" | cut -d: -f1)
    LINE=$(echo "$op_line" | cut -d: -f2)
    echo "\nAnalyzing workflow at $FILE:$LINE"
    
    # Check what data is used
    DATA_ACCESS=$(sed -n "${LINE},$((LINE+20))p" "$FILE" 2>/dev/null | grep -E "\.|->|\[" | head -5)
    if [ -n "$DATA_ACCESS" ]; then
      echo "Data accessed in workflow:"
      echo "$DATA_ACCESS"
    fi
  done
fi

# Check for data validation gaps
echo "--- Checking for validation gaps ---"
UNVALIDATED=$(grep -r "TODO.*validat\|FIXME.*check\|XXX.*verify" --include="*.{js,ts,go,py}" . | head -10)
if [ -n "$UNVALIDATED" ]; then
  echo "⚠️  VALIDATION GAPS FOUND:"
  echo "$UNVALIDATED"
fi
```

### 4. Verify Workflow Completeness

#### Step 4: Check End-to-End Process Implementation

```bash
echo "=== Verifying workflow completeness ==="

# Check for transaction handling
echo "--- Checking transaction handling ---"
TRANSACTIONS=$(grep -r "transaction\|beginTx\|commit\|rollback" --include="*.{js,ts,go,py}" . | grep -v test | head -20)
if [ -n "$TRANSACTIONS" ]; then
  echo "Transaction handling found:"
  echo "$TRANSACTIONS"
  
  # Check for rollback mechanisms
  ROLLBACKS=$(echo "$TRANSACTIONS" | grep -i "rollback\|compensate\|undo")
  if [ -z "$ROLLBACKS" ]; then
    echo "❌ NO ROLLBACK MECHANISMS FOUND in transactions"
  fi
else
  echo "❌ NO TRANSACTION HANDLING FOUND"
fi

# Check for error handling in workflows
echo "--- Checking workflow error handling ---"
for workflow_file in $(echo "$WORKFLOW_FILES" | cut -d: -f1 | sort -u | head -5); do
  if [ -f "$workflow_file" ]; then
    echo "\nChecking error handling in $workflow_file:"
    ERROR_HANDLING=$(grep -n "catch\|except\|error\|fail" "$workflow_file" | head -5)
    if [ -n "$ERROR_HANDLING" ]; then
      echo "Error handling found:"
      echo "$ERROR_HANDLING"
    else
      echo "❌ NO ERROR HANDLING in workflow file"
    fi
  fi
done

# Check for success/completion handling
echo "--- Checking workflow completion ---"
COMPLETION=$(grep -r "complete\|success\|finish\|done" --include="*.{js,ts,go,py}" . | grep -v test | grep -i "workflow\|process\|transaction" | head -10)
if [ -n "$COMPLETION" ]; then
  echo "Completion handling found:"
  echo "$COMPLETION"
else
  echo "❌ NO CLEAR COMPLETION HANDLING FOUND"
fi

# Check for audit trails
echo "--- Checking audit logging ---"
AUDIT_LOGS=$(grep -r "audit\|log.*event\|track.*action" --include="*.{js,ts,go,py}" . | grep -v test | head -10)
if [ -n "$AUDIT_LOGS" ]; then
  echo "Audit logging found:"
  echo "$AUDIT_LOGS"
else
  echo "❌ NO AUDIT LOGGING FOUND for workflows"
fi
```

## Token-Optimized Output Structure

Create `docs/code-review/15-BUSINESS_WORKFLOW_CONSISTENCY.md`:

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

## NOT FOUND (Missing Workflow Elements)

### Missing Core Components
- ❌ No workflow implementations [if not found]
- ❌ No state transition code [if not found]
- ❌ No transaction handling [if not found]
- ❌ No rollback mechanisms [if not found]
- ❌ No audit logging [if not found]

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

## File Organization

**REQUIRED OUTPUT LOCATIONS:**
- `docs/code-review/15-BUSINESS_WORKFLOW_CONSISTENCY.md` - Business workflow analysis report
- `docs/code-review/code-review-todo-list.md` - Append workflow findings to consolidated todo list

**MANDATORY**: Use the Write tool to create these files after completing the analysis.

## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format
```markdown
## Business Workflow Analysis Findings

### 🔴 CRITICAL (Immediate Action Required)
- [ ] **[Task Title]**: [Brief description]
  - **Impact**: [High/Medium/Low]
  - **Effort**: [Time estimate]
  - **Files**: `[affected files]`
  - **Details**: [Additional context if needed]

### 🟡 HIGH (Sprint Priority)
- [ ] **[Task Title]**: [Brief description]
  - **Impact**: [High/Medium/Low]
  - **Effort**: [Time estimate]
  - **Files**: `[affected files]`

### 🟢 MEDIUM (Backlog)
- [ ] **[Task Title]**: [Brief description]
  - **Impact**: [High/Medium/Low]
  - **Effort**: [Time estimate]

### 🔵 LOW (Future Consideration)
- [ ] **[Task Title]**: [Brief description]
```

### Implementation
1. If `code-review-todo-list.md` doesn't exist, create it with proper header
2. Append findings under appropriate priority sections
3. Include specific file references and effort estimates
4. Tag with analysis type for filtering (e.g., `#security`, `#performance`, `#api`)