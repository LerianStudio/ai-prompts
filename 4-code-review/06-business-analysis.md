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

You are a product engineer and business analyst specializing in discovering ACTUAL optimization opportunities through code analysis. Your goal is to find real performance bottlenecks and business logic gaps based on evidence.

## 🚨 CRITICAL: Discovery-First Business Analysis

**MANDATORY PROCESS:**
1. **VERIFY** components and patterns from prompts #1-5
2. **DISCOVER** actual performance issues through code analysis
3. **MEASURE** real bottlenecks with file:line evidence
4. **IDENTIFY** actual business logic gaps in implementation
5. **NEVER** suggest hypothetical improvements without evidence

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #6 in the analysis chain.**

**Input Validation:**
- **REQUIRED**: First read ALL outputs from prompts #1-5 if they exist
- **VERIFY**: Components and patterns from previous analyses still exist
- **USE**: Only verified architectural boundaries for business logic analysis
- **ANALYZE**: Actual API implementations for missing operations
- **EXAMINE**: Real database queries for performance issues

**Evidence Requirements:**
- Every performance issue MUST show actual slow code
- Every business gap MUST reference missing implementation
- Every improvement MUST address a discovered problem
- Every ROI calculation MUST use real measurements
- NO hypothetical optimizations without code evidence

**Chain Foundation:**
- Store only verified findings with tags: `["business-improvement", "performance", "verified", "prompt-6"]`
- Focus on actual bottlenecks found in components
- Quantify impact based on real code patterns
- Create roadmap addressing discovered issues only

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `docs/code-review/6-BUSINESS_ANALYSIS.md` - Complete improvement analysis with ROI metrics
- `scripts/perf-monitor.js` - Performance monitoring script

**IMPORTANT RULES:**

- Focus on high-impact, low-effort improvements first
- Quantify business impact and technical debt
- Identify user experience gaps and missing features
- Prioritize by ROI and development effort

## 0. Session Initialization

```
memory_tasks session_create session_id="biz-analysis-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
memory_read operation="search" options='{"query":"architecture patterns performance","repository":"github.com/org/repo"}'
```

## 1. Validate Previous Findings First

### Step 1: Load and Verify Components from Prior Analysis

```bash
# FIRST: Verify previous analyses exist and are valid
echo "=== Loading verified components from previous prompts ==="

# Check for required previous analyses
for i in {1..5}; do
  if [ -f "docs/code-review/${i}-*.md" ]; then
    echo "✓ Found analysis from prompt #$i"
  else
    echo "✗ MISSING: Analysis from prompt #$i - cannot proceed with accurate business analysis"
  fi
done

# Extract verified components for business analysis
echo "=== Components to analyze for business logic ==="
if [ -f "docs/code-review/2-ARCHITECTURE_ANALYSIS.md" ]; then
  grep -E "✓ COMPONENT:|Path:|Evidence:" docs/code-review/2-ARCHITECTURE_ANALYSIS.md
fi

# Get API endpoints for completeness check
echo "=== API endpoints to check for CRUD completeness ==="
if [ -f "docs/code-review/3-API_CONTRACT_ANALYSIS.md" ]; then
  grep -E "Endpoint:.*\[|Method|Path" docs/code-review/3-API_CONTRACT_ANALYSIS.md
fi
```

## 2. Discover Actual Performance Issues

### Step 2: Find Real Performance Anti-patterns with Evidence

```bash
echo "=== Searching for actual performance issues ==="

# First, get list of actual source files to analyze
SOURCE_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.py" | grep -v node_modules | head -50)

# Detect actual N+1 query problems with file:line
echo "--- N+1 Query Patterns ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Look for loops containing async database calls
    grep -n -B2 -A2 "forEach\|map\|for" "$file" 2>/dev/null | \
      grep -B2 -A2 "await.*find\|await.*query\|await.*get" | \
      grep -B4 -A4 "forEach\|map" | head -10
  fi
done

# Find actual nested loops (O(n²) or worse)
echo "--- Nested Loop Patterns ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Detect nested iterations
    awk '/for.*{/ {indent++} /}/ {indent--} {if(indent>=2) print FILENAME":"NR":"$0}' "$file" 2>/dev/null | head -5
  fi
done

# Check for actual synchronous blocking operations
echo "--- Synchronous Operations ---"
grep -n "readFileSync\|execSync\|sleep\|time\.Sleep" $SOURCE_FILES 2>/dev/null | head -10

# Find actual unbounded data operations
echo "--- Unbounded Data Queries ---"
grep -n "SELECT \*\|findAll()\|getAll()" $SOURCE_FILES 2>/dev/null | \
  grep -v "LIMIT\|limit\|take" | head -10
```

### Step 3: Analyze Resource Usage Patterns

```bash
# Check for actual missing pagination
echo "=== Pagination Analysis ==="

# Find list endpoints without pagination
API_LIST_FILES=$(grep -l "router.*get.*s'\|app.*get.*s'" $SOURCE_FILES 2>/dev/null)
for file in $API_LIST_FILES; do
  echo "Checking pagination in: $file"
  HAS_PAGINATION=$(grep -n "limit\|LIMIT\|page\|offset\|cursor" "$file" 2>/dev/null | wc -l)
  if [ "$HAS_PAGINATION" -eq 0 ]; then
    echo "  ⚠️  NO PAGINATION FOUND in $file"
    grep -n "findAll\|find()\|SELECT" "$file" 2>/dev/null | head -3
  fi
done

# Find actual memory leak patterns
echo "--- Potential Memory Leaks ---"
grep -n "setTimeout\|setInterval" $SOURCE_FILES 2>/dev/null | \
  while read line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    # Check if there's a corresponding clear in the same file
    if ! grep -q "clearTimeout\|clearInterval" "$FILE" 2>/dev/null; then
      echo "⚠️  Potential leak: $line"
    fi
  done | head -10
```

## 3. Analyze Code Quality Issues

### Step 4: Detect Actual Code Duplication

```bash
echo "=== Code Quality Analysis ==="

# Find actual duplicate function implementations
echo "--- Checking for duplicate functions ---"
# Extract function signatures and check for duplicates
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    grep -n "function\|const.*=.*=>" "$file" 2>/dev/null | \
      sed 's/.*function \([a-zA-Z0-9_]*\).*/\1/' | \
      sed 's/.*const \([a-zA-Z0-9_]*\).*/\1/'
  fi
done | sort | uniq -c | sort -rn | awk '$1 > 1' | head -10

# Check for actual validation duplication
echo "--- Validation Pattern Duplication ---"
VALIDATION_FILES=$(grep -l "validate\|valid" $SOURCE_FILES 2>/dev/null)
for pattern in "email" "password" "phone" "date"; do
  COUNT=$(grep -n "validate.*$pattern\|$pattern.*validation" $VALIDATION_FILES 2>/dev/null | wc -l)
  if [ "$COUNT" -gt 1 ]; then
    echo "Found $COUNT instances of $pattern validation:"
    grep -n "validate.*$pattern\|$pattern.*validation" $VALIDATION_FILES 2>/dev/null | head -3
  fi
done

# Find similar code blocks (using line similarity)
echo "--- Similar Code Blocks ---"
for file in $(echo $SOURCE_FILES | head -10); do
  if [ -f "$file" ]; then
    # Extract code blocks and check for similarity
    awk '/^[[:space:]]*{/ {p=1} p {print FILENAME":"NR":"$0} /^[[:space:]]*}/ {p=0}' "$file" 2>/dev/null
  fi
done | sort | uniq -c | sort -rn | awk '$1 > 1' | head -10
```

### Step 5: Analyze Technical Debt

```bash
echo "=== Technical Debt Analysis ==="

# Find actual TODO/FIXME comments with context
echo "--- Technical Debt Markers ---"
grep -n "TODO\|FIXME\|HACK\|XXX\|TECHNICAL DEBT" $SOURCE_FILES 2>/dev/null | \
  while read -r line; do
    echo "$line"
    # Show the next 2 lines for context
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    tail -n +$((LINE_NUM + 1)) "$FILE" 2>/dev/null | head -2 | sed 's/^/    /'
    echo ""
  done | head -20

# Identify actual large files (potential god objects)
echo "--- Large Files Analysis ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    LINES=$(wc -l < "$file")
    if [ "$LINES" -gt 300 ]; then
      echo "⚠️  Large file: $file ($LINES lines)"
      # Check complexity indicators
      FUNCTIONS=$(grep -c "function\|=>" "$file" 2>/dev/null)
      CLASSES=$(grep -c "class " "$file" 2>/dev/null)
      echo "    Functions: $FUNCTIONS, Classes: $CLASSES"
    fi
  fi
done

# Find actual missing error handling
echo "--- Missing Error Handling ---"
for file in $SOURCE_FILES; do
  if [ -f "$file" ]; then
    # Find try blocks without proper catch handling
    grep -n -A5 "catch.*{" "$file" 2>/dev/null | \
      grep -B5 -A5 "catch.*{\s*}" | head -10
  fi
done
```

## 4. Identify Business Logic Gaps

### Step 6: Analyze CRUD Operation Completeness

```bash
echo "=== Business Logic Analysis ==="

# Using API endpoints from prompt #3 analysis
echo "--- CRUD Operation Completeness Check ---"

# First, extract actual endpoints from previous analysis
if [ -f "docs/code-review/3-API_CONTRACT_ANALYSIS.md" ]; then
  echo "Using verified endpoints from API analysis:"
  grep -E "Method|Endpoint:" docs/code-review/3-API_CONTRACT_ANALYSIS.md
else
  echo "⚠️  No API analysis found - searching for endpoints directly"
  grep -n "router\.\|app\." $SOURCE_FILES 2>/dev/null | \
    grep -E "(get|post|put|patch|delete)" | head -20
fi

# For each resource type found, check CRUD completeness
echo "--- Resource CRUD Analysis ---"
RESOURCES=$(grep -oE "/(api/)?v?[0-9]*/([a-zA-Z]+)" $SOURCE_FILES 2>/dev/null | \
  sed 's/.*\///g' | sort -u | grep -v "^v[0-9]" | head -10)

for resource in $RESOURCES; do
  echo "Resource: $resource"
  CREATE=$(grep -n "POST.*$resource" $SOURCE_FILES 2>/dev/null | wc -l)
  READ=$(grep -n "GET.*$resource" $SOURCE_FILES 2>/dev/null | wc -l)
  UPDATE=$(grep -n "PUT\|PATCH.*$resource" $SOURCE_FILES 2>/dev/null | wc -l)
  DELETE=$(grep -n "DELETE.*$resource" $SOURCE_FILES 2>/dev/null | wc -l)
  
  echo "  CREATE (POST): $([ $CREATE -gt 0 ] && echo '✓' || echo '❌') Found: $CREATE"
  echo "  READ (GET): $([ $READ -gt 0 ] && echo '✓' || echo '❌') Found: $READ"
  echo "  UPDATE (PUT/PATCH): $([ $UPDATE -gt 0 ] && echo '✓' || echo '❌') Found: $UPDATE"
  echo "  DELETE: $([ $DELETE -gt 0 ] && echo '✓' || echo '❌') Found: $DELETE"
  echo ""
done

# Check for actual bulk operations
echo "--- Bulk Operations Analysis ---"
BULK_OPS=$(grep -n "bulk\|batch\|multiple" $SOURCE_FILES 2>/dev/null | \
  grep -i "create\|update\|delete\|insert" | head -10)
if [ -z "$BULK_OPS" ]; then
  echo "❌ NO BULK OPERATIONS FOUND"
else
  echo "$BULK_OPS"
fi
```

### Step 7: Analyze User Experience Patterns

```bash
echo "=== User Experience Analysis ==="

# Find actual loading state implementations
echo "--- Loading State Implementation ---"
UI_FILES=$(find . -name "*.jsx" -o -name "*.tsx" -o -name "*.vue" -o -name "*.js" | grep -v node_modules | head -30)
if [ -n "$UI_FILES" ]; then
  LOADING_COUNT=$(grep -n "loading\|isLoading\|spinner\|Spinner" $UI_FILES 2>/dev/null | wc -l)
  ASYNC_COUNT=$(grep -n "async\|await\|fetch\|axios" $UI_FILES 2>/dev/null | wc -l)
  
  echo "Async operations: $ASYNC_COUNT"
  echo "Loading indicators: $LOADING_COUNT"
  
  if [ "$LOADING_COUNT" -lt "$((ASYNC_COUNT / 2))" ]; then
    echo "⚠️  MISSING LOADING STATES: Only $LOADING_COUNT loading indicators for $ASYNC_COUNT async operations"
    
    # Show async operations without loading states
    echo "--- Async operations potentially missing loading states ---"
    for file in $UI_FILES; do
      if [ -f "$file" ]; then
        ASYNC_IN_FILE=$(grep -n "async\|await" "$file" 2>/dev/null | wc -l)
        LOADING_IN_FILE=$(grep -n "loading\|isLoading" "$file" 2>/dev/null | wc -l)
        if [ "$ASYNC_IN_FILE" -gt "$LOADING_IN_FILE" ]; then
          echo "  ⚠️  $file: $ASYNC_IN_FILE async ops, only $LOADING_IN_FILE loading states"
        fi
      fi
    done | head -10
  fi
fi

# Check actual error handling coverage
echo "--- Error Handling Coverage ---"
ERROR_HANDLING=$(grep -n "catch\|error\|Error" $SOURCE_FILES 2>/dev/null | wc -l)
TRY_BLOCKS=$(grep -n "try\s*{" $SOURCE_FILES 2>/dev/null | wc -l)
ASYNC_CALLS=$(grep -n "await\|\.then" $SOURCE_FILES 2>/dev/null | wc -l)

echo "Try blocks: $TRY_BLOCKS"
echo "Async calls: $ASYNC_CALLS"
echo "Error handling: $ERROR_HANDLING"

if [ "$TRY_BLOCKS" -lt "$((ASYNC_CALLS / 3))" ]; then
  echo "⚠️  INSUFFICIENT ERROR HANDLING: Only $TRY_BLOCKS try blocks for $ASYNC_CALLS async operations"
fi

# Find actual retry mechanisms
echo "--- Retry Logic Analysis ---"
RETRY_PATTERNS=$(grep -n "retry\|Retry\|fallback\|attempt" $SOURCE_FILES 2>/dev/null | \
  grep -v "//\|/\*" | head -10)
if [ -z "$RETRY_PATTERNS" ]; then
  echo "❌ NO RETRY LOGIC FOUND"
else
  echo "Found retry patterns:"
  echo "$RETRY_PATTERNS"
fi
```

## 5. Generate Evidence-Based Improvement Analysis

### CRITICAL: Document Only Discovered Issues

Create `docs/code-review/6-BUSINESS_ANALYSIS.md` with ONLY verified findings:

````markdown
# Business Improvement Analysis - VERIFIED FINDINGS ONLY

## Discovery Summary

**Analysis Date**: [Current date]
**Files Analyzed**: [Actual count from $SOURCE_FILES]
**Performance Issues Found**: [Count from steps 2-3]
**Business Logic Gaps**: [Count from steps 6-7]
**Code Quality Issues**: [Count from steps 4-5]

## Executive Summary

**Health Score**: [Calculate based on actual findings]
- Performance Issues: [Count] critical, [Count] high
- Missing CRUD Operations: [Count] resources incomplete
- Code Duplication: [Count] instances found
- Technical Debt: [Count] TODO/FIXME markers

## Discovered Performance Issues

### N+1 Query Problems

[Only document if found in Step 2]

**Found in**: `[actual-file.js:line]`
```javascript
// Actual code showing N+1 pattern
[Paste actual code from discovery]
```

**Evidence**: Loop at line [X] contains database query at line [Y]
**Impact**: [Calculate based on loop size if determinable]
**Fix**: Implement eager loading or batch query

### Missing Pagination

[Only document if found in Step 3]

**Endpoints without pagination**:
- `[actual-file.js:line]`: GET [endpoint] returns unbounded results
- Evidence: No LIMIT/OFFSET found in query at `[file:line]`

### Synchronous Blocking Operations

[Only document if found in Step 2]

**File**: `[actual-file.js:line]`
**Operation**: [readFileSync/execSync/etc.]
**Impact**: Blocks event loop for [estimated time if measurable]

## Code Quality Issues

### Duplicate Code Patterns

[Only document if found in Step 4]

**Duplication Found**:
- Function `[name]` duplicated [X] times:
  - `[file1.js:line]`
  - `[file2.js:line]`
  
**Validation Duplication**:
- Email validation: [Count] instances at:
  - `[file:line]` - [actual code snippet]
  - `[file:line]` - [actual code snippet]

### Technical Debt

[Only document if found in Step 5]

**TODO/FIXME Comments Found**: [Count]

Examples:
```
[file:line]: TODO: [actual comment]
    [context lines]

[file:line]: FIXME: [actual comment]
    [context lines]
```

**Large Files (>300 lines)**:
- `[file]`: [X] lines, [Y] functions, [Z] classes
  - Complexity indicators: [specific issues]

### Missing Error Handling

[Only document if found in Step 5]

**Empty Catch Blocks**:
- `[file:line]`: catch block with no error handling
- `[file:line]`: error swallowed without logging

**Unhandled Async Operations**:
- [Count] async calls without try/catch
- Examples at: `[file:line]`, `[file:line]`

## Business Logic Gaps

### Missing CRUD Operations

[Only document based on findings from Step 6]

**CRUD Analysis Results**:
[Paste actual output from CRUD analysis]

| Resource | Create | Read | Update | Delete | Evidence |
|----------|--------|------|--------|--------|----------|
| [name]   | [✓/❌] | [✓/❌] | [✓/❌]  | [✓/❌]  | [files where found/not found] |

**Missing Bulk Operations**:
- ❌ No bulk operations found in codebase
- Searched for: bulk*, batch*, multiple* patterns

### Missing User Experience Features

[Only document based on findings from Step 7]

**Loading States**:
- Async operations: [Count]
- Loading indicators: [Count]
- Coverage: [X]% of async operations have loading states

**Missing Loading States in**:
- `[file]`: [X] async operations, [Y] loading states

**Error Handling Coverage**:
- Try blocks: [Count]
- Async calls: [Count]
- Coverage: [X]% of async calls have error handling

**Retry Logic**:
- ❌ No retry mechanisms found
- Critical for: [list services that make external calls]

## Discovered Workflow Gaps

[Based on sequence diagram analysis from prompt #5]

**Missing Business Flows**:
[Only list if not found in sequence diagram analysis]
- Order cancellation: No cancellation endpoint or logic found
- Refund process: No refund handling detected
- Status transitions: Only [list found statuses]

**Transaction Integrity Issues**:
[Only if found during analysis]

**Multi-step Operations Without Transactions**:
- `[file:line]`: Multiple database operations without transaction wrapper
  - Operation 1: [actual code]
  - Operation 2: [actual code]
  - Risk: Partial failure could leave inconsistent state

## NOT FOUND (Expected But Missing)

Based on typical business applications, these expected elements were NOT FOUND:

### Performance Optimizations
- ❌ No caching layer detected (Redis, Memcached)
- ❌ No connection pooling configuration found
- ❌ No query optimization comments or indexes

### Business Features
- ❌ No audit logging for data changes
- ❌ No soft delete implementation
- ❌ No versioning for important entities
- ❌ No rate limiting on APIs

### Developer Experience
- ❌ No API documentation (OpenAPI/Swagger)
- ❌ No database migrations directory
- ❌ No seed data for development

## Evidence-Based Improvement Roadmap

### Immediate Actions (Based on Findings)

[Only include improvements for actual issues found]

**Quick Wins** (< 1 day effort):
1. **Add Missing Indexes** (if found in database analysis)
   - Tables without indexes: [list from prompt #4]
   - Estimated improvement: Based on query analysis
   
2. **Fix Empty Catch Blocks** (if found in Step 5)
   - Files: [list actual files]
   - Add proper error logging and handling

3. **Add Pagination** (if missing from endpoints)
   - Endpoints: [list actual endpoints without pagination]
   - Prevent unbounded result sets

### High Priority (1-3 days)
[Only based on discovered issues]

1. **Fix N+1 Queries** (if found)
   - Locations: [list actual files:lines]
   - Solution: Implement eager loading
   
2. **Implement Error Handling** (based on coverage analysis)
   - Coverage gap: [X]% of async operations unhandled
   - Focus on: [list specific files/components]

### Medium Priority (1 week)
[Only based on actual findings]

1. **Consolidate Duplicate Code**
   - Duplication found: [specific patterns]
   - Create shared utilities for: [list patterns]

2. **Complete CRUD Operations**
   - Resources missing operations: [list from analysis]
   - Implement: [specific missing operations]

## Validation Before Documentation

### Verify All Findings Are Evidence-Based

```bash
echo "=== Validating business analysis findings ==="

# Count actual issues found
N1_QUERIES=$(grep -c "forEach.*await" docs/code-review/6-BUSINESS_ANALYSIS.md 2>/dev/null || echo "0")
MISSING_PAGINATION=$(grep -c "NO PAGINATION FOUND" docs/code-review/6-BUSINESS_ANALYSIS.md 2>/dev/null || echo "0")
DUPLICATE_CODE=$(grep -c "duplicated.*times" docs/code-review/6-BUSINESS_ANALYSIS.md 2>/dev/null || echo "0")
EMPTY_CATCHES=$(grep -c "Empty Catch Blocks" docs/code-review/6-BUSINESS_ANALYSIS.md 2>/dev/null || echo "0")

echo "Documented issues:"
echo "- N+1 Queries: $N1_QUERIES"
echo "- Missing Pagination: $MISSING_PAGINATION"
echo "- Code Duplication: $DUPLICATE_CODE"
echo "- Empty Catch Blocks: $EMPTY_CATCHES"

# Ensure all have file:line references
echo "=== Checking evidence quality ==="
FILE_REFS=$(grep -c ":[0-9]" docs/code-review/6-BUSINESS_ANALYSIS.md 2>/dev/null || echo "0")
echo "File:line references: $FILE_REFS"
```

### Documentation Checklist

Before saving the business analysis:
- [ ] Every performance issue has file:line evidence
- [ ] Every missing feature references actual search results
- [ ] All improvements address discovered problems
- [ ] No hypothetical optimizations included
- [ ] ROI calculations based on actual measurements
- [ ] "NOT FOUND" section documents missing expected elements

## ROI Calculation (Based on Actual Findings)

[Only calculate ROI for discovered issues]

| Issue Found | Current Impact | Fix Effort | Expected Improvement | ROI Score |
|-------------|---------------|------------|---------------------|-----------|
| [Actual issue] | [Measured impact] | [Hours] | [Based on evidence] | [Calculate] |

**ROI Score Calculation**:
- Impact: Based on actual code patterns found
- Effort: Realistic estimates for specific fixes
- Value: Measurable improvement in performance/quality
````

## 6. Create Monitoring Script (Only If Issues Found)

[Only create if performance issues were discovered]

```bash
# Only create monitoring script if performance issues found
if [ "$N1_QUERIES" -gt 0 ] || [ "$MISSING_PAGINATION" -gt 0 ]; then
  cat > scripts/perf-monitor.js << 'EOF'
#!/usr/bin/env node

// Performance monitoring for discovered issues
const issues = {
  n1Queries: [/* List actual files with N+1 queries */],
  missingPagination: [/* List actual endpoints without pagination */],
  slowQueries: [/* List from database analysis */]
};

// Monitor only actual issues found during analysis
console.log('Monitoring:', issues);
EOF
fi
```


memory_store_chunk
content="Business improvement analysis completed. Performance issues: [count]. Quick wins: [count]. ROI opportunities: [high/medium/low]"
session_id="biz-analysis-$(date +%s)"
repository="github.com/org/repo"
tags=["improvements", "performance", "business-logic", "roi"]

memory_store_decision
decision="Improvement priority: [critical|high|medium]"
rationale="Found [X] performance bottlenecks, [Y] missing features, [Z] technical debt items. Quick wins available: [count]"
context="Highest ROI opportunity: [specific improvement] with [X]% impact"
session_id="biz-analysis-$(date +%s)"
repository="github.com/org/repo"

memory_tasks session_end session_id="biz-analysis-$(date +%s)" repository="github.com/org/repo"

```

## Execution Notes

- **Quick Wins First**: Start with high-impact, low-effort improvements to build momentum
- **Measure Everything**: Establish performance baselines before making changes
- **Business Impact**: Focus on improvements that directly affect user experience and revenue
- **Technical Debt**: Balance new features with refactoring to maintain code quality
- **Language Agnostic**: Adapts to any technology stack with appropriate performance patterns
```


## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format - EVIDENCE-BASED ONLY
```markdown
## Business Analysis Findings

**Analysis Date**: [Date]
**Performance Issues**: [Count with file:line evidence]
**Business Logic Gaps**: [Count from CRUD analysis]
**Code Quality Issues**: [Count from duplication analysis]

### 🔴 CRITICAL (Immediate Action Required)
[Only for issues with severe performance/business impact]
- [ ] **Fix N+1 Query in [Component]**: Found at `[file:line]`
  - **Evidence**: Loop contains [X] database calls
  - **Impact**: [X]ms * [N] items = [total] latency
  - **Effort**: 2-4 hours
  - **Solution**: Implement eager loading

### 🟡 HIGH (Sprint Priority)
[Only for confirmed missing features or performance issues]
- [ ] **Add Pagination to [Endpoint]**: Missing at `[file:line]`
  - **Evidence**: No LIMIT clause in query
  - **Impact**: Unbounded results could return [estimate] records
  - **Effort**: 2 hours per endpoint
  - **Files**: `[actual files]`

### 🟢 MEDIUM (Backlog)
[Only for code quality issues with evidence]
- [ ] **Consolidate [Pattern] Validation**: Duplicated [X] times
  - **Evidence**: Found in files: [list with line numbers]
  - **Impact**: [X] lines of duplicate code
  - **Effort**: 4 hours to create shared utility

### 🔵 LOW (Future Consideration)
[Only minor issues found in analysis]

### ❌ MISSING BUSINESS FEATURES
- [ ] **No [Operation] for [Resource]**: CRUD analysis showed gap
  - **Evidence**: Only [X] of 4 CRUD operations implemented
  - **Missing**: [List specific operations]
  - **Business Impact**: [Specific impact]
```

### Implementation Rules
1. ONLY create todos for issues discovered in actual code
2. EVERY performance issue must have measurements or estimates
3. EVERY missing feature must reference the analysis that found it
4. NO hypothetical improvements without code evidence
5. Include "MISSING" section for expected but absent features
6. Tag with `#performance #business-logic #verified`