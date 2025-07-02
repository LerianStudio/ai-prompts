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
Use Zen MCP tools for advanced observability and monitoring analysis:

**1. Observability Maturity Assessment:**
```bash
mcp__zen__thinkdeep \
  prompt="Assess the observability maturity of this system. Analyze logging strategies, metrics collection, distributed tracing, and error handling. Identify blind spots and recommend improvements." \
  files=["/api", "/services", "/middleware", "/error-handlers", "/monitoring"] \
  model="pro" \
  thinking_mode="high" \
  focus_areas=["logging coverage", "metrics granularity", "trace completeness", "alert effectiveness", "debugging capability"]
```

**2. Critical Path Monitoring Review:**
```bash
mcp__zen__codereview \
  files=["/api/critical", "/services/payment", "/auth", "/data-processing"] \
  prompt="Review monitoring coverage for critical business paths. Check for proper logging, metrics, error tracking, and performance monitoring at each step." \
  model="pro" \
  review_type="full" \
  focus_on="transaction monitoring, error visibility, performance metrics, business KPIs"
```

**3. Debug Production Issues:**
```bash
mcp__zen__debug \
  prompt="System experiencing intermittent failures in production with limited visibility" \
  files=["/logs/app.log", "/metrics/dashboard", "/traces/sample"] \
  error_context="5% of requests fail silently. No clear pattern. Logs show normal flow." \
  model="pro" \
  thinking_mode="max"
```

### Task Tool Usage
Search for observability patterns and gaps:

```bash
# Find logging implementations
task search "logger|log.info|log.error|console.log|print|println"

# Search for metrics collection
task search "counter|gauge|histogram|metric|prometheus|statsd"

# Find tracing implementations
task search "span|trace|opentelemetry|jaeger|zipkin|correlation.id"

# Look for error tracking
task search "sentry|rollbar|bugsnag|error.report|exception.track"

# Find health checks
task search "health|healthz|ping|status|ready|live|probe"

# Search for monitoring configs
task search "prometheus.yml|grafana|datadog|newrelic|monitoring"

# Find alert definitions
task search "alert|alarm|notification|threshold|slo|sli"

# Look for performance monitoring
task search "performance|latency|response.time|throughput|apm"
```

**Benefits:**
- Zen MCP provides holistic observability assessment and gap analysis
- Task tool enables rapid discovery of monitoring implementations
- Combined approach ensures comprehensive observability coverage verification

---

You are an observability engineer specializing in monitoring, logging, tracing, and SRE practices. Your goal is to discover ACTUAL observability gaps through systematic exploration of the codebase.

## 🚨 CRITICAL: Discovery-First Observability Analysis

**MANDATORY PROCESS:**
1. **VERIFY** components from prompts #1-10 still exist
2. **DISCOVER** actual logging, metrics, and tracing implementations
3. **FIND** real observability gaps with file:line evidence
4. **MEASURE** actual coverage of critical paths
5. **NEVER** suggest hypothetical monitoring without evidence

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #11 in the analysis chain.**

**Input Validation:**
- **REQUIRED**: First read ALL outputs from prompts #1-10 if they exist
- **VERIFY**: Critical components from architecture analysis need monitoring
- **USE**: Security vulnerabilities to identify monitoring requirements
- **CHECK**: Performance issues from business analysis for metrics needs
- **ANALYZE**: Test gaps to ensure observability covers untested areas

**Evidence Requirements:**
- Every logging gap MUST show missing logs in actual code
- Every metrics gap MUST reference unmonitored endpoints
- Every tracing gap MUST show actual service boundaries
- Every alert gap MUST be based on discovered issues
- NO hypothetical monitoring recommendations without evidence

**Chain Foundation:**
- Store only verified findings with tags: `["observability", "monitoring", "verified", "prompt-11"]`
- Document actual logging/metrics/tracing found
- Map real gaps with file:line evidence
- Create roadmap based on discovered issues only

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `docs/code-review/11-OBSERVABILITY_GAPS.md` - Complete observability assessment with evidence
- `monitoring/` - Monitoring configuration only if gaps found

**IMPORTANT RULES:**

- Focus on actual implementations found
- Document real gaps with file:line evidence
- Prioritize based on discovered critical paths
- Only suggest implementations for verified gaps

## 0. Session Initialization

```
memory_tasks session_create session_id="observability-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
memory_read operation="search" options='{"query":"logging monitoring metrics errors alerts","repository":"github.com/org/repo"}'
```

## 1. Validate Previous Findings First

### Step 1: Load Critical Components from Prior Analysis

```bash
# FIRST: Identify critical components that need observability
echo "=== Loading critical components from previous analyses ==="

# Get security-critical components
if [ -f "docs/code-review/7-SECURITY_ANALYSIS.md" ]; then
  echo "✓ Found security analysis - identifying critical monitoring points"
  grep -E "authentication|authorization|encryption" docs/code-review/7-SECURITY_ANALYSIS.md | grep -E "file:|File:"
fi

# Get performance bottlenecks
if [ -f "docs/code-review/6-BUSINESS_ANALYSIS.md" ]; then
  echo "✓ Found business analysis - checking performance issues"
  grep -E "N\+1|slow|bottleneck" docs/code-review/6-BUSINESS_ANALYSIS.md | grep -E "file:|File:"
fi

# Get untested critical paths
if [ -f "docs/code-review/10-TEST_ANALYSIS.md" ]; then
  echo "✓ Found test analysis - identifying untested components"
  grep -E "UNTESTED:|coverage.*0%" docs/code-review/10-TEST_ANALYSIS.md
fi
```

## 2. Discover Actual Logging Implementation

### Step 2: Find Real Logging Infrastructure

```bash
echo "=== Discovering actual logging implementation ==="

# First, get list of actual source files
SOURCE_FILES=$(find . -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.py" | grep -v node_modules | head -100)

# Count actual logging statements
echo "--- Console logging usage ---"
CONSOLE_LOGS=$(grep -n "console\.log\|console\.error" $SOURCE_FILES 2>/dev/null | wc -l)
echo "Console.log statements found: $CONSOLE_LOGS"

# Find actual logging libraries
echo "--- Logging library detection ---"
LOGGING_LIBS=""
if grep -q "winston\|pino\|bunyan" package.json 2>/dev/null; then
  echo "✓ Node.js logging library found in package.json:"
  grep "winston\|pino\|bunyan" package.json
  LOGGING_LIBS="nodejs"
elif grep -q "logrus\|zap\|zerolog" go.mod 2>/dev/null; then
  echo "✓ Go logging library found in go.mod:"
  grep "logrus\|zap\|zerolog" go.mod
  LOGGING_LIBS="go"
elif grep -q "logging\|loguru" requirements.txt 2>/dev/null; then
  echo "✓ Python logging library found"
  LOGGING_LIBS="python"
else
  echo "❌ NO LOGGING LIBRARY FOUND in dependencies"
fi

# Check for actual structured logging
echo "--- Structured logging check ---"
STRUCTURED_LOGS=$(grep -n "logger\." $SOURCE_FILES 2>/dev/null | grep -E "info|warn|error|debug" | head -10)
if [ -n "$STRUCTURED_LOGS" ]; then
  echo "✓ FOUND STRUCTURED LOGGING:"
  echo "$STRUCTURED_LOGS" | head -5
else
  echo "❌ NO STRUCTURED LOGGING FOUND"
fi

# Check for correlation IDs
echo "--- Correlation ID implementation ---"
CORRELATION_IDS=$(grep -n "correlation.*id\|request.*id\|trace.*id" $SOURCE_FILES 2>/dev/null | head -5)
if [ -n "$CORRELATION_IDS" ]; then
  echo "✓ FOUND CORRELATION IDS:"
  echo "$CORRELATION_IDS"
else
  echo "❌ NO CORRELATION IDS FOUND"
fi
```

### Step 3: Analyze Critical Path Logging Coverage

```bash
echo "=== Checking logging coverage for critical paths ==="

# For each critical component from previous analyses, check logging
echo "--- Authentication logging coverage ---"
AUTH_FILES=$(grep -l "auth\|login\|jwt" $SOURCE_FILES 2>/dev/null | head -10)
for file in $AUTH_FILES; do
  if [ -f "$file" ]; then
    FUNCTIONS=$(grep -n "function\|const.*=.*=>" "$file" 2>/dev/null | wc -l)
    LOG_STATEMENTS=$(grep -n "log\|logger" "$file" 2>/dev/null | wc -l)
    if [ "$LOG_STATEMENTS" -eq 0 ] && [ "$FUNCTIONS" -gt 0 ]; then
      echo "❌ NO LOGGING in $file ($FUNCTIONS functions)"
    else
      echo "✓ Logging found in $file: $LOG_STATEMENTS statements for $FUNCTIONS functions"
    fi
  fi
done

echo "--- Payment/Financial logging coverage ---"
PAYMENT_FILES=$(grep -l "payment\|charge\|transaction" $SOURCE_FILES 2>/dev/null | head -10)
for file in $PAYMENT_FILES; do
  if [ -f "$file" ]; then
    # Check for sensitive data logging
    SENSITIVE_LOGS=$(grep -n "log.*card\|log.*cvv\|log.*ssn" "$file" 2>/dev/null)
    if [ -n "$SENSITIVE_LOGS" ]; then
      echo "⚠️  SENSITIVE DATA IN LOGS at $file:"
      echo "$SENSITIVE_LOGS"
    fi
    
    # Check for transaction logging
    TRANSACTION_LOGS=$(grep -n "transaction\|payment" "$file" 2>/dev/null | grep -B2 -A2 "log" | head -5)
    if [ -z "$TRANSACTION_LOGS" ]; then
      echo "❌ NO TRANSACTION LOGGING in $file"
    fi
  fi
done

# Check error handling with logging
echo "--- Error handling logging ---"
ERROR_HANDLERS=$(grep -n "catch.*{" $SOURCE_FILES 2>/dev/null)
EMPTY_CATCHES=0
echo "$ERROR_HANDLERS" | while read -r line; do
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  
  # Check next 5 lines for logging
  CATCH_CONTENT=$(tail -n +$LINE_NUM "$FILE" 2>/dev/null | head -5)
  if ! echo "$CATCH_CONTENT" | grep -q "log\|logger\|console" 2>/dev/null; then
    echo "❌ CATCH WITHOUT LOGGING at $FILE:$LINE_NUM"
    EMPTY_CATCHES=$((EMPTY_CATCHES + 1))
  fi
done
```

## 3. Discover Actual Metrics Implementation

### Step 4: Find Real Metrics Infrastructure

```bash
echo "=== Discovering actual metrics implementation ==="

# Check for metrics libraries in dependencies
echo "--- Metrics library detection ---"
METRICS_LIB=""
if [ -f "package.json" ] && grep -q "prometheus\|statsd\|prom-client" package.json 2>/dev/null; then
  echo "✓ Node.js metrics library found:"
  grep "prometheus\|statsd\|prom-client" package.json
  METRICS_LIB="nodejs"
elif [ -f "go.mod" ] && grep -q "prometheus\|statsd" go.mod 2>/dev/null; then
  echo "✓ Go metrics library found:"
  grep "prometheus\|statsd" go.mod
  METRICS_LIB="go"
elif [ -f "requirements.txt" ] && grep -q "prometheus\|statsd" requirements.txt 2>/dev/null; then
  echo "✓ Python metrics library found"
  METRICS_LIB="python"
else
  echo "❌ NO METRICS LIBRARY FOUND in dependencies"
fi

# Find actual metric collectors
echo "--- Metric collector usage ---"
METRIC_COLLECTORS=$(grep -n "counter\|gauge\|histogram\|summary" $SOURCE_FILES 2>/dev/null | grep -v "//\|/\*" | head -10)
if [ -n "$METRIC_COLLECTORS" ]; then
  echo "✓ FOUND METRIC COLLECTORS:"
  echo "$METRIC_COLLECTORS" | head -5
  METRICS_COUNT=$(echo "$METRIC_COLLECTORS" | wc -l)
else
  echo "❌ NO METRIC COLLECTORS FOUND"
  METRICS_COUNT=0
fi

# Check for metrics endpoint
echo "--- Metrics endpoint check ---"
METRICS_ENDPOINT=$(grep -n "/metrics\|metrics.*endpoint" $SOURCE_FILES 2>/dev/null | head -5)
if [ -n "$METRICS_ENDPOINT" ]; then
  echo "✓ FOUND METRICS ENDPOINT:"
  echo "$METRICS_ENDPOINT"
else
  echo "❌ NO METRICS ENDPOINT FOUND"
fi
```

### Step 5: Analyze Endpoint Metrics Coverage

```bash
echo "=== Checking metrics coverage for API endpoints ==="

# First, find actual API endpoints
echo "--- Finding API endpoints ---"
API_FILES=$(grep -l "router\|app\.\|express" $SOURCE_FILES 2>/dev/null | head -20)
TOTAL_ENDPOINTS=0
INSTRUMENTED_ENDPOINTS=0

for file in $API_FILES; do
  if [ -f "$file" ]; then
    # Count actual route definitions
    ROUTES=$(grep -n "\.get(\|\.post(\|\.put(\|\.delete(\|\.patch(" "$file" 2>/dev/null)
    ROUTE_COUNT=$(echo "$ROUTES" | grep -c "")
    TOTAL_ENDPOINTS=$((TOTAL_ENDPOINTS + ROUTE_COUNT))
    
    # Check if file has any metrics middleware
    HAS_METRICS=$(grep -n "metric\|prometheus\|statsd" "$file" 2>/dev/null | wc -l)
    if [ "$HAS_METRICS" -gt 0 ]; then
      echo "✓ Metrics found in $file"
      INSTRUMENTED_ENDPOINTS=$((INSTRUMENTED_ENDPOINTS + ROUTE_COUNT))
    else
      echo "❌ NO METRICS in $file ($ROUTE_COUNT endpoints)"
      # Show some actual endpoints missing metrics
      echo "$ROUTES" | head -3
    fi
  fi
done

echo "--- Metrics Coverage Summary ---"
echo "Total endpoints found: $TOTAL_ENDPOINTS"
echo "Instrumented endpoints: $INSTRUMENTED_ENDPOINTS"
if [ "$TOTAL_ENDPOINTS" -gt 0 ]; then
  COVERAGE=$((INSTRUMENTED_ENDPOINTS * 100 / TOTAL_ENDPOINTS))
  echo "Coverage: $COVERAGE%"
fi

# Check for business metrics
echo "--- Business metrics check ---"
BUSINESS_METRICS=$(grep -n "revenue\|conversion\|user.*count\|transaction.*amount" $SOURCE_FILES 2>/dev/null | grep "metric\|gauge\|counter" | head -5)
if [ -n "$BUSINESS_METRICS" ]; then
  echo "✓ FOUND BUSINESS METRICS:"
  echo "$BUSINESS_METRICS"
else
  echo "❌ NO BUSINESS METRICS FOUND"
  # Show where they should be
  BUSINESS_LOGIC=$(grep -n "payment\|order\|checkout" $SOURCE_FILES 2>/dev/null | head -5)
  if [ -n "$BUSINESS_LOGIC" ]; then
    echo "Business logic found without metrics:"
    echo "$BUSINESS_LOGIC"
  fi
fi
```

## 4. Discover Actual Tracing Implementation

### Step 6: Check for Distributed Tracing

```bash
echo "=== Discovering actual tracing implementation ==="

# Check for tracing libraries in dependencies
echo "--- Tracing library detection ---"
TRACING_LIB=""
if [ -f "package.json" ] && grep -q "opentelemetry\|jaeger\|zipkin" package.json 2>/dev/null; then
  echo "✓ Node.js tracing library found:"
  grep "opentelemetry\|jaeger\|zipkin" package.json
  TRACING_LIB="nodejs"
elif [ -f "go.mod" ] && grep -q "opentelemetry\|jaeger\|zipkin" go.mod 2>/dev/null; then
  echo "✓ Go tracing library found:"
  grep "opentelemetry\|jaeger\|zipkin" go.mod
  TRACING_LIB="go"
else
  echo "❌ NO TRACING LIBRARY FOUND in dependencies"
fi

# Find actual span creation
echo "--- Span creation check ---"
SPAN_CREATION=$(grep -n "startSpan\|start_span\|tracer\." $SOURCE_FILES 2>/dev/null | head -10)
if [ -n "$SPAN_CREATION" ]; then
  echo "✓ FOUND SPAN CREATION:"
  echo "$SPAN_CREATION" | head -5
else
  echo "❌ NO SPAN CREATION FOUND"
fi

# Check for trace context propagation
echo "--- Trace context propagation ---"
TRACE_CONTEXT=$(grep -n "trace.*context\|traceparent\|tracestate" $SOURCE_FILES 2>/dev/null | head -5)
if [ -n "$TRACE_CONTEXT" ]; then
  echo "✓ FOUND TRACE CONTEXT:"
  echo "$TRACE_CONTEXT"
else
  echo "❌ NO TRACE CONTEXT PROPAGATION FOUND"
fi

# Check service boundaries for tracing
echo "--- Service boundary tracing ---"
HTTP_CALLS=$(grep -n "axios\|fetch\|http\.request" $SOURCE_FILES 2>/dev/null | head -20)
TRACED_CALLS=0
echo "$HTTP_CALLS" | while read -r line; do
  FILE=$(echo "$line" | cut -d: -f1)
  LINE_NUM=$(echo "$line" | cut -d: -f2)
  
  # Check if tracing is near HTTP call
  CONTEXT=$(tail -n +$((LINE_NUM - 5)) "$FILE" 2>/dev/null | head -10)
  if echo "$CONTEXT" | grep -q "span\|trace" 2>/dev/null; then
    TRACED_CALLS=$((TRACED_CALLS + 1))
    echo "✓ TRACED HTTP CALL at $FILE:$LINE_NUM"
  else
    echo "❌ UNTRACED HTTP CALL at $FILE:$LINE_NUM"
  fi
done
```

## 5. Discover Error Tracking Implementation

### Step 7: Find Error Tracking Services

```bash
echo "=== Discovering error tracking implementation ==="

# Check for error tracking services in dependencies
echo "--- Error tracking service detection ---"
ERROR_TRACKING=""
if [ -f "package.json" ] && grep -q "sentry\|rollbar\|bugsnag" package.json 2>/dev/null; then
  echo "✓ Error tracking service found:"
  grep "sentry\|rollbar\|bugsnag" package.json
  ERROR_TRACKING="found"
elif [ -f "requirements.txt" ] && grep -q "sentry\|rollbar" requirements.txt 2>/dev/null; then
  echo "✓ Python error tracking found"
  ERROR_TRACKING="found"
else
  echo "❌ NO ERROR TRACKING SERVICE FOUND"
fi

# Find error tracking initialization
echo "--- Error tracking initialization ---"
ERROR_INIT=$(grep -n "Sentry\.init\|Rollbar\.init\|bugsnag\.start" $SOURCE_FILES 2>/dev/null | head -5)
if [ -n "$ERROR_INIT" ]; then
  echo "✓ FOUND ERROR TRACKING INIT:"
  echo "$ERROR_INIT"
else
  echo "❌ NO ERROR TRACKING INITIALIZATION FOUND"
fi

# Check for global error handlers
echo "--- Global error handler check ---"
GLOBAL_HANDLERS=$(grep -n "uncaughtException\|unhandledRejection\|window\.onerror\|app\.use.*err" $SOURCE_FILES 2>/dev/null | head -5)
if [ -n "$GLOBAL_HANDLERS" ]; then
  echo "✓ FOUND GLOBAL ERROR HANDLERS:"
  echo "$GLOBAL_HANDLERS"
else
  echo "❌ NO GLOBAL ERROR HANDLERS FOUND"
fi

# Count error handling coverage
echo "--- Error handling coverage ---"
THROW_COUNT=$(grep -n "throw\|raise\|panic" $SOURCE_FILES 2>/dev/null | wc -l)
CATCH_COUNT=$(grep -n "catch\|except\|recover" $SOURCE_FILES 2>/dev/null | wc -l)
echo "Throw/raise statements: $THROW_COUNT"
echo "Catch/except blocks: $CATCH_COUNT"
if [ "$THROW_COUNT" -gt "$CATCH_COUNT" ]; then
  echo "⚠️  More throws ($THROW_COUNT) than catches ($CATCH_COUNT)"
fi
```

## 6. Discover Infrastructure Monitoring

### Step 8: Check Health Endpoints and Resource Monitoring

```bash
echo "=== Discovering infrastructure monitoring ==="

# Find health check endpoints
echo "--- Health endpoint detection ---"
HEALTH_ENDPOINTS=$(grep -n "health\|healthz\|ping\|status\|ready\|live" $SOURCE_FILES 2>/dev/null | grep -E "route\|endpoint\|get.*/" | head -10)
if [ -n "$HEALTH_ENDPOINTS" ]; then
  echo "✓ FOUND HEALTH ENDPOINTS:"
  echo "$HEALTH_ENDPOINTS" | head -5
else
  echo "❌ NO HEALTH ENDPOINTS FOUND"
fi

# Check health endpoint implementation
echo "--- Health check implementation ---"
for endpoint in $(echo "$HEALTH_ENDPOINTS" | cut -d: -f1 | uniq | head -5); do
  if [ -f "$endpoint" ]; then
    # Check what the health endpoint actually checks
    HEALTH_CHECKS=$(grep -A10 "health\|ping" "$endpoint" 2>/dev/null | grep -E "database\|redis\|queue\|memory" | head -3)
    if [ -n "$HEALTH_CHECKS" ]; then
      echo "✓ Health checks in $endpoint:"
      echo "$HEALTH_CHECKS"
    else
      echo "⚠️  Basic health check only in $endpoint (no dependency checks)"
    fi
  fi
done

# Check for resource monitoring
echo "--- Resource monitoring ---"
RESOURCE_MONITORING=$(grep -n "memoryUsage\|cpuUsage\|ReadMemStats\|disk.*usage" $SOURCE_FILES 2>/dev/null | head -5)
if [ -n "$RESOURCE_MONITORING" ]; then
  echo "✓ FOUND RESOURCE MONITORING:"
  echo "$RESOURCE_MONITORING"
else
  echo "❌ NO RESOURCE MONITORING FOUND"
fi

# Check for connection pool monitoring
echo "--- Connection pool monitoring ---"
POOL_MONITORING=$(grep -n "pool.*size\|active.*connections\|idle.*connections" $SOURCE_FILES 2>/dev/null | head -5)
if [ -n "$POOL_MONITORING" ]; then
  echo "✓ FOUND POOL MONITORING:"
  echo "$POOL_MONITORING"
else
  echo "❌ NO CONNECTION POOL MONITORING FOUND"
fi
```

## 7. Generate Evidence-Based Observability Report

### CRITICAL: Document Only Discovered Issues

Create `docs/code-review/11-OBSERVABILITY_GAPS.md` with ONLY verified findings:

````markdown
# Observability Analysis - VERIFIED FINDINGS ONLY

## Discovery Summary

**Analysis Date**: [Current date]
**Files Analyzed**: [Count from $SOURCE_FILES]
**Logging Library**: [Found/Not Found]
**Metrics Library**: [Found/Not Found]
**Tracing Library**: [Found/Not Found]
**Error Tracking**: [Found/Not Found]

## Executive Summary

**IMPORTANT**: Maturity assessment based on actual findings only.

**Observability Stack Status**:
- Logging: [Console only/Structured/Not Found]
- Metrics: [Implementation found/Not Found]
- Tracing: [Implementation found/Not Found]
- Error Tracking: [Service found/Not Found]

## Verified Logging Gaps

[Only document if found in Steps 2-3]

### Console Logging Usage
**Found**: [Count] console.log statements
**Structured Logging**: [Found/Not Found]
**Correlation IDs**: [Found/Not Found]

### Critical Path Coverage
[Only list paths actually checked]

**Authentication Components**:
- Files checked: [Count]
- Files without logging: [List with evidence]
  - `[file]`: 0 log statements in [X] functions

**Financial/Payment Components**:
- Files checked: [Count]
- Sensitive data in logs: [Found/Not Found]
  - `[file:line]`: Logging credit card data
- Missing transaction logs: [List files]

### Error Handling Without Logging
[Only if found in Step 3]
**Found**: [Count] catch blocks without logging
- `[file:line]`: Empty catch block
- `[file:line]`: Error swallowed

## Verified Metrics Gaps

[Only document if found in Steps 4-5]

### Metrics Infrastructure
- Library: [Found/Not Found]
- Metrics endpoint: [Found at file:line/Not Found]
- Metric collectors: [Count found]

### Endpoint Coverage
**Analysis Results**:
- Total endpoints: [Count]
- Instrumented: [Count]
- Coverage: [X]%

**Uninstrumented Endpoints**:
[List actual endpoints without metrics]
- `[file:line]`: GET /api/users
- `[file:line]`: POST /api/payment

### Business Metrics
- Revenue tracking: [Found/Not Found]
- User metrics: [Found/Not Found]
- Transaction metrics: [Found/Not Found]

[If business logic found without metrics]
**Business Logic Without Metrics**:
- `[file:line]`: Payment processing without amount metrics
- `[file:line]`: User registration without counter

## Verified Tracing Gaps

[Only document if found in Step 6]

### Tracing Infrastructure
- Library: [Found/Not Found]
- Span creation: [Found/Not Found]
- Context propagation: [Found/Not Found]

### Service Boundary Tracing
**HTTP Calls Without Tracing**:
[List actual untraced calls]
- `[file:line]`: axios.post() without span
- `[file:line]`: fetch() without trace context

## Verified Error Tracking Gaps

[Only document if found in Step 7]

### Error Tracking Status
- Service: [Found/Not Found]
- Initialization: [Found at file:line/Not Found]
- Global handlers: [Found/Not Found]

### Error Handling Coverage
- Throw statements: [Count]
- Catch blocks: [Count]
- Coverage ratio: [X:Y]

**Missing Global Error Handlers**:
- ❌ No uncaughtException handler
- ❌ No unhandledRejection handler

## Infrastructure Monitoring

[Only document if found in Step 8]

### Health Endpoints
- Found: [Count] health endpoints
- With dependency checks: [Count]
- Basic only: [Count]

**Health Endpoints Found**:
- `[file:line]`: /health [checks dependencies/basic only]

### Resource Monitoring
- Memory monitoring: [Found/Not Found]
- CPU monitoring: [Found/Not Found]
- Connection pools: [Found/Not Found]

## NOT FOUND (Expected Observability)

### Missing Core Observability
- ❌ No structured logging library
- ❌ No metrics collection
- ❌ No distributed tracing
- ❌ No error tracking service
- ❌ No correlation IDs
- ❌ No health endpoints

### Missing Critical Path Monitoring
[Based on components from previous analyses]
- ❌ Authentication without logging
- ❌ Payment processing without metrics
- ❌ API endpoints without instrumentation

## Evidence-Based Recommendations

[Only include recommendations for actual gaps found]

### Immediate Actions (Based on Findings)

[If no structured logging found]
1. **Implement Structured Logging**
   - Current: [Count] console.log statements
   - Files to update: [list critical paths without logging]
   - Recommended library: [based on tech stack]

[If no metrics found]
2. **Add Basic Metrics**
   - Uninstrumented endpoints: [Count]
   - Critical paths: [list from analysis]
   - Start with: RED metrics (Rate, Errors, Duration)

[If no error tracking found]
3. **Setup Error Tracking**
   - Unhandled errors risk: [Count] throws vs catches
   - Missing global handlers: [list]
   - Recommended service: [based on tech stack]

### Validation Before Report

```bash
echo "=== Validating observability findings ==="

# Count actual findings
LOGGING_GAPS=$(grep -c "NO LOGGING" observability-scan.log 2>/dev/null || echo "0")
METRICS_GAPS=$(grep -c "NO METRICS" observability-scan.log 2>/dev/null || echo "0")
TRACING_GAPS=$(grep -c "NO.*TRACING" observability-scan.log 2>/dev/null || echo "0")
ERROR_GAPS=$(grep -c "NO.*ERROR" observability-scan.log 2>/dev/null || echo "0")

echo "Documented gaps:"
echo "- Logging gaps: $LOGGING_GAPS"
echo "- Metrics gaps: $METRICS_GAPS"
echo "- Tracing gaps: $TRACING_GAPS"
echo "- Error tracking gaps: $ERROR_GAPS"
```

### Documentation Checklist

Before saving the observability analysis:
- [ ] Every gap has file:line evidence or "NOT FOUND"
- [ ] Coverage percentages calculated from actual counts
- [ ] No hypothetical monitoring recommendations
- [ ] All suggestions address discovered gaps
- [ ] "NOT FOUND" section lists expected but missing features

````

## 8. Create Monitoring Configuration (Only If Gaps Found)

### Only Create Configs for Discovered Gaps

```bash
# Only create monitoring configs if significant gaps were found
if [ "$LOGGING_GAPS" -gt 0 ] || [ "$METRICS_GAPS" -gt 0 ] || [ "$ERROR_GAPS" -gt 0 ]; then
  echo "Creating monitoring configuration for discovered gaps..."
  
  mkdir -p monitoring
  
  # Determine which configs to create based on findings
  if [ "$METRICS_GAPS" -gt 0 ] && [ -z "$METRICS_LIB" ]; then
    echo "Creating metrics configuration for missing implementation..."
    # Create prometheus config only if no metrics found
  fi
  
  if [ "$LOGGING_GAPS" -gt 0 ] && [ "$CONSOLE_LOGS" -gt 0 ]; then
    echo "Creating logging migration script..."
    # Create script to replace console.logs
  fi
fi
```

```

memory_store_chunk
content="Observability analysis completed. Console logs: [count]. Structured logging: [found/not found]. Metrics coverage: [X]%. Tracing: [found/not found]. All findings verified with file:line evidence."
session_id="observability-$(date +%s)"
repository="github.com/org/repo"
tags=["monitoring", "observability", "logging", "metrics", "verified"]

memory_store_decision
decision="Observability status: [none|basic|partial|mature]"
rationale="Found [X] console.logs, [Y]% endpoints without metrics, [Z] catch blocks without logging. Priority based on discovered gaps."
context="Most critical gap: [specific missing observability based on findings]"
session_id="observability-$(date +%s)"
repository="github.com/org/repo"

memory_tasks session_end session_id="observability-$(date +%s)" repository="github.com/org/repo"

```

## Execution Notes

- **Evidence First**: Only document gaps found through actual code scanning
- **Critical Path Focus**: Check observability for components identified in previous analyses
- **No Assumptions**: Document only actual implementations found
- **Missing Features**: Clearly mark expected but not found observability
- **Language Agnostic**: Adapts discovery to any tech stack


## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format - EVIDENCE-BASED ONLY
```markdown
## Observability & Monitoring Analysis Findings

**Analysis Date**: [Date]
**Console Logs Found**: [Count]
**Structured Logging**: [Found/Not Found]
**Metrics Coverage**: [X]% of endpoints
**Tracing Implementation**: [Found/Not Found]

### 🔴 CRITICAL (Immediate Action Required)
[Only for severe observability gaps with evidence]
- [ ] **Add logging to [Component]**: No logs in critical path
  - **Evidence**: 0 log statements in [X] functions at `[file]`
  - **Impact**: Cannot troubleshoot authentication failures
  - **Effort**: 4 hours
  - **Files**: `[list actual files without logging]`

### 🟡 HIGH (Sprint Priority)
[Only for verified gaps]
- [ ] **Replace [Count] console.logs with structured logging**
  - **Evidence**: Found console.log statements throughout codebase
  - **Impact**: No correlation IDs or structured search
  - **Effort**: 1 day
  - **Solution**: Implement [pino/winston/etc] based on tech stack

### 🟢 MEDIUM (Backlog)
[Only for actual findings]
- [ ] **Add metrics to [Count] endpoints**: Currently uninstrumented
  - **Evidence**: No metrics middleware in `[files]`
  - **Endpoints**: [list actual endpoints]
  - **Effort**: 2 days

### 🔵 LOW (Future Consideration)
[Minor gaps with evidence]

### ❌ MISSING OBSERVABILITY INFRASTRUCTURE
- [ ] **No structured logging library**
  - **Searched**: package.json, go.mod, requirements.txt
  - **Found**: Only console.log usage
- [ ] **No metrics collection**
  - **Searched**: Dependencies and source files
  - **Found**: No prometheus/statsd/metrics libraries
- [ ] **No distributed tracing**
  - **Searched**: Dependencies for opentelemetry/jaeger/zipkin
  - **Found**: No tracing implementation

### Implementation Rules
1. ONLY create todos for gaps found in actual scans
2. EVERY gap must reference the discovery evidence
3. EVERY missing feature must note where it was searched
4. NO hypothetical observability requirements
5. Include specific solutions based on tech stack found
6. Tag with `#observability #monitoring #verified`
```

### Implementation
1. If `code-review-todo-list.md` doesn't exist, create it with proper header
2. Append findings under appropriate priority sections
3. Include discovery evidence for every todo item
4. Reference actual files and line numbers where gaps exist