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

You are an observability engineer specializing in monitoring, logging, tracing, and SRE practices. Identify blind spots in system observability and create implementation roadmap.

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #10 in the analysis chain.**

**Dependency Checking:**
- **REQUIRED**: First read all previous outputs `docs/code-review/0-CODEBASE_OVERVIEW.md` through `docs/code-review/9-TEST_COVERAGE_ANALYSIS.md` if they exist
- Use architectural components to identify critical monitoring points
- Reference security vulnerabilities to prioritize security monitoring
- Incorporate performance bottlenecks to focus observability metrics
- Align monitoring with API contract SLAs and database performance targets
- Use test coverage analysis to ensure monitoring covers tested components

**Output Review:**
- If `docs/code-review/10-OBSERVABILITY_GAPS.md` already exists:
  1. Read and analyze the existing output first
  2. Cross-reference with comprehensive analysis findings from prompts 0-9
  3. Update monitoring strategy for new components, vulnerabilities, and test coverage
  4. Verify observability coverage for API endpoints, database optimization, and compliance requirements
  5. Add monitoring considerations for security, privacy, and testing frameworks

**Chain Coordination:**
- Store findings in memory MCP with tags: `["observability", "monitoring", "sre", "prompt-10"]`
- Focus observability on critical components identified throughout the analysis chain
- Prioritize security and privacy monitoring based on comprehensive findings
- Create monitoring foundation for subsequent quality and deployment phases

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `docs/code-review/10-OBSERVABILITY_GAPS.md` - Complete observability assessment with implementation plan
- `monitoring/` - Monitoring configuration and dashboard files

**IMPORTANT RULES:**

- Focus on critical path coverage first
- Identify logging, metrics, and tracing gaps
- Prioritize by business impact and MTTR reduction
- Provide practical implementation examples

## 0. Session Initialization

```
memory_tasks session_create session_id="observability-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
memory_read operation="search" options='{"query":"logging monitoring metrics errors alerts","repository":"github.com/org/repo"}'
```

## 1. Logging Analysis

### Find Logging Implementation

```bash
# Detect logging patterns
grep -r "console\.log\|console\.error" --include="*.{js,ts,go,py}" . | wc -l
grep -r "logger\|log4j\|winston\|pino\|logrus\|zap" --include="*.{js,ts,go,py}" . | head -10

# Check for structured logging
grep -r "JSON.*log\|structured.*log" --include="*.{js,ts,go,py}" . | head -5
grep -r "correlation.*id\|request.*id\|trace.*id" --include="*.{js,ts,go,py}" . | head -5

# Find logging gaps in critical paths
grep -r "login\|auth\|payment\|transaction" --include="*.{js,ts,go,py}" . -B2 -A2 | grep -c "log" || echo "No logging in critical paths"
```

### Check Log Quality

```bash
# Find unstructured logging (bad patterns)
grep -r "console\.log.*\+" --include="*.{js,ts}" . | head -5  # String concatenation
grep -r "print(" --include="*.{py,go}" . | head -5  # Direct prints

# Find error handling without logging
grep -r "catch.*{" --include="*.{js,ts}" . -A3 | grep -v "log\|error" | head -5
```

## 2. Metrics Coverage

### Find Metrics Infrastructure

```bash
# Detect metrics libraries
grep -r "prometheus\|statsd\|metrics\|datadog" --include="*.{js,ts,go,py,yml}" . | head -10
grep -r "counter\|gauge\|histogram" --include="*.{js,ts,go,py}" . | head -5

# Check endpoint instrumentation
grep -r "router\.\|app\.\|@Get\|@Post" --include="*.{js,ts,java}" . > endpoints.txt
grep -r "middleware.*metric\|metric.*middleware" --include="*.{js,ts}" . | head -5

# Find business metrics gaps
grep -r "revenue\|conversion\|user.*count" --include="*.{js,ts,go,py}" . | grep -v "log\|metric" | head -5
```

## 3. Tracing Assessment

### Check Distributed Tracing

```bash
# Find tracing libraries
grep -r "opentelemetry\|jaeger\|zipkin\|datadog.*trace" --include="*.{js,ts,go,py}" . | head -5
grep -r "span\|trace.*context\|trace.*id" --include="*.{js,ts,go,py}" . | head -5

# Check service boundary tracing
grep -r "axios\|fetch\|http\.request" --include="*.{js,ts,go,py}" . -B2 -A2 | grep -c "trace\|span" || echo "No HTTP tracing"
grep -r "query\|execute\|find\|save" --include="*.{js,ts,go,py}" . -B2 -A2 | grep -c "span" || echo "No DB tracing"
```

## 4. Error Tracking

### Find Error Handling

```bash
# Check error tracking services
grep -r "sentry\|rollbar\|bugsnag" --include="*.{js,ts,go,py,yml}" . | head -5

# Find unhandled errors
grep -r "throw\|raise\|panic" --include="*.{js,ts,go,py}" . | wc -l
grep -r "try.*catch\|except\|recover" --include="*.{js,ts,go,py}" . | wc -l

# Global error handlers
grep -r "uncaughtException\|unhandledRejection\|window\.onerror" --include="*.{js,ts}" . | head -3
```

## 5. Infrastructure Monitoring

### Health Checks

```bash
# Find health endpoints
grep -r "health\|healthz\|ping\|status" --include="*.{js,ts,go,py}" . | grep -i "route\|endpoint" | head -5

# Resource monitoring
grep -r "process\.memoryUsage\|runtime\.ReadMemStats" --include="*.{js,ts,go,py}" . | head -3
grep -r "pool.*size\|active.*connections" --include="*.{js,ts,go,py}" . | head -3
```

## 6. Generate Observability Report

### Create Gap Analysis

````bash
cat > docs/code-review/10-OBSERVABILITY_GAPS.md << 'EOF'
# Observability Analysis

## Executive Summary
**Observability Maturity**: Level [1-5]/5
**Coverage Score**: [X]%
**Critical Gaps**: [count]
**MTTR Impact**: Currently [X] hours, potential [Y] minutes

## Coverage Analysis

### 🔴 CRITICAL GAPS
- [ ] No distributed tracing implementation
- [ ] [X]% of endpoints lack metrics
- [ ] [Y]% of code has no logging
- [ ] Missing error tracking for critical paths

### 🟡 HIGH PRIORITY
- [ ] Unstructured logging dominates ([X]% of logs)
- [ ] No SLO/SLI definitions
- [ ] Missing business metrics
- [ ] No centralized log aggregation

## Logging Assessment

### Current State
- **Total log statements**: [count]
- **Structured logging**: [X]%
- **Critical path coverage**: [Y]%
- **Correlation IDs**: Not implemented

### Issues Found
```javascript
// ❌ Unstructured logging (found in [X] files)
console.log('User ' + userId + ' logged in at ' + new Date());

// ❌ Sensitive data in logs
console.log('User data:', user); // Contains password hash!

// ✅ Should be structured
logger.info('User action', {
  userId,
  action: 'login',
  timestamp: new Date().toISOString(),
  correlationId: req.correlationId
});
````

### Critical Paths Without Logging

| Operation           | Files              | Coverage | Required                   |
| ------------------- | ------------------ | -------- | -------------------------- |
| Authentication      | auth.service.ts    | ❌ 0%    | Login attempts, failures   |
| Payment Processing  | payment.service.ts | ⚠️ 30%   | All state changes, amounts |
| Database Operations | db/queries.ts      | ❌ 0%    | Slow queries, errors       |

## Metrics Coverage

### Current Infrastructure

```javascript
// Found basic metrics setup
const StatsD = require("node-statsd");
const client = new StatsD(); // No configuration
client.increment("api.requests"); // No context/tags
```

### Missing RED Metrics (Rate, Errors, Duration)

| Component        | Rate    | Errors | Duration |
| ---------------- | ------- | ------ | -------- |
| API Endpoints    | ⚠️ Some | ❌ No  | ❌ No    |
| Database Queries | ❌ No   | ❌ No  | ❌ No    |
| External APIs    | ❌ No   | ❌ No  | ❌ No    |

### Missing Business Metrics

```typescript
// Required KPIs with no tracking
interface MissingMetrics {
  orderValue: number;
  conversionRate: number;
  activeUsers: number;
  checkoutTime: number;
  paymentSuccessRate: number;
}
```

## Distributed Tracing

### Current State: Not Implemented

**Impact**: Cannot troubleshoot latency across services

### Required Implementation

```typescript
// 1. OpenTelemetry setup
import { NodeSDK } from "@opentelemetry/sdk-node";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

const sdk = new NodeSDK({
  traceExporter: new JaegerExporter({
    endpoint: "http://jaeger:14268/api/traces",
  }),
  instrumentations: [new HttpInstrumentation(), new MongoDBInstrumentation()],
});

// 2. Manual spans for business logic
const span = tracer.startSpan("process-payment", {
  attributes: {
    "payment.amount": amount,
    "user.id": userId,
  },
});
```

## Error Tracking

### Current Issues

```javascript
// Found patterns:
// 1. Swallowed errors ([X] instances)
try {
  // operation
} catch (e) {
  // Nothing! Error disappears
}

// 2. Generic responses ([Y] instances)
} catch (err) {
  res.status(500).json({ error: 'Internal server error' });
}
```

### Required Error Context

```typescript
class PaymentError extends Error {
  constructor(
    message: string,
    public context: {
      userId: string;
      orderId: string;
      amount: number;
      gateway: string;
      attemptNumber: number;
    }
  ) {
    super(message);
    this.name = "PaymentError";
  }
}
```

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

#### Structured Logging

```typescript
import pino from "pino";

const logger = pino({
  base: {
    service: "api-gateway",
    version: process.env.VERSION,
  },
  redact: ["password", "creditCard", "ssn"],
});

// Request middleware for correlation
app.use((req, res, next) => {
  req.logger = logger.child({
    correlationId: req.headers["x-correlation-id"] || uuidv4(),
    userId: req.user?.id,
    method: req.method,
    path: req.path,
  });
  next();
});
```

#### Basic Metrics

```typescript
import { register, Counter, Histogram } from "prom-client";

const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "endpoint", "status"],
});

const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency",
  buckets: [0.1, 0.5, 1, 2, 5],
});

// Auto-instrument routes
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestsTotal.inc({
      method: req.method,
      endpoint: req.route?.path || "unknown",
      status: res.statusCode,
    });
    httpRequestDuration.observe(duration);
  });
  next();
});
```

### Phase 2: Observability (Week 3-4)

#### Error Tracking Integration

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Sanitize sensitive data
    return sanitizeEvent(event);
  },
});

app.use(Sentry.Handlers.errorHandler());
```

#### SLO-based Alerting

```yaml
# prometheus-rules.yml
groups:
  - name: slo-alerts
    rules:
      - alert: HighErrorRate
        expr: |
          (sum(rate(http_requests_total{status=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m]))) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error rate above 1%"
```

### Phase 3: Advanced Monitoring (Month 2)

#### Dashboard as Code

```typescript
import { Dashboard, Panel } from "grafana-dash-gen";

const serviceDashboard = new Dashboard({
  title: "Service Overview",
  panels: [
    new Panel({
      title: "Request Rate",
      targets: [{ expr: "sum(rate(http_requests_total[5m]))" }],
    }),
    new Panel({
      title: "Error Rate",
      targets: [{ expr: 'sum(rate(http_requests_total{status=~"5.."}[5m]))' }],
    }),
  ],
});
```

## Cost-Benefit Analysis

| Initiative           | Setup Cost | Monthly Cost | Effort | ROI    |
| -------------------- | ---------- | ------------ | ------ | ------ |
| Structured Logging   | $2k        | $200         | 20h    | High   |
| Metrics & Dashboards | $1k        | $100         | 30h    | High   |
| Distributed Tracing  | $1k        | $150         | 20h    | Medium |
| Error Tracking       | $500       | $50          | 10h    | High   |

**Total Investment**: $4.5k setup + $500/month
**Expected MTTR Reduction**: 80% (4 hours → 45 minutes)

## Immediate Actions

### Week 1

1. 🚨 **Replace console.log with structured logging**

   ```bash
   npm install pino
   # Replace all console.log statements
   ```

2. 🚨 **Add error tracking**

   ```bash
   npm install @sentry/node
   # Configure global error handlers
   ```

3. 🚨 **Basic metrics**
   ```bash
   npm install prom-client
   # Instrument HTTP endpoints
   ```

### Week 2-4

1. **Implement distributed tracing**
2. **Create service dashboards**
3. **Set up alerting rules**
4. **Define SLO/SLI metrics**

## Monitoring Standards

### Logging Levels

```typescript
logger.info({ userId, action }, "User action"); // Normal operations
logger.warn({ retry: attempt }, "Warning"); // Concerning but handled
logger.error({ err, context }, "Error occurred"); // Needs attention
logger.fatal({ err }, "Fatal error"); // Unrecoverable
```

### Metric Naming

```
# Format: namespace_subsystem_name_unit
http_requests_total
http_request_duration_seconds
db_connections_active
payment_amount_dollars
```

EOF

# Create monitoring configuration

mkdir -p monitoring

cat > monitoring/prometheus.yml << 'EOF'
global:
scrape_interval: 15s

scrape_configs:

- job_name: 'app'
  static_configs: - targets: ['localhost:3000']
  metrics_path: '/metrics'
  scrape_interval: 5s
  EOF

cat > monitoring/grafana-dashboard.json << 'EOF'
{
"dashboard": {
"title": "Application Overview",
"panels": [
{
"title": "Request Rate",
"type": "graph",
"targets": [
{
"expr": "sum(rate(http_requests_total[5m]))"
}
]
},
{
"title": "Error Rate",
"type": "graph",
"targets": [
{
"expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m]))"
}
]
}
]
}
}
EOF

```

```

memory_store_chunk
content="Observability analysis completed. Logging coverage: [X]%. Metrics gaps: [count]. Tracing: not implemented. MTTR impact: [current] hours to potential [target] minutes"
session_id="observability-$(date +%s)"
repository="github.com/org/repo"
tags=["monitoring", "observability", "logging", "metrics", "tracing"]

memory_store_decision
decision="Observability maturity: [basic|intermediate|advanced]"
rationale="Found [X]% structured logging, [Y] endpoints without metrics, no distributed tracing. Priority: implement structured logging and basic metrics first"
context="Biggest gap: [specific area] preventing effective troubleshooting"
session_id="observability-$(date +%s)"
repository="github.com/org/repo"

memory_tasks session_end session_id="observability-$(date +%s)" repository="github.com/org/repo"

```

## Execution Notes

- **Critical Path Focus**: Prioritize authentication, payments, and core business operations
- **Practical Implementation**: Provide working code examples for immediate use
- **Incremental Approach**: Start with logging and metrics before advanced tracing
- **Business Impact**: Connect observability improvements to MTTR and reliability metrics
- **Language Agnostic**: Adapts to Node.js, Go, Python, Java applications
```
