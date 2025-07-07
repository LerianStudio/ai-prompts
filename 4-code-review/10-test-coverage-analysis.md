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

### 🧠 Zen MCP Integration (ESSENTIAL FOR TEST QUALITY)
**Use Zen tools for comprehensive test analysis:**
- **`mcp__zen__analyze`** - Test structure and coverage analysis
  ```bash
  mcp__zen__analyze
    files=["test/", "spec/", "__tests__/", "*test*"]
    prompt="Analyze test structure, coverage patterns, and testing strategies"
    model="flash"
    analysis_type="quality"
  ```
- **`mcp__zen__codereview`** - Test quality assessment
  ```bash
  mcp__zen__codereview
    files=["test/"]
    prompt="Review test quality focusing on: assertion strength, edge case coverage, mocking strategies, and test maintainability"
    model="flash"
    review_type="quick"
    focus_on="test effectiveness and maintainability"
  ```
- **Benefits**: Test quality insights, coverage gap identification, testing strategy evaluation

### 🚀 Task Tool Usage (CRITICAL FOR COVERAGE MAPPING)
**Use Task tool for comprehensive test discovery:**
```bash
Task(
  description="Test coverage analysis",
  prompt="Find and analyze:
    1. All test files and testing frameworks in use
    2. Test coverage for critical business logic
    3. API endpoint test coverage
    4. Security-critical code test coverage
    5. Edge case and error handling tests
    6. Integration vs unit test balance
    7. Untested files and functions
    8. Test execution time and flakiness patterns"
)
```
**Benefits**: Complete test inventory, coverage gap mapping, test quality metrics

This multi-tool approach enables thorough test coverage analysis and quality assessment.

---

You are a test engineer specializing in coverage analysis and test quality assessment. Your goal is to discover ACTUAL test coverage gaps and quality issues through systematic exploration.

## 🚨 CRITICAL: Discovery-First Test Analysis

**MANDATORY PROCESS:**
1. **VERIFY** components and critical paths from prompts #1-9
2. **DISCOVER** actual test files and frameworks in use
3. **MEASURE** real coverage if tools are available
4. **IDENTIFY** actual untested components with evidence
5. **NEVER** create hypothetical test gaps without verification

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #10 in the analysis chain.**

## 🔍 Smart Dependency Validation

**MANDATORY: Execute this validation before proceeding with test analysis**

```bash
## Enhanced Test Analysis Dependency Validation

validate_test_prerequisites() {
  echo "=== Validating Prerequisites for Test Coverage Analysis ==="
  
  local key_analyses=(
    "docs/code-review/1-CODEBASE_OVERVIEW.md:Codebase Overview:5:required"
    "docs/code-review/2-ARCHITECTURE_ANALYSIS.md:Architecture Analysis:3:recommended"
    "docs/code-review/3-API_CONTRACT_ANALYSIS.md:API Analysis:3:recommended"
    "docs/code-review/6-BUSINESS_ANALYSIS.md:Business Logic:2:recommended"
    "docs/code-review/7-SECURITY_ANALYSIS.md:Security Analysis:2:recommended"
  )
  
  local validated_count=0
  local total_evidence=0
  local critical_components=""
  
  for analysis_info in "${key_analyses[@]}"; do
    IFS=':' read -r file name min_evidence priority <<< "$analysis_info"
    
    if [ ! -f "$file" ]; then
      if [ "$priority" = "required" ]; then
        echo "❌ ERROR: Required analysis missing: $name ($file)"
        echo "Test coverage analysis requires component discovery to identify test targets"
        exit 1
      else
        echo "⚠️  MISSING: $name not found - test analysis will have reduced scope"
        continue
      fi
    fi
    
    local evidence_count=$(grep -c ":[0-9]\+" "$file" 2>/dev/null || echo "0")
    local component_count=$(grep -c "✓.*FOUND\|✓.*Component\|✓.*VERIFIED" "$file" 2>/dev/null || echo "0")
    
    if [ "$evidence_count" -ge "$min_evidence" ] && [ "$component_count" -gt 0 ]; then
      echo "✅ VALIDATED: $name ($evidence_count evidence, $component_count components)"
      ((validated_count++))
      ((total_evidence += evidence_count))
      
      # Extract critical components for test coverage mapping
      if [ "$name" = "Architecture Analysis" ] || [ "$name" = "API Analysis" ]; then
        local components=$(grep -E "✓.*Component|Path:|File:" "$file" | head -5)
        critical_components="$critical_components\n$components"
      fi
    else
      echo "⚠️  INCOMPLETE: $name has limited evidence ($evidence_count/$min_evidence)"
    fi
  done
  
  echo "✅ Prerequisites validated: $validated_count analyses with $total_evidence evidence points"
  echo "✅ Test coverage analysis can proceed"
  
  if [ -n "$critical_components" ]; then
    echo "✅ Critical components identified for test coverage mapping:"
    echo -e "$critical_components" | head -5
  fi
}

# Validate test analysis dependencies
validate_test_prerequisites

# Extract test-critical components from previous analyses
echo "=== Loading test-critical components ==="

# Get API endpoints that need test coverage
API_ENDPOINTS=""
if [ -f "docs/code-review/3-API_CONTRACT_ANALYSIS.md" ]; then
  API_ENDPOINTS=$(grep -E "POST|GET|PUT|DELETE.*/" docs/code-review/3-API_CONTRACT_ANALYSIS.md | head -8)
  if [ -n "$API_ENDPOINTS" ]; then
    echo "✅ API endpoints requiring test coverage:"
    echo "$API_ENDPOINTS" | head -3
  fi
fi

# Get security-critical code that needs testing
SECURITY_CRITICAL=""
if [ -f "docs/code-review/7-SECURITY_ANALYSIS.md" ]; then
  SECURITY_CRITICAL=$(grep -E "authentication|authorization|password|token" docs/code-review/7-SECURITY_ANALYSIS.md | grep "file:\|Path:" | head -5)
  if [ -n "$SECURITY_CRITICAL" ]; then
    echo "✅ Security-critical code requiring test coverage:"
    echo "$SECURITY_CRITICAL" | head -2
  fi
fi

# Get business logic components
BUSINESS_LOGIC=""
if [ -f "docs/code-review/6-BUSINESS_ANALYSIS.md" ]; then
  BUSINESS_LOGIC=$(grep -E "CRUD|payment|order|process" docs/code-review/6-BUSINESS_ANALYSIS.md | grep "file:\|Path:" | head -5)
  if [ -n "$BUSINESS_LOGIC" ]; then
    echo "✅ Business logic requiring test coverage:"
    echo "$BUSINESS_LOGIC" | head -2
  fi
fi
```

**Input Validation:**
- **REQUIRED**: Codebase overview to identify components needing test coverage
- **RECOMMENDED**: Architecture, API, Business, and Security analyses for comprehensive coverage mapping
- **USE**: Verified components, API endpoints, and security-critical code as test coverage targets
- **PRIORITIZE**: Test coverage based on business criticality and security risk from previous analyses

**Evidence Requirements:**
- Every coverage gap MUST reference actual missing test files
- Every test quality issue MUST show file:line evidence
- Every metric MUST come from actual test runs or analysis
- Every recommendation MUST address a discovered gap
- NO example test code without identifying actual gaps first

## 🧠 Enhanced Memory Integration

**MANDATORY: Execute memory operations for test coverage chain continuity**

```bash
## Standardized Memory Operations for Test Coverage Analysis

# Initialize test coverage memory context
initialize_test_memory_context() {
  echo "=== Initializing Memory Context for Test Coverage Analysis ==="
  
  # Retrieve previous testing insights and coverage patterns
  PREVIOUS_TESTING=$(memory_read operation="search" \
    options='{"query":"test coverage testing strategy unit integration","repository":"'$REPO_URL'"}')
  
  if [ -n "$PREVIOUS_TESTING" ]; then
    echo "✅ Retrieved previous testing insights:"
    echo "$PREVIOUS_TESTING" | head -3
    echo "Building upon previous testing understanding..."
  else
    echo "ℹ️  No previous testing context found - performing fresh coverage analysis"
  fi
  
  # Get security-critical components requiring priority testing
  SECURITY_TEST_PRIORITIES=$(memory_read operation="search" \
    options='{"query":"security-testing critical-components authentication","repository":"'$REPO_URL'"}')
  
  if [ -n "$SECURITY_TEST_PRIORITIES" ]; then
    echo "✅ Found security-critical components requiring test priority:"
    echo "$SECURITY_TEST_PRIORITIES" | head -2
  fi
  
  # Get API endpoints requiring test coverage
  API_TEST_TARGETS=$(memory_read operation="search" \
    options='{"query":"API endpoint POST GET authentication","repository":"'$REPO_URL'"}')
  
  if [ -n "$API_TEST_TARGETS" ]; then
    echo "✅ Found API endpoints requiring test coverage:"
    echo "$API_TEST_TARGETS" | head -2
  fi
}

# Store test coverage findings with gap analysis
store_test_coverage_findings() {
  local total_coverage=$1
  local gap_count=$2
  local critical_gaps=$3
  
  echo "=== Storing Test Coverage Analysis Findings ==="
  
  # Store coverage metrics and gaps
  memory_store_chunk \
    content="Test Coverage Analysis: $total_coverage% overall coverage with $gap_count gaps identified. Critical gaps: $critical_gaps" \
    tags=["testing", "coverage", "verified", "prompt-10", "analysis-chain"] \
    repository="$REPO_URL" \
    session_id="$SESSION_ID"
  
  # Store test quality decisions
  if [ "$gap_count" -gt 0 ]; then
    memory_store_decision \
      decision="Test coverage gaps identified requiring attention before production" \
      rationale="Test analysis found $gap_count coverage gaps including critical areas: $critical_gaps. These affect production readiness." \
      context="Prompt #10 test coverage analysis - input for production readiness assessment" \
      repository="$REPO_URL" \
      session_id="$SESSION_ID"
  fi
  
  # Store test gaps for production readiness evaluation
  memory_store_chunk \
    content="Test coverage gaps for production assessment: $UNTESTED_CRITICAL_COMPONENTS" \
    tags=["test-gaps", "production-blockers", "prompt-10", "for-production-analysis"] \
    repository="$REPO_URL" \
    session_id="$SESSION_ID"
  
  echo "✅ Test coverage findings stored for chain continuity"
}

# Get testing insights and best practices
get_test_insights() {
  echo "=== Checking for Testing Insights ==="
  
  # Get AI suggestions for test strategy
  AI_TEST_SUGGESTIONS=$(memory_intelligence operation="suggest_related" \
    options='{"current_context":"analyzing test coverage and testing strategy","repository":"'$REPO_URL'","session_id":"'$SESSION_ID'"}')
  
  if [ -n "$AI_TEST_SUGGESTIONS" ]; then
    echo "🤖 AI suggestions for test coverage analysis:"
    echo "$AI_TEST_SUGGESTIONS" | head -2
  fi
  
  # Look for similar test coverage challenges
  SIMILAR_TEST_ISSUES=$(memory_read operation="find_similar" \
    options='{"problem":"test coverage analysis and testing strategy","repository":"'$REPO_URL'"}')
  
  if [ -n "$SIMILAR_TEST_ISSUES" ]; then
    echo "💡 Similar test coverage challenges found:"
    echo "$SIMILAR_TEST_ISSUES" | head -2
  fi
  
  # Check for testing best practices
  TEST_PATTERNS=$(memory_read operation="search" \
    options='{"query":"testing best practices test patterns coverage","repository":"'$REPO_URL'"}')
  
  if [ -n "$TEST_PATTERNS" ]; then
    echo "💡 Previous testing patterns and best practices:"
    echo "$TEST_PATTERNS" | head -2
  fi
}

# Execute test coverage memory operations
initialize_test_memory_context
get_test_insights
```

**Chain Foundation:**
- Store verified findings with tags: `["testing", "coverage", "verified", "prompt-10", "analysis-chain"]`
- Cross-reference security-critical components for priority test coverage
- Store test gaps for production readiness blocking assessment
- Enable memory-driven insights for testing strategy and best practices

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `docs/code-review/10-TEST_COVERAGE.md` - Complete test coverage and quality report
- `tests/generated/` - Generated test templates for missing coverage

**IMPORTANT RULES:**

- Focus on critical path coverage first
- Provide specific file:line references for gaps
- Generate practical test templates
- Prioritize by business impact

## 0. Session Initialization

```
memory_tasks session_create session_id="test-researcher-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
memory_read operation="search" options='{"query":"architecture components endpoints","repository":"github.com/org/repo"}'
```

## 1. Validate Previous Findings First

### Step 1: Load Critical Components from Prior Analysis

```bash
# FIRST: Identify critical components that need testing
echo "=== Loading critical components from previous analyses ==="

# Get security-critical components
if [ -f "docs/code-review/7-SECURITY_ANALYSIS.md" ]; then
  echo "✓ Found security analysis - identifying critical paths"
  grep -E "VULN-|authentication|authorization|encryption" docs/code-review/7-SECURITY_ANALYSIS.md | grep -E "file:|File:"
fi

# Get API endpoints that need testing
if [ -f "docs/code-review/3-API_CONTRACT_ANALYSIS.md" ]; then
  echo "✓ Found API analysis - checking endpoint coverage"
  grep -E "Endpoint:|Path:|File:" docs/code-review/3-API_CONTRACT_ANALYSIS.md
fi

# Get business-critical logic
if [ -f "docs/code-review/6-BUSINESS_ANALYSIS.md" ]; then
  echo "✓ Found business analysis - identifying critical features"
  grep -E "CRUD|payment|order|user" docs/code-review/6-BUSINESS_ANALYSIS.md | grep -E "file:|File:"
fi
```

## 2. Discover Actual Test Framework

### Step 2: Find Real Test Setup and Organization

```bash
echo "=== Discovering actual test framework and files ==="

# Find test files by extension
echo "--- Searching for test files ---"
TEST_FILES=$(find . -name "*.test.*" -o -name "*.spec.*" -o -name "*_test.*" -o -name "test_*.py" | grep -v node_modules | head -50)
TEST_COUNT=$(echo "$TEST_FILES" | grep -v "^$" | wc -l)
echo "Found $TEST_COUNT test files"

if [ "$TEST_COUNT" -eq 0 ]; then
  echo "❌ NO TEST FILES FOUND"
  echo "Searched for: *.test.*, *.spec.*, *_test.*, test_*.py"
else
  echo "Test file patterns found:"
  echo "$TEST_FILES" | head -10
fi

# Detect testing framework
echo "--- Detecting test framework ---"
if [ -f "package.json" ] && grep -q "jest\|mocha\|jasmine\|vitest" package.json 2>/dev/null; then
  echo "✓ JavaScript test framework found:"
  grep -E "jest|mocha|jasmine|vitest" package.json
elif [ -f "go.mod" ]; then
  echo "✓ Go testing framework (built-in)"
  # Check for testing libraries
  grep -E "testify|gomega|ginkgo" go.mod 2>/dev/null || echo "  Using standard library testing"
elif [ -f "requirements.txt" ] || [ -f "Pipfile" ]; then
  echo "✓ Python test framework:"
  grep -E "pytest|unittest|nose" requirements.txt Pipfile 2>/dev/null || echo "  No test framework found in dependencies"
else
  echo "❌ NO TEST FRAMEWORK DETECTED"
fi

# Check test directory structure
echo "--- Test organization ---"
if [ -d "test" ] || [ -d "tests" ] || [ -d "__tests__" ] || [ -d "spec" ]; then
  echo "✓ Dedicated test directory found:"
  ls -la test tests __tests__ spec 2>/dev/null | grep -E "^d" | head -5
else
  echo "⚠️  No dedicated test directory - tests may be colocated with source"
fi
```

## 3. Measure Actual Coverage

### Step 3: Check for Existing Coverage Data

```bash
echo "=== Checking for coverage data and tools ==="

# Check for existing coverage reports
echo "--- Looking for coverage reports ---"
COVERAGE_FILES=$(find . -name "coverage*" -o -name "*cov*" -o -name "lcov*" | grep -v node_modules | head -10)
if [ -n "$COVERAGE_FILES" ]; then
  echo "✓ Found coverage files:"
  echo "$COVERAGE_FILES"
  
  # Try to extract coverage percentage
  for file in $COVERAGE_FILES; do
    if [ -f "$file" ]; then
      # Check different coverage report formats
      if grep -q "percentage" "$file" 2>/dev/null; then
        echo "Coverage from $file:"
        grep -E "percentage|total.*[0-9]+%" "$file" 2>/dev/null | head -5
      elif [ -f "coverage/coverage-summary.json" ]; then
        echo "Coverage summary:"
        jq '.total.lines.pct' coverage/coverage-summary.json 2>/dev/null || echo "Could not parse coverage"
      fi
    fi
  done
else
  echo "❌ NO COVERAGE REPORTS FOUND"
  
  # Check if coverage tools are configured
  echo "--- Checking for coverage configuration ---"
  if [ -f "package.json" ] && grep -q "coverage" package.json 2>/dev/null; then
    echo "⚠️  Coverage configured in package.json but no reports found"
  fi
  if [ -f ".coveragerc" ] || [ -f "pytest.ini" ] && grep -q "cov" pytest.ini 2>/dev/null; then
    echo "⚠️  Python coverage configured but no reports found"
  fi
fi
```

### Step 4: Identify Untested Components

```bash
echo "=== Finding untested critical components ==="

# Get list of source files
SOURCE_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.py" | grep -v test | grep -v node_modules | head -100)

# For each critical component from previous analyses, check if it has tests
echo "--- Checking test coverage for critical components ---"

# Function to check if a source file has corresponding tests
check_test_coverage() {
  local source_file=$1
  local basename=$(basename "$source_file" | sed 's/\.[^.]*$//')
  local dirname=$(dirname "$source_file")
  
  # Look for test files that might test this component
  TEST_FOUND=$(find . -name "*test*" -o -name "*spec*" | xargs grep -l "$basename" 2>/dev/null | head -1)
  
  if [ -z "$TEST_FOUND" ]; then
    # Try alternative search - look for imports/requires of the file
    local import_name=$(echo "$source_file" | sed 's/^\.\///' | sed 's/\.[^.]*$//')
    TEST_FOUND=$(grep -r "import.*$import_name\|require.*$import_name" $TEST_FILES 2>/dev/null | head -1)
  fi
  
  if [ -z "$TEST_FOUND" ]; then
    echo "❌ UNTESTED: $source_file"
    return 1
  else
    echo "✓ TESTED: $source_file (by $(echo $TEST_FOUND | cut -d: -f1))"
    return 0
  fi
}

# Check critical files identified in previous analyses
echo "--- Authentication/Security components ---"
AUTH_FILES=$(grep -l "auth\|login\|jwt\|session" $SOURCE_FILES 2>/dev/null | head -10)
for file in $AUTH_FILES; do
  check_test_coverage "$file"
done

echo "--- Payment/Financial components ---"
PAYMENT_FILES=$(grep -l "payment\|charge\|billing\|stripe" $SOURCE_FILES 2>/dev/null | head -10)
for file in $PAYMENT_FILES; do
  check_test_coverage "$file"
done

echo "--- API endpoints ---"
API_FILES=$(grep -l "router\|route\|endpoint\|controller" $SOURCE_FILES 2>/dev/null | head -10)
for file in $API_FILES; do
  check_test_coverage "$file"
done
```

## 4. Analyze Test Quality

### Step 5: Detect Actual Test Quality Issues

```bash
echo "=== Analyzing test quality in discovered test files ==="

if [ "$TEST_COUNT" -gt 0 ]; then
  # Find problematic test patterns
  echo "--- Checking for test smells ---"
  
  # Skipped/disabled tests
  SKIPPED_TESTS=$(grep -n "skip\|todo\|xit\|pending\|\.skip\|test\.skip" $TEST_FILES 2>/dev/null | head -20)
  if [ -n "$SKIPPED_TESTS" ]; then
    echo "⚠️  SKIPPED/DISABLED TESTS FOUND:"
    echo "$SKIPPED_TESTS" | head -10
    SKIP_COUNT=$(echo "$SKIPPED_TESTS" | wc -l)
    echo "Total skipped tests: $SKIP_COUNT"
  else
    echo "✓ No skipped tests found"
  fi
  
  # Tests with timing dependencies
  TIMING_TESTS=$(grep -n "sleep\|setTimeout\|wait\|delay" $TEST_FILES 2>/dev/null | grep -v "waitFor" | head -10)
  if [ -n "$TIMING_TESTS" ]; then
    echo "⚠️  TIMING-DEPENDENT TESTS FOUND:"
    echo "$TIMING_TESTS"
  else
    echo "✓ No obvious timing dependencies found"
  fi
  
  # Non-deterministic tests
  RANDOM_TESTS=$(grep -n "Math\.random\|Date\.now\|new Date()" $TEST_FILES 2>/dev/null | head -10)
  if [ -n "$RANDOM_TESTS" ]; then
    echo "⚠️  NON-DETERMINISTIC TESTS FOUND:"
    echo "$RANDOM_TESTS"
  else
    echo "✓ No random/date-based tests found"
  fi
  
  # Tests without assertions
  echo "--- Checking for tests without assertions ---"
  for test_file in $(echo "$TEST_FILES" | head -10); do
    if [ -f "$test_file" ]; then
      # Count test definitions vs assertions
      TEST_DEFS=$(grep -c "it(\|test(\|it\.(\|test\." "$test_file" 2>/dev/null || echo "0")
      ASSERTIONS=$(grep -c "expect\|assert\|should" "$test_file" 2>/dev/null || echo "0")
      
      if [ "$TEST_DEFS" -gt "$ASSERTIONS" ] && [ "$TEST_DEFS" -gt 0 ]; then
        echo "⚠️  POSSIBLE TESTS WITHOUT ASSERTIONS in $test_file:"
        echo "   Tests: $TEST_DEFS, Assertions: $ASSERTIONS"
        # Show specific tests that might lack assertions
        grep -n "it(\|test(\|it\.(\|test\." "$test_file" 2>/dev/null | head -3
      fi
    fi
  done
else
  echo "❌ NO TEST FILES TO ANALYZE"
fi
```

### Step 6: Check Test Organization

```bash
echo "=== Checking test organization and patterns ==="

if [ "$TEST_COUNT" -gt 0 ]; then
  # Check for test fixtures/factories
  echo "--- Test fixtures and helpers ---"
  FIXTURES=$(grep -l "fixture\|factory\|mock\|stub" $TEST_FILES 2>/dev/null | head -10)
  if [ -n "$FIXTURES" ]; then
    echo "✓ Test fixtures/mocks found in:"
    echo "$FIXTURES" | head -5
  else
    echo "⚠️  No test fixtures or mocks found"
  fi
  
  # Check for integration vs unit tests
  echo "--- Test types ---"
  INTEGRATION=$(grep -l "integration\|e2e\|end-to-end" $TEST_FILES 2>/dev/null | wc -l)
  UNIT=$(grep -l "unit\|mock\|stub" $TEST_FILES 2>/dev/null | wc -l)
  echo "Integration tests: $INTEGRATION files"
  echo "Unit tests: $UNIT files"
  
  # Check for test documentation
  echo "--- Test documentation ---"
  DOCUMENTED=$(grep -c "describe.*['\"].*['\"]" $TEST_FILES 2>/dev/null | grep -v ":0" | wc -l)
  echo "Tests with descriptions: $DOCUMENTED files"
fi
```

## 5. Generate Evidence-Based Test Report

### CRITICAL: Document Only Discovered Issues

Create `docs/code-review/10-TEST_COVERAGE.md` with ONLY verified findings:

````markdown
# Test Analysis Report - VERIFIED FINDINGS ONLY

## Discovery Summary

**Analysis Date**: [Current date]
**Test Files Found**: [Count from $TEST_COUNT]
**Test Framework**: [Discovered framework or NOT FOUND]
**Coverage Reports**: [Found/Not Found]
**Source Files Analyzed**: [Count]

## Executive Summary

**IMPORTANT**: Assessment based on actual findings only.

**Test Framework Status**:
- Framework: [Actual framework found or NONE]
- Test files: [Actual count]
- Coverage data: [Available/Not Available]
- Test organization: [Description based on discovery]

## Coverage Analysis

[Only document if coverage data found in Step 3]

### Coverage Metrics
**Overall Coverage**: [Actual percentage from reports or NOT MEASURED]
- Line coverage: [X% or NOT AVAILABLE]
- Branch coverage: [X% or NOT AVAILABLE]
- Function coverage: [X% or NOT AVAILABLE]

### Untested Components

[Only list components actually found untested in Step 4]

#### Critical Security Components
[List actual untested auth/security files found]
- `[file]`: No test file found

#### Business Logic Components
[List actual untested business logic files found]
- `[file]`: No test coverage detected

#### API Endpoints
[List actual untested API files found]
- `[file]`: No test file found

## Test Quality Issues

[Only document issues actually found in Step 5]

### Test Smells Discovered

#### Skipped/Disabled Tests
[Only if found]
**Found**: [Count] skipped tests
- `[test-file:line]`: [skip/todo/xit marker]

#### Timing Dependencies
[Only if found]
**Found**: [Count] tests with timing issues
- `[test-file:line]`: Uses [sleep/setTimeout/delay]

#### Non-Deterministic Tests
[Only if found]
**Found**: [Count] tests using random/date
- `[test-file:line]`: Uses [Math.random/Date.now]

#### Tests Without Assertions
[Only if detected]
**Found**: [Count] files with assertion mismatch
- `[test-file]`: [X] tests, only [Y] assertions

## Test Organization

[Only document based on findings from Step 6]

### Test Infrastructure
- Test fixtures/mocks: [Found in X files / NOT FOUND]
- Integration tests: [Count] files
- Unit tests: [Count] files
- Test documentation: [Count] files with descriptions

## NOT FOUND (Testing Gaps)

### Missing Test Infrastructure
- ❌ No test files found [if TEST_COUNT = 0]
- ❌ No coverage reports available
- ❌ No test framework configured
- ❌ No test fixtures or helpers

### Missing Test Coverage
[Based on Step 4 findings]
- ❌ Authentication components untested
- ❌ Payment processing untested
- ❌ API endpoints without tests
- ❌ No integration tests found

## Recommendations

[Only include recommendations for actual issues found]

### Immediate Actions

[If no tests found]
1. **Set up test framework**
   - Project type: [detected language]
   - Recommended: [appropriate framework]

[If untested critical components found]
2. **Add tests for critical components**
   - Priority files: [list actual untested files]
   - Security components need immediate coverage

[If test quality issues found]
3. **Fix test quality issues**
   - Enable [count] skipped tests
   - Remove timing dependencies in [count] tests
   - Add assertions to [count] tests

### Validation Before Report

```bash
echo "=== Validating test findings ==="

# Count actual findings
UNTESTED_COUNT=$(grep -c "UNTESTED:" test-scan.log 2>/dev/null || echo "0")
SKIPPED_COUNT=$(grep -c "skip\|todo\|xit" test-scan.log 2>/dev/null || echo "0")
TIMING_COUNT=$(grep -c "setTimeout\|sleep" test-scan.log 2>/dev/null || echo "0")

echo "Documented findings:"
echo "- Untested components: $UNTESTED_COUNT"
echo "- Skipped tests: $SKIPPED_COUNT"  
echo "- Timing issues: $TIMING_COUNT"
echo "- Test files found: $TEST_COUNT"
```

### Documentation Checklist

Before saving the test analysis:
- [ ] Every coverage gap references actual missing test files
- [ ] Every test smell has file:line evidence
- [ ] Coverage metrics from actual reports only
- [ ] No hypothetical test examples without gaps identified
- [ ] "NOT FOUND" section documents missing infrastructure

````

## 6. Generate Test Templates (Only If Gaps Found)

### Only Create Templates for Discovered Gaps

```bash
# Only generate test templates if untested components were found
if [ "$UNTESTED_COUNT" -gt 0 ]; then
  echo "=== Creating test templates for untested components ==="
  
  # Create directory only if needed
  mkdir -p tests/generated
  
  # Generate templates based on actual untested files found
  echo "Test templates would be generated for:"
  grep "UNTESTED:" test-scan.log 2>/dev/null | head -10
  
  # Note: Actual template generation would be based on:
  # - Language/framework detected
  # - Specific untested components found
  # - Existing test patterns in the codebase
fi
```

```
memory_store_chunk
  content="Test analysis completed. Coverage gaps: [count]. Critical untested paths: [list]. Test templates generated: [count]"
  session_id="test-researcher-$(date +%s)"
  repository="github.com/org/repo"
  tags=["testing", "coverage", "quality", "templates"]

memory_tasks session_end session_id="test-researcher-$(date +%s)" repository="github.com/org/repo"
```

## Execution Notes

- **Critical Path Focus**: Prioritize authentication, payments, and data validation
- **Quality Over Quantity**: Fix test smells before adding new tests
- **Practical Templates**: Generate usable test code with proper mocking
- **Language Agnostic**: Adapts to JavaScript/TypeScript, Go, Python test frameworks
- **Business Impact**: Rank gaps by potential production impact


## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format
```markdown
## Test Coverage Analysis Findings

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