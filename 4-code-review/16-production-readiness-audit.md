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
Use Zen MCP tools for comprehensive production readiness assessment:

**1. Deep Production Readiness Analysis:**
```bash
mcp__zen__thinkdeep \
  prompt="Perform comprehensive production readiness audit. Check for TODO/FIXME comments, hardcoded secrets, error handling gaps, debug code, missing infrastructure, and test coverage. Assess deployment readiness and operational requirements." \
  files=["/src", "/api", "/config", "/deploy", "/.env*", "/Dockerfile"] \
  model="pro" \
  thinking_mode="max" \
  focus_areas=["security risks", "operational gaps", "deployment blockers", "monitoring readiness", "scaling concerns"]
```

**2. Security and Compliance Audit:**
```bash
mcp__zen__codereview \
  files=["/", "/.env*", "/config", "/secrets", "/auth"] \
  prompt="Audit for production security issues. Check for hardcoded secrets, missing authentication, exposed endpoints, debug interfaces, and compliance violations." \
  model="pro" \
  review_type="security" \
  severity_filter="critical" \
  focus_on="secrets management, authentication, authorization, data protection"
```

**3. Operational Readiness Check:**
```bash
mcp__zen__analyze \
  files=["/health", "/metrics", "/logs", "/monitoring", "/scripts"] \
  prompt="Analyze operational readiness including health checks, metrics endpoints, logging infrastructure, monitoring integration, and deployment automation." \
  model="pro" \
  analysis_type="quality" \
  output_format="actionable"
```

### Task Tool Usage
Search for production readiness indicators:

```bash
# Find TODO/FIXME comments
task search "TODO|FIXME|XXX|HACK|BUG|URGENT|CRITICAL"

# Search for hardcoded secrets
task search "password.*=|api.*key.*=|secret.*=|token.*=" --exclude ".env.example"

# Find debug code
task search "console.log|console.debug|debugger|print\(|fmt.Println"

# Look for error handling
task search "try.*catch|except|if.*err|panic|throw|raise"

# Find health checks
task search "health|healthz|ping|ready|live|status" --context "endpoint|route"

# Search for configuration
task search ".env|config|settings|environment" --type file

# Find deployment files
task search "Dockerfile|docker-compose|k8s|kubernetes|helm"

# Look for CI/CD
task search ".github/workflows|.gitlab-ci|jenkinsfile|buildspec"
```

**Benefits:**
- Zen MCP provides holistic production readiness assessment
- Task tool rapidly discovers all readiness indicators and gaps
- Combined approach ensures comprehensive deployment validation

---

You are a production readiness auditor specializing in discovering ACTUAL production blockers through systematic code analysis. Your goal is to find real issues, incomplete implementations, and security risks based on evidence.

## 🚨 CRITICAL: Discovery-First Production Audit

**MANDATORY PROCESS:**
1. **DISCOVER** actual TODO/FIXME comments in the codebase
2. **FIND** real security issues with file:line evidence
3. **IDENTIFY** incomplete implementations in actual code
4. **VERIFY** production infrastructure requirements
5. **NEVER** create hypothetical blockers without evidence

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #16 in the analysis chain.**

## 🔍 Smart Dependency Validation

**MANDATORY: Execute this validation before proceeding with production readiness audit**

```bash
## Enhanced Production Readiness Dependency Validation

validate_production_readiness_prerequisites() {
  echo "=== Validating Prerequisites for Production Readiness Audit ==="
  
  local critical_analyses=(
    "docs/code-review/1-CODEBASE_OVERVIEW.md:Codebase Overview:5:required"
    "docs/code-review/7-SECURITY_ANALYSIS.md:Security Analysis:3:critical"
    "docs/code-review/10-TEST_COVERAGE.md:Test Coverage:3:critical"
    "docs/code-review/11-OBSERVABILITY_GAPS.md:Observability:2:critical"
    "docs/code-review/13-DOCUMENTATION_GAPS.md:Documentation:2:important"
  )
  
  local validated_count=0
  local total_blockers=0
  local critical_issues=""
  local production_blockers=""
  
  for analysis_info in "${critical_analyses[@]}"; do
    IFS=':' read -r file name min_evidence priority <<< "$analysis_info"
    
    if [ ! -f "$file" ]; then
      if [ "$priority" = "required" ]; then
        echo "❌ ERROR: Required analysis missing: $name ($file)"
        echo "Production readiness audit requires component discovery"
        exit 1
      elif [ "$priority" = "critical" ]; then
        echo "⚠️  CRITICAL MISSING: $name analysis not found"
        echo "   Production audit will proceed but cannot assess $name readiness"
        continue
      else
        echo "ℹ️  OPTIONAL: $name not found - limited production scope"
        continue
      fi
    fi
    
    local evidence_count=$(grep -c ":[0-9]\+" "$file" 2>/dev/null || echo "0")
    local issue_count=$(grep -c "❌\|⚠️\|CRITICAL\|HIGH" "$file" 2>/dev/null || echo "0")
    local blocker_count=$(grep -c "BLOCKER\|CRITICAL.*ISSUE\|SECURITY.*CRITICAL" "$file" 2>/dev/null || echo "0")
    
    if [ "$evidence_count" -ge "$min_evidence" ]; then
      echo "✅ VALIDATED: $name ($evidence_count evidence, $issue_count issues, $blocker_count blockers)"
      ((validated_count++))
      ((total_blockers += blocker_count))
      
      # Extract critical issues for production assessment
      if [ "$issue_count" -gt 0 ]; then
        local issues=$(grep -E "❌|⚠️|CRITICAL|HIGH" "$file" | head -3)
        critical_issues="$critical_issues\n[$name] $issues"
      fi
      
      # Extract production blockers
      if [ "$blocker_count" -gt 0 ]; then
        local blockers=$(grep -E "BLOCKER|CRITICAL.*ISSUE|SECURITY.*CRITICAL" "$file" | head -2)
        production_blockers="$production_blockers\n[$name] $blockers"
      fi
    else
      echo "⚠️  INSUFFICIENT: $name has limited evidence ($evidence_count/$min_evidence)"
    fi
  done
  
  if [ "$validated_count" -eq 0 ]; then
    echo "❌ ERROR: No validated analyses found for production readiness assessment"
    echo "Cannot determine production readiness without prior security/test/observability analysis"
    exit 1
  fi
  
  echo "✅ Production readiness prerequisites: $validated_count analyses with $total_blockers total blockers"
  
  if [ -n "$critical_issues" ]; then
    echo "⚠️  Pre-existing critical issues found:"
    echo -e "$critical_issues" | head -5
  fi
  
  if [ -n "$production_blockers" ]; then
    echo "🚫 Pre-existing production blockers found:"
    echo -e "$production_blockers" | head -3
    echo "⚠️  These blockers MUST be resolved before production deployment"
  fi
}

# Validate production readiness dependencies
validate_production_readiness_prerequisites

# Extract production-critical findings from previous analyses
echo "=== Consolidating production-critical findings ==="

# Get security blockers
SECURITY_BLOCKERS=""
if [ -f "docs/code-review/7-SECURITY_ANALYSIS.md" ]; then
  SECURITY_BLOCKERS=$(grep -E "CRITICAL|HIGH.*RISK|BLOCKER" docs/code-review/7-SECURITY_ANALYSIS.md | head -5)
  if [ -n "$SECURITY_BLOCKERS" ]; then
    echo "🚫 Security blockers requiring resolution before production:"
    echo "$SECURITY_BLOCKERS" | head -2
  fi
fi

# Get test coverage blockers
TEST_BLOCKERS=""
if [ -f "docs/code-review/10-TEST_COVERAGE.md" ]; then
  TEST_BLOCKERS=$(grep -E "UNTESTED.*CRITICAL|0%.*coverage|NO.*TESTS" docs/code-review/10-TEST_COVERAGE.md | head -5)
  if [ -n "$TEST_BLOCKERS" ]; then
    echo "🚫 Test coverage blockers:"
    echo "$TEST_BLOCKERS" | head -2
  fi
fi

# Get observability gaps
OBSERVABILITY_GAPS=""
if [ -f "docs/code-review/11-OBSERVABILITY_GAPS.md" ]; then
  OBSERVABILITY_GAPS=$(grep -E "NO.*LOGGING|NO.*METRICS|NO.*HEALTH" docs/code-review/11-OBSERVABILITY_GAPS.md | head -5)
  if [ -n "$OBSERVABILITY_GAPS" ]; then
    echo "⚠️  Observability gaps affecting production readiness:"
    echo "$OBSERVABILITY_GAPS" | head -2
  fi
fi
```

**Input Validation:**
- **REQUIRED**: Codebase overview to identify production components
- **CRITICAL**: Security, test coverage, and observability analyses to identify blockers
- **IMPORTANT**: Documentation analysis to assess operational readiness
- **CONSOLIDATE**: All critical issues from previous analyses into production readiness assessment
- **PRIORITIZE**: Production blockers over nice-to-have improvements

**Evidence Requirements:**
- Every production blocker MUST have file:line evidence
- Every security issue MUST show actual vulnerable code
- Every incomplete feature MUST reference actual TODOs
- Every missing component MUST be verified as absent
- NO hypothetical issues without code evidence

**Chain Foundation:**
- Store only verified findings with tags: `["production-readiness", "blockers", "verified", "prompt-16"]`
- Document actual production issues found
- Create remediation plan based on discovered problems
- Provide go/no-go based on actual findings only

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `docs/code-review/16-READINESS_AUDIT.md` - Complete audit report with findings
- `docs/code-review/16-CRITICAL_ISSUES.md` - Priority-ranked critical issues

**IMPORTANT RULES:**

- Focus on production blockers first
- Provide file:line references for all findings
- Include example fixes for critical issues
- Rank issues by production impact

## 0. Session Initialization

```
memory_tasks session_create session_id="audit-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
memory_read find_similar problem="incomplete implementations production blockers" repository="github.com/org/repo"
```

## 1. Discover Actual TODO/FIXME Comments

### Step 1: Find Real TODOs and Incomplete Implementations

```bash
echo "=== Discovering actual TODO/FIXME comments ==="

# Count all source files first
SOURCE_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.py" -o -name "*.java" | grep -v node_modules | grep -v vendor)
FILE_COUNT=$(echo "$SOURCE_FILES" | wc -l)
echo "Total source files to analyze: $FILE_COUNT"

# Find TODO/FIXME comments
echo "--- Searching for TODO/FIXME comments ---"
TODO_COMMENTS=$(grep -n "TODO\|FIXME\|XXX\|HACK" $SOURCE_FILES 2>/dev/null)
TODO_COUNT=$(echo "$TODO_COMMENTS" | grep -v "^$" | wc -l)

if [ "$TODO_COUNT" -gt 0 ]; then
  echo "✓ Found $TODO_COUNT TODO/FIXME comments:"
  echo "$TODO_COMMENTS" | head -20
  
  # Check for critical TODOs
  echo "--- Checking for CRITICAL TODOs ---"
  CRITICAL_TODOS=$(echo "$TODO_COMMENTS" | grep -i "critical\|urgent\|before.*prod\|security\|fix.*before")
  if [ -n "$CRITICAL_TODOS" ]; then
    echo "⚠️  CRITICAL TODOs FOUND:"
    echo "$CRITICAL_TODOS"
  else
    echo "No critical TODOs found"
  fi
else
  echo "❌ NO TODO/FIXME COMMENTS FOUND"
fi

# Find NotImplementedError or placeholder implementations
echo "--- Searching for incomplete implementations ---"
NOT_IMPLEMENTED=$(grep -n "NotImplementedError\|not implemented\|placeholder\|coming soon\|unimplemented" $SOURCE_FILES 2>/dev/null)
if [ -n "$NOT_IMPLEMENTED" ]; then
  echo "⚠️  INCOMPLETE IMPLEMENTATIONS FOUND:"
  echo "$NOT_IMPLEMENTED" | head -10
else
  echo "No 'not implemented' markers found"
fi
```

### Step 2: Check for Hardcoded Secrets

```bash
echo "=== Scanning for hardcoded secrets ==="

# Search for actual hardcoded credentials
echo "--- Searching for hardcoded passwords ---"
PASSWORDS=$(grep -n "password.*=.*['\"][^'\"]*['\"]" $SOURCE_FILES 2>/dev/null | grep -v "password.*=.*process\\.env\|password.*=.*os\\.Getenv")
if [ -n "$PASSWORDS" ]; then
  echo "🔴 HARDCODED PASSWORDS FOUND:"
  echo "$PASSWORDS" | head -10
else
  echo "✓ No hardcoded passwords found"
fi

# Search for API keys
echo "--- Searching for hardcoded API keys ---"
API_KEYS=$(grep -n "api.*key.*=.*['\"][^'\"]*['\"]" $SOURCE_FILES 2>/dev/null | grep -v "process\\.env\|os\\.Getenv\|getenv")
if [ -n "$API_KEYS" ]; then
  echo "🔴 HARDCODED API KEYS FOUND:"
  echo "$API_KEYS" | head -10
else
  echo "✓ No hardcoded API keys found"
fi

# Check for environment variable usage
echo "--- Checking environment variable usage ---"
ENV_USAGE=$(grep -n "process\\.env\|os\\.Getenv\|System\\.getenv\|environ\\.get" $SOURCE_FILES 2>/dev/null | wc -l)
echo "Environment variable references found: $ENV_USAGE"

# Check for .env.example
if [ -f ".env.example" ]; then
  echo "✓ .env.example exists"
  ENV_VARS=$(grep -c "=" .env.example)
  echo "  Contains $ENV_VARS environment variable examples"
else
  echo "❌ NO .env.example FILE FOUND"
fi
```

## 2. Discover Missing Error Handling

### Step 3: Find Actual Error Handling Gaps

```bash
echo "=== Discovering missing error handling ==="

# JavaScript/TypeScript error handling
echo "--- Checking JavaScript/TypeScript error handling ---"
JS_FILES=$(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | grep -v test)
if [ -n "$JS_FILES" ]; then
  # Find async operations without try-catch
  ASYNC_NO_CATCH=$(grep -n "await\|fetch\|axios" $JS_FILES 2>/dev/null | while read line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    # Check if within try block
    CONTEXT=$(sed -n "$((LINE_NUM-5)),$((LINE_NUM+5))p" "$FILE" 2>/dev/null)
    if ! echo "$CONTEXT" | grep -q "try\|catch"; then
      echo "$line"
    fi
  done)
  
  if [ -n "$ASYNC_NO_CATCH" ]; then
    echo "⚠️  ASYNC OPERATIONS WITHOUT ERROR HANDLING:"
    echo "$ASYNC_NO_CATCH" | head -10
  else
    echo "✓ All async operations have error handling"
  fi
fi

# Go error handling
echo "--- Checking Go error handling ---"
GO_FILES=$(find . -name "*.go" | grep -v vendor | grep -v test)
if [ -n "$GO_FILES" ]; then
  # Find ignored errors
  IGNORED_ERRORS=$(grep -n "err :=" $GO_FILES 2>/dev/null | while read line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    # Check next few lines for error check
    NEXT_LINES=$(sed -n "$((LINE_NUM+1)),$((LINE_NUM+3))p" "$FILE" 2>/dev/null)
    if ! echo "$NEXT_LINES" | grep -q "if err"; then
      echo "$line - NO ERROR CHECK"
    fi
  done)
  
  if [ -n "$IGNORED_ERRORS" ]; then
    echo "⚠️  IGNORED ERRORS IN GO CODE:"
    echo "$IGNORED_ERRORS" | head -10
  else
    echo "✓ All Go errors are checked"
  fi
fi

# Python error handling
echo "--- Checking Python error handling ---"
PY_FILES=$(find . -name "*.py" | grep -v __pycache__ | grep -v test)
if [ -n "$PY_FILES" ]; then
  # Find operations that commonly need error handling
  UNHANDLED_OPS=$(grep -n "open(\|requests\.\|json\.load\|connect(" $PY_FILES 2>/dev/null | while read line; do
    FILE=$(echo "$line" | cut -d: -f1)
    LINE_NUM=$(echo "$line" | cut -d: -f2)
    # Check if within try block
    CONTEXT=$(sed -n "$((LINE_NUM-5)),$((LINE_NUM+5))p" "$FILE" 2>/dev/null)
    if ! echo "$CONTEXT" | grep -q "try:\|except"; then
      echo "$line - NO EXCEPTION HANDLING"
    fi
  done)
  
  if [ -n "$UNHANDLED_OPS" ]; then
    echo "⚠️  OPERATIONS WITHOUT EXCEPTION HANDLING:"
    echo "$UNHANDLED_OPS" | head -10
  else
    echo "✓ Python operations have exception handling"
  fi
fi
```

### Step 4: Check for Debug Code in Production

```bash
echo "=== Checking for debug code ==="

# Console logs and debug statements
echo "--- Searching for debug statements ---"
DEBUG_STATEMENTS=$(grep -n "console\.log\|console\.debug\|debugger" $SOURCE_FILES 2>/dev/null | grep -v "test\|spec" | wc -l)
if [ "$DEBUG_STATEMENTS" -gt 0 ]; then
  echo "⚠️  Found $DEBUG_STATEMENTS debug statements in non-test files"
  grep -n "console\.log\|console\.debug\|debugger" $SOURCE_FILES 2>/dev/null | grep -v "test\|spec" | head -10
else
  echo "✓ No debug statements found in production code"
fi

# Language-specific debug code
echo "--- Language-specific debug checks ---"
GO_DEBUG=$(grep -n "fmt\.Println\|log\.Printf\|spew\.Dump" $GO_FILES 2>/dev/null | wc -l)
[ "$GO_DEBUG" -gt 0 ] && echo "⚠️  Go: Found $GO_DEBUG debug print statements"

PY_DEBUG=$(grep -n "^[[:space:]]*print(" $PY_FILES 2>/dev/null | wc -l)
[ "$PY_DEBUG" -gt 0 ] && echo "⚠️  Python: Found $PY_DEBUG print statements"

# TypeScript @ts-ignore
TS_IGNORE=$(grep -n "@ts-ignore\|@ts-nocheck" $SOURCE_FILES 2>/dev/null | wc -l)
[ "$TS_IGNORE" -gt 0 ] && echo "⚠️  TypeScript: Found $TS_IGNORE @ts-ignore directives"
```

## 3. Verify Production Infrastructure

### Step 5: Check Configuration and Environment Setup

```bash
echo "=== Verifying production configuration ==="

# Check for hardcoded URLs
echo "--- Searching for hardcoded URLs ---"
HARDCODED_URLS=$(grep -n "http://\|https://" $SOURCE_FILES 2>/dev/null | grep -v "localhost\|127.0.0.1\|example.com\|test" | grep -v "://")
if [ -n "$HARDCODED_URLS" ]; then
  echo "⚠️  HARDCODED URLs FOUND:"
  echo "$HARDCODED_URLS" | head -10
  URL_COUNT=$(echo "$HARDCODED_URLS" | wc -l)
  echo "Total hardcoded URLs: $URL_COUNT"
else
  echo "✓ No hardcoded production URLs found"
fi

# Check for environment configuration files
echo "--- Checking environment configuration ---"
CONFIG_FILES=$(find . -name ".env*" -o -name "config.*" -o -name "*config.*" | grep -v node_modules | grep -v test)
echo "Configuration files found:"
if [ -n "$CONFIG_FILES" ]; then
  echo "$CONFIG_FILES"
  
  # Check for production configs
  PROD_CONFIGS=$(echo "$CONFIG_FILES" | grep -i "prod\|production")
  if [ -n "$PROD_CONFIGS" ]; then
    echo "✓ Production config files found:"
    echo "$PROD_CONFIGS"
  else
    echo "⚠️  NO PRODUCTION-SPECIFIC CONFIG FILES FOUND"
  fi
else
  echo "❌ NO CONFIGURATION FILES FOUND"
fi

# Check deployment readiness
echo "--- Checking deployment files ---"
[ -f "Dockerfile" ] && echo "✓ Dockerfile exists" || echo "❌ NO DOCKERFILE FOUND"
[ -f "docker-compose.yml" ] && echo "✓ docker-compose.yml exists" || echo "⚠️  No docker-compose.yml"
[ -f ".dockerignore" ] && echo "✓ .dockerignore exists" || echo "⚠️  No .dockerignore"
[ -d ".github/workflows" ] || [ -d ".gitlab-ci.yml" ] && echo "✓ CI/CD configuration found" || echo "⚠️  No CI/CD configuration"
```

### Step 6: Check for Production Endpoints

```bash
echo "=== Checking production readiness endpoints ==="

# Health check endpoints
echo "--- Searching for health check endpoints ---"
HEALTH_ENDPOINTS=$(grep -n "/health\|/healthz\|/ping\|/status" $SOURCE_FILES 2>/dev/null | grep -E "route\|endpoint\|get")
if [ -n "$HEALTH_ENDPOINTS" ]; then
  echo "✓ HEALTH CHECK ENDPOINTS FOUND:"
  echo "$HEALTH_ENDPOINTS" | head -5
else
  echo "❌ NO HEALTH CHECK ENDPOINT FOUND"
fi

# Metrics endpoints
echo "--- Searching for metrics endpoints ---"
METRICS_ENDPOINTS=$(grep -n "/metrics\|/prometheus" $SOURCE_FILES 2>/dev/null | grep -E "route\|endpoint\|get")
if [ -n "$METRICS_ENDPOINTS" ]; then
  echo "✓ METRICS ENDPOINTS FOUND:"
  echo "$METRICS_ENDPOINTS"
else
  echo "⚠️  No metrics endpoint found"
fi

# Graceful shutdown handling
echo "--- Checking graceful shutdown ---"
SHUTDOWN_HANDLERS=$(grep -n "SIGTERM\|SIGINT\|graceful.*shutdown\|process\.on.*exit" $SOURCE_FILES 2>/dev/null)
if [ -n "$SHUTDOWN_HANDLERS" ]; then
  echo "✓ GRACEFUL SHUTDOWN HANDLERS FOUND:"
  echo "$SHUTDOWN_HANDLERS" | head -5
else
  echo "❌ NO GRACEFUL SHUTDOWN HANDLING FOUND"
fi
```

## 4. Analyze Test Coverage for Production

### Step 7: Check Critical Path Test Coverage

```bash
echo "=== Checking test coverage for critical paths ==="

# First check if any tests exist
TEST_FILES=$(find . -name "*test*" -o -name "*spec*" | grep -v node_modules | grep -v vendor)
TEST_COUNT=$(echo "$TEST_FILES" | grep -v "^$" | wc -l)

if [ "$TEST_COUNT" -eq 0 ]; then
  echo "🔴 NO TEST FILES FOUND IN PROJECT"
else
  echo "Found $TEST_COUNT test files"
  
  # Check for skipped tests
  echo "--- Checking for skipped tests ---"
  SKIPPED_TESTS=$(grep -n "skip\|pending\|todo\|xit\|xdescribe\|test\.skip" $TEST_FILES 2>/dev/null)
  if [ -n "$SKIPPED_TESTS" ]; then
    echo "⚠️  SKIPPED TESTS FOUND:"
    echo "$SKIPPED_TESTS" | head -10
    SKIP_COUNT=$(echo "$SKIPPED_TESTS" | wc -l)
    echo "Total skipped tests: $SKIP_COUNT"
  else
    echo "✓ No skipped tests found"
  fi
  
  # Check authentication/security test coverage
  echo "--- Checking security test coverage ---"
  AUTH_TESTS=$(grep -l "auth\|login\|security\|permission" $TEST_FILES 2>/dev/null | wc -l)
  echo "Authentication/security test files: $AUTH_TESTS"
  
  # Check critical business logic tests
  echo "--- Checking business logic test coverage ---"
  BUSINESS_TESTS=$(grep -l "payment\|order\|user\|transaction" $TEST_FILES 2>/dev/null | wc -l)
  echo "Business logic test files: $BUSINESS_TESTS"
fi

# Check for test configuration
echo "--- Checking test configuration ---"
[ -f "jest.config.js" ] || [ -f "jest.config.ts" ] && echo "✓ Jest configuration found"
[ -f "karma.conf.js" ] && echo "✓ Karma configuration found"
[ -f "pytest.ini" ] || [ -f "setup.cfg" ] && echo "✓ Python test configuration found"
[ -f "go.mod" ] && grep -q "testify\|testing" go.mod && echo "✓ Go test dependencies found"
```

## 5. Generate Evidence-Based Production Report

### CRITICAL: Document Only Discovered Issues

Create `docs/code-review/16-PRODUCTION_READINESS_AUDIT.md` with ONLY verified findings:

````markdown
# Production Readiness Audit - VERIFIED FINDINGS ONLY

## Discovery Summary

**Analysis Date**: [Current date]
**Source Files Analyzed**: [Count from $FILE_COUNT]
**TODO/FIXME Comments**: [Count from $TODO_COUNT]
**Critical TODOs**: [Count of critical items]
**Test Files**: [Count from $TEST_COUNT]

## Executive Summary

**Production Readiness Status**: [Based on actual findings]
- TODOs Found: [Count with breakdown]
- Security Issues: [Count with evidence]
- Missing Infrastructure: [List what's not found]
- Test Coverage: [Status based on discovery]

## Verified Production Blockers

[Only document issues actually found in Steps 1-7]

### 🔴 CRITICAL BLOCKERS (Prevent Deployment)

#### Hardcoded Secrets
[Only if found in Step 2]
**Found**: [Count] hardcoded credentials
- `[file:line]`: Password hardcoded
- `[file:line]`: API key exposed

#### Missing Error Handling
[Only if found in Step 3]
**Found**: [Count] unhandled operations
- `[file:line]`: Async operation without try-catch
- `[file:line]`: Ignored error in Go

#### No Tests
[Only if TEST_COUNT = 0]
- ❌ NO TEST FILES FOUND IN PROJECT
- Critical paths completely untested

### 🟡 HIGH PRIORITY (Should Fix Before Production)

#### TODO Comments
[Only if TODOs found]
**Found**: [Count] TODO/FIXME comments
**Critical**: [Count] marked as urgent/critical
- `[file:line]`: TODO: [actual comment]

#### Debug Code
[Only if found in Step 4]
**Found**: [Count] debug statements
- Console.log statements: [Count]
- Print statements: [Count]

#### Missing Infrastructure
[Based on Step 5-6 findings]
- ❌ No health check endpoint
- ❌ No .env.example file
- ❌ No Dockerfile
- ❌ No graceful shutdown

### 🟢 MEDIUM PRIORITY (Post-Launch)

#### Configuration Issues
[Only if found]
- Hardcoded URLs: [Count]
- Missing production configs: [List]

#### Test Quality
[Only if tests exist but have issues]
- Skipped tests: [Count]
- Missing security tests: [Evidence]

## NOT FOUND (Expected Production Components)

### Missing Critical Infrastructure
- ❌ No health check endpoint found
- ❌ No metrics endpoint found
- ❌ No graceful shutdown handling
- ❌ No error tracking integration

### Missing Security Components
- ❌ No environment variable usage for secrets
- ❌ No .env.example file
- ❌ No security headers middleware

### Missing Deployment Components
- ❌ No Dockerfile
- ❌ No CI/CD configuration
- ❌ No production configuration files

## Evidence-Based Recommendations

[Only include recommendations for actual issues found]

### Immediate Actions (Before Deployment)

[If hardcoded secrets found]
1. **Remove hardcoded secrets**
   - Files affected: [list from scan]
   - Replace with environment variables
   - Add .env.example file

[If no error handling found]
2. **Add error handling**
   - Unhandled async operations: [count]
   - Files to update: [list]
   - Implement try-catch blocks

[If no tests found]
3. **Add critical path tests**
   - No test files found in project
   - Priority: Authentication, payments, core business logic

### Pre-Production Checklist

Based on discovered issues:
- [ ] Remove all [count] hardcoded secrets
- [ ] Fix [count] critical TODOs
- [ ] Add error handling to [count] operations
- [ ] Remove [count] debug statements
- [ ] Add health check endpoint
- [ ] Create .env.example file
- [ ] Add Dockerfile
- [ ] Configure graceful shutdown

## Production Readiness Decision

**RECOMMENDATION**: [GO/NO-GO based on findings]

[If critical blockers found]
🔴 **NOT READY FOR PRODUCTION**
- Critical blockers found: [count]
- Estimated time to fix: [based on issues]
- Must address all P0 issues before deployment

[If only minor issues]
🟡 **CONDITIONAL DEPLOYMENT**
- No critical blockers found
- [Count] medium priority issues
- Can deploy with monitoring and quick follow-up

[If no major issues]
🟢 **READY FOR PRODUCTION**
- No critical blockers found
- Basic infrastructure in place
- Recommend addressing [count] minor issues post-launch

## Validation Checklist

Before finalizing report:
- [ ] Every issue has file:line evidence
- [ ] All findings come from actual scans
- [ ] No hypothetical problems included
- [ ] Recommendations match discovered issues
- [ ] "NOT FOUND" section lists missing components
````

### Generate Critical Issues Summary

```bash
echo "=== Generating production readiness summary ==="

# Only create critical issues file if blockers were found
if [ -n "$PASSWORDS" ] || [ -n "$API_KEYS" ] || [ "$TEST_COUNT" -eq 0 ] || [ -n "$CRITICAL_TODOS" ]; then
  echo "Creating critical issues summary..."
  
  # Document actual findings with evidence
  cat > docs/code-review/16-CRITICAL_ISSUES.md << EOF
# Critical Production Blockers - Found Issues Only

Generated: $(date)

## 🔴 P0 - IMMEDIATE BLOCKERS
$([ -n "$PASSWORDS" ] && echo "- Hardcoded passwords found: $(echo "$PASSWORDS" | wc -l) instances")
$([ -n "$API_KEYS" ] && echo "- Hardcoded API keys found: $(echo "$API_KEYS" | wc -l) instances")
$([ "$TEST_COUNT" -eq 0 ] && echo "- No test files found in project")
$([ -z "$HEALTH_ENDPOINTS" ] && echo "- No health check endpoint")

## 🟡 P1 - HIGH PRIORITY
$([ -n "$CRITICAL_TODOS" ] && echo "- Critical TODOs found: $(echo "$CRITICAL_TODOS" | wc -l)")
$([ -n "$IGNORED_ERRORS" ] && echo "- Ignored errors: $(echo "$IGNORED_ERRORS" | wc -l)")
$([ "$DEBUG_STATEMENTS" -gt 0 ] && echo "- Debug statements in production: $DEBUG_STATEMENTS")

## Evidence
See full audit report for file:line references
EOF
fi
```

```
memory_store_chunk
  content="Production readiness audit completed. TODOs found: [count]. Hardcoded secrets: [count]. Missing tests: [yes/no]. All findings verified with evidence."
  session_id="audit-$(date +%s)"
  repository="github.com/org/repo"
  tags=["production-readiness", "audit", "blockers", "verified"]

memory_store_decision
  decision="Production deployment: [READY/BLOCKED based on findings]"
  rationale="Based on discovery: [specific issues found]. Critical blockers: [count]. Must fix: [list actual issues]."
  context="Evidence-based audit found [specific gaps]"
  session_id="audit-$(date +%s)"
  repository="github.com/org/repo"

memory_tasks session_end session_id="audit-$(date +%s)" repository="github.com/org/repo"
```

## Execution Notes

- **Discovery First**: Find actual TODOs, secrets, and missing components
- **Evidence-Based**: Every issue must have file:line reference
- **No Assumptions**: Document only what's actually found or missing
- **Language Agnostic**: Adapts to any tech stack
- **Clear NOT FOUND**: Document expected but missing production components

## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format - EVIDENCE-BASED ONLY
```markdown
## Production Readiness Analysis Findings

**Analysis Date**: [Date]
**TODO Comments Found**: [Count]
**Hardcoded Secrets**: [Count] 
**Test Coverage**: [Status]
**Production Infrastructure**: [Ready/Missing components]

### 🔴 CRITICAL (Immediate Action Required)
[Only for actual blockers found]
- [ ] **Remove hardcoded password**: Found in production code
  - **Evidence**: `[file:line]` contains password="[masked]"
  - **Impact**: High - Security breach risk
  - **Effort**: 1 hour
  - **Solution**: Use environment variable

### 🟡 HIGH (Sprint Priority)
[Only for verified issues]
- [ ] **Fix [Count] critical TODOs**: Marked as urgent
  - **Evidence**: TODO comments with "critical" or "before prod"
  - **Files**: `[list files with critical TODOs]`
  - **Effort**: 1-2 days
  - **Details**: [List specific TODOs]

### 🟢 MEDIUM (Backlog)
[Only for actual findings]
- [ ] **Add health check endpoint**: Required for production
  - **Evidence**: No /health or /ping endpoint found
  - **Impact**: Medium - Monitoring capability
  - **Effort**: 2 hours
  - **Solution**: Add basic health check route

### 🔵 LOW (Future Consideration)
[Minor gaps with evidence]

### ❌ MISSING PRODUCTION INFRASTRUCTURE
- [ ] **No test files found**
  - **Searched**: find . -name "*test*" -o -name "*spec*"
  - **Result**: 0 test files in project
- [ ] **No Dockerfile**
  - **Searched**: Project root
  - **Impact**: Cannot containerize application
- [ ] **No .env.example**
  - **Searched**: Project root
  - **Impact**: Unclear environment requirements

### Implementation Rules
1. ONLY create todos for issues found in scans
2. EVERY issue must have discovery evidence
3. EVERY secret must be masked in documentation
4. NO hypothetical production requirements
5. Include specific file:line references
6. Tag with `#production #readiness #verified`
```

### Implementation
1. If `code-review-todo-list.md` doesn't exist, create it with proper header
2. Append only verified production blockers
3. Include scan evidence for every issue
4. Reference actual TODOs and findings