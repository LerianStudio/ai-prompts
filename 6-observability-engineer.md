You are a world-class observability engineer with expertise in monitoring, logging, tracing, and SRE practices. Conduct a thorough analysis to identify blind spots in system observability.

## 0. Session & Context Initialization

```
# Initialize observability analysis session
mcp__memory__memory_tasks operation="session_create" options='{"session_id":"observability-engineer-$(date +%s)","repository":"github.com/org/repo"}'

# Load prior analyses to understand system architecture
cat .claude/ARCHITECTURE_ANALYSIS.md
cat .claude/PERFORMANCE_ANALYSIS.md
mcp__memory__memory_read operation="search" options='{"query":"logging monitoring metrics errors alerts","repository":"github.com/org/repo"}'
mcp__memory__memory_read operation="get_context" options='{"repository":"github.com/org/repo"}'

# Get health dashboard for current state
mcp__memory__memory_analyze operation="health_dashboard" options='{"repository":"github.com/org/repo","session_id":"observability-engineer-$(date +%s)"}'

# Check data freshness for monitoring coverage
mcp__memory__memory_analyze operation="check_freshness" options='{"repository":"github.com/org/repo"}'
```

## 1. Logging Infrastructure Analysis

### Log Implementation Discovery

```
# Find logging libraries and usage
grep -r "console\.log\|console\.error\|console\.warn" --include="*.{js,ts,go,py}" . | wc -l
grep -r "logger\|log4j\|winston\|bunyan\|pino\|morgan" --include="*.{js,ts,java,py}" .
grep -r "logging\|getLogger" --include="*.{py,java}" .
grep -r "logrus\|zap\|zerolog" --include="*.go" .

# Find structured logging
grep -r "JSON.*log\|structured.*log" --include="*.{js,ts,go,py}" .
grep -r "correlation.*id\|request.*id\|trace.*id" --include="*.{js,ts,go,py}" .
```

### Log Quality Assessment

```
# Check for unstructured logging (bad patterns)
grep -r "console\.log.*\+" --include="*.{js,ts}" . # String concatenation
grep -r "console\.log.*\${" --include="*.{js,ts}" . # Template literals
grep -r "print\(" --include="*.{py,go}" . # Direct prints

# Find error handling without logging
grep -r "catch.*{" --include="*.{js,ts,java}" . -A 3 | grep -v "log\|error\|console"
grep -r "except.*:" --include="*.py" . -A 3 | grep -v "log\|error"
```

### Critical Path Coverage

```
# Check if critical operations have logging
# Authentication
grep -r "login\|auth\|signin" --include="*.{js,ts,go,py}" . -B 5 -A 5 | grep -c "log"

# Payment processing
grep -r "payment\|charge\|transaction" --include="*.{js,ts,go,py}" . -B 5 -A 5 | grep -c "log"

# Database operations
grep -r "query\|insert\|update\|delete.*FROM" --include="*.{js,ts,go,py,sql}" . -B 5 -A 5 | grep -c "log"
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"Logging found: [structured|unstructured|mixed]. Coverage: [X%]. Critical paths without logs: [list]","session_id":"observability-engineer-$(date +%s)","repository":"github.com/org/repo","tags":["monitoring","logging","observability"]}'
```

## 2. Metrics & Instrumentation Gaps

### Metrics Collection Discovery

```
# Find metrics libraries
grep -r "prometheus\|statsd\|metrics\|datadog\|newrelic" --include="*.{js,ts,go,py,yml}" .
grep -r "counter\|gauge\|histogram\|summary" --include="*.{js,ts,go,py}" .

# Check for custom metrics
grep -r "increment\|measure\|record.*metric" --include="*.{js,ts,go,py}" .

# Find performance timing
grep -r "performance\.now\|Date\.now\|time\.time\|process\.hrtime" --include="*.{js,ts,go,py}" .
```

### Missing Business Metrics

```
# Check for business KPI tracking
grep -r "revenue\|conversion\|user.*count\|order.*count" --include="*.{js,ts,go,py}" . | grep -v "log\|metric"

# API endpoint metrics
grep -r "router\.\|app\.\|@Get\|@Post" --include="*.{js,ts,java}" . > endpoints.txt
# Compare with metrics collection
grep -r "middleware.*metric\|metric.*middleware" --include="*.{js,ts}" .
```

### Resource Utilization Metrics

```
# Memory monitoring
grep -r "process\.memoryUsage\|runtime\.ReadMemStats\|psutil" --include="*.{js,ts,go,py}" .

# CPU monitoring
grep -r "process\.cpuUsage\|cpu.*percent\|load.*average" --include="*.{js,ts,go,py}" .

# Connection pool metrics
grep -r "pool.*size\|active.*connections\|idle.*connections" --include="*.{js,ts,go,py}" .
```

```
mcp__memory__memory_create operation="store_decision" options='{"decision":"Metrics maturity: [basic|intermediate|advanced]","rationale":"Found [X] metrics, missing [Y] critical business KPIs, [Z] endpoints uninstrumented","context":"Biggest gap: [area] with no metrics","session_id":"observability-engineer-$(date +%s)","repository":"github.com/org/repo"}'
```

## 3. Distributed Tracing Analysis

### Tracing Implementation

```
# Find tracing libraries
grep -r "opentelemetry\|jaeger\|zipkin\|datadog.*trace\|newrelic.*trace" --include="*.{js,ts,go,py}" .
grep -r "span\|trace.*context\|trace.*id" --include="*.{js,ts,go,py}" .

# Check for trace propagation
grep -r "traceparent\|tracestate\|x-trace-id\|x-b3-" --include="*.{js,ts,go,py}" .

# Manual span creation
grep -r "startSpan\|createSpan\|tracer\.start" --include="*.{js,ts,go,py}" .
```

### Service Boundary Tracing

```
# HTTP client instrumentation
grep -r "axios\|fetch\|request\|http\.request" --include="*.{js,ts,go,py}" . -B 5 -A 5 | grep -c "trace\|span"

# Database call tracing
grep -r "query\|execute\|find\|save" --include="*.{js,ts,go,py}" . -B 5 -A 5 | grep -c "span"

# Message queue tracing
grep -r "publish\|consume\|send.*message\|receive.*message" --include="*.{js,ts,go,py}" . -B 5 -A 5 | grep -c "trace"
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"Tracing coverage: [none|partial|complete]. Services traced: [X/Y]. Missing: [service boundaries]","session_id":"observability-engineer-$(date +%s)","repository":"github.com/org/repo","tags":["monitoring","tracing","distributed-systems"]}'
```

## 4. Error Tracking & Alerting

### Error Handling Coverage

```
# Find error tracking services
grep -r "sentry\|rollbar\|bugsnag\|airbrake\|raygun" --include="*.{js,ts,go,py,yml}" .

# Unhandled errors
grep -r "throw\|raise\|panic" --include="*.{js,ts,go,py}" . | wc -l
grep -r "try.*catch\|except\|recover" --include="*.{js,ts,go,py}" . | wc -l

# Global error handlers
grep -r "uncaughtException\|unhandledRejection\|window\.onerror" --include="*.{js,ts}" .
grep -r "recover\(\)\|defer.*recover" --include="*.go" .
```

### Alert Configuration

```
# Find alerting rules
find . -name "*alert*" -o -name "*alarm*" -o -name "prometheus*.yml"
grep -r "alert\|alarm\|notification\|pagerduty\|opsgenie" --include="*.{yml,yaml,json}" .

# Check for SLO definitions
grep -r "slo\|sli\|objective\|threshold" --include="*.{yml,yaml,json,md}" .
```

### Error Categorization

```
# Check if errors are properly categorized
grep -r "error.*type\|error.*code\|error.*category" --include="*.{js,ts,go,py}" .

# Custom error classes
grep -r "class.*Error\|Error.*extends\|CustomError" --include="*.{js,ts,java,py}" .
```

## 5. Infrastructure Monitoring

### Health Checks

```
# Find health check endpoints
grep -r "health\|healthz\|ping\|status" --include="*.{js,ts,go,py}" . | grep -i "route\|endpoint\|path"

# Readiness/liveness checks
grep -r "ready\|readiness\|live\|liveness" --include="*.{js,ts,go,py,yml}" .

# Dependency health checks
grep -r "check.*database\|check.*redis\|check.*external" --include="*.{js,ts,go,py}" .
```

### Resource Monitoring

```
# Database monitoring
grep -r "slow.*query\|query.*performance\|explain.*analyze" --include="*.{js,ts,go,py,sql}" .

# Cache monitoring
grep -r "cache.*hit\|cache.*miss\|eviction" --include="*.{js,ts,go,py}" .

# Queue monitoring
grep -r "queue.*size\|queue.*depth\|backlog" --include="*.{js,ts,go,py}" .
```

## 6. Dashboards & Visualization

### Dashboard Configuration

```
# Find dashboard definitions
find . -name "*dashboard*" -o -name "*grafana*" -o -name "*kibana*"
find . -path "*/dashboards/*" -name "*.json" -o -name "*.yml"

# Metrics being visualized
grep -r "panel\|graph\|chart\|visualization" --include="*.{json,yml}" .
```

### Missing Visualizations

```
# Check what's being monitored vs what exists
# Extract all metric names from code
grep -r "metric\.increment\|statsd\.gauge\|prometheus\.register" --include="*.{js,ts,go,py}" . | awk -F'"' '{print $2}' | sort | uniq > metrics-in-code.txt

# Extract metrics from dashboards
grep -r "expr\|query\|metric" dashboards/ | awk -F'"' '{print $2}' | sort | uniq > metrics-in-dashboards.txt

# Find gaps
comm -23 metrics-in-code.txt metrics-in-dashboards.txt > missing-visualizations.txt
```

## 7. Observability Documentation

Create `.claude/MONITORING_OBSERVABILITY_GAPS.md`:

````markdown
# Monitoring & Observability Analysis: [Project Name]

## Executive Summary

**Observability Maturity Level**: Level 2/5 (Basic Monitoring)

**Coverage Metrics**:

- Logging Coverage: 45% (structured: 12%)
- Metrics Coverage: 30% of endpoints
- Tracing: Not implemented
- Error Tracking: Basic (60% caught)
- Dashboards: 5 basic dashboards

**Critical Gaps**:

1. No distributed tracing
2. 55% of code has no logging
3. Missing SLO/SLI definitions
4. No alerting for business KPIs
5. Unstructured logs dominate (88%)

**Estimated MTTR Impact**: Currently 4+ hours, could be <30 minutes

## Table of Contents

- [Logging Analysis](#logging-analysis)
- [Metrics Coverage](#metrics-coverage)
- [Tracing Gaps](#tracing-gaps)
- [Error Tracking](#error-tracking)
- [Alerting Strategy](#alerting-strategy)
- [Dashboard Review](#dashboard-review)
- [Implementation Plan](#implementation-plan)

## Logging Analysis

### Current State

\```mermaid
pie title "Logging Implementation"
"console.log" : 67
"No logging" : 23
"Structured logging" : 8
"Logger library" : 2
\```

### Logging Anti-Patterns Found

#### 1. Unstructured String Concatenation

**Count**: 1,247 instances
\```javascript
// ❌ Current pattern found in 67% of files
console.log('User ' + userId + ' logged in at ' + new Date());
console.error('Payment failed for order ' + orderId + ': ' + error);

// ✅ Should be structured
logger.info('User logged in', {
userId,
timestamp: new Date().toISOString(),
event: 'user.login'
});
\```

#### 2. Missing Correlation IDs

**Impact**: Cannot trace requests across services
\```javascript
// ❌ No request context
app.post('/api/order', (req, res) => {
console.log('Creating order');
// ... no correlation ID
});

// ✅ With correlation
app.use((req, res, next) => {
req.correlationId = req.headers['x-correlation-id'] || uuidv4();
req.logger = logger.child({ correlationId: req.correlationId });
next();
});
\```

#### 3. Sensitive Data in Logs

**Security Risk**: HIGH
\```javascript
// ❌ Found 43 instances of PII in logs
console.log('User data:', user); // Includes password hash!
logger.info(`Credit card: ${card.number}`); // PCI violation

// ✅ Sanitized logging
logger.info('User action', {
userId: user.id,
action: 'profile.update',
// Omit sensitive fields
});
\```

### Critical Paths Without Logging

| Operation           | Files              | Current    | Required                                   |
| ------------------- | ------------------ | ---------- | ------------------------------------------ |
| Authentication      | auth.service.ts    | ❌ No logs | Login attempts, failures, token generation |
| Payment Processing  | payment.service.ts | ⚠️ Partial | All state changes, amounts, failures       |
| Database Operations | db/queries.ts      | ❌ No logs | Slow queries, connection issues            |
| External API Calls  | api/client.ts      | ❌ No logs | Requests, responses, latency               |
| Background Jobs     | workers/\*.ts      | ❌ No logs | Start, progress, completion, errors        |

### Log Aggregation Gaps

**Current**: Logs written to local files
**Missing**:

- Centralized log aggregation (ELK/Datadog/CloudWatch)
- Log rotation and retention policies
- Full-text search capabilities
- Log-based alerting

## Metrics Coverage

### Metrics Infrastructure

**Current Setup**: Basic StatsD client, no aggregation
\```javascript
// Found in: lib/metrics.js
const StatsD = require('node-statsd');
const client = new StatsD(); // No configuration!

// Limited usage found in only 12 files
client.increment('api.requests'); // No tags or context
\```

### Missing Application Metrics

#### RED Metrics (Rate, Errors, Duration)

| Component        | Rate    | Errors  | Duration |
| ---------------- | ------- | ------- | -------- |
| API Endpoints    | ⚠️ Some | ❌ No   | ❌ No    |
| Database Queries | ❌ No   | ❌ No   | ❌ No    |
| External APIs    | ❌ No   | ⚠️ Some | ❌ No    |
| Background Jobs  | ❌ No   | ❌ No   | ❌ No    |

#### USE Metrics (Utilization, Saturation, Errors)

| Resource             | Utilization | Saturation | Errors  |
| -------------------- | ----------- | ---------- | ------- |
| CPU                  | ❌ No       | ❌ No      | N/A     |
| Memory               | ❌ No       | ❌ No      | ❌ No   |
| Database Connections | ❌ No       | ❌ No      | ⚠️ Some |
| Thread Pools         | ❌ No       | ❌ No      | ❌ No   |

### Missing Business Metrics

\```typescript
// Required business KPIs with no tracking
interface MissingBusinessMetrics {
// Revenue metrics
orderValue: number;
conversionRate: number;
cartAbandonmentRate: number;

// User engagement  
 dailyActiveUsers: number;
sessionDuration: number;
featureAdoption: Map<string, number>;

// Performance
checkoutCompletionTime: number;
searchResponseTime: number;
pageLoadTime: number;

// Reliability
paymentSuccessRate: number;
apiAvailability: number;
errorRate: number;
}
\```

### Metric Implementation Gaps

\```mermaid
graph TD
subgraph "Current Metrics"
M1[Basic API Counts]
M2[Some Error Counts]
end

    subgraph "Missing - Technical"
        T1[Latency Histograms]
        T2[Resource Utilization]
        T3[Queue Depths]
        T4[Cache Performance]
        T5[Database Performance]
    end

    subgraph "Missing - Business"
        B1[Revenue Metrics]
        B2[User Behavior]
        B3[Conversion Funnel]
        B4[Feature Usage]
    end

    style T1 fill:#ff6b6b
    style T2 fill:#ff6b6b
    style B1 fill:#ff6b6b
    style B2 fill:#ff6b6b

\```

## Tracing Gaps

### Current State: No Distributed Tracing

**Impact**: Cannot troubleshoot latency or failures across services

### Missing Trace Points

\```mermaid
sequenceDiagram
participant U as User
participant A as API Gateway
participant S as Service
participant D as Database
participant C as Cache
participant E as External API

    U->>A: Request (❌ No trace start)
    A->>S: Route (❌ No span)
    S->>C: Check cache (❌ No span)
    C-->>S: Miss
    S->>D: Query (❌ No span)
    D-->>S: Results
    S->>E: Enrich data (❌ No span)
    E-->>S: Response
    S-->>A: Process (❌ No span)
    A-->>U: Response (❌ No trace end)

    Note over U,E: No visibility into timing or failures!

\```

### Required Tracing Implementation

\```typescript
// 1. Trace initialization
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const provider = new NodeTracerProvider();
provider.addSpanProcessor(new BatchSpanProcessor(new JaegerExporter()));
provider.register();

// 2. HTTP instrumentation
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
new HttpInstrumentation().enable();

// 3. Database instrumentation  
import { MongoDBInstrumentation } from '@opentelemetry/instrumentation-mongodb';
new MongoDBInstrumentation().enable();

// 4. Manual spans for business logic
const span = tracer.startSpan('process-payment', {
attributes: {
'payment.amount': amount,
'payment.currency': currency,
'user.id': userId
}
});
\```

### Service Dependencies Without Tracing

| Service         | Dependencies           | Trace Coverage |
| --------------- | ---------------------- | -------------- |
| API Gateway     | 5 services             | 0%             |
| User Service    | DB, Cache, Auth        | 0%             |
| Order Service   | DB, Payment, Inventory | 0%             |
| Payment Service | External API, DB       | 0%             |
| Notification    | Queue, Email API       | 0%             |

## Error Tracking

### Current Error Handling

\```javascript
// Found patterns:
// 1. Swallowed errors (234 instances)
try {
// operation
} catch (e) {
// Nothing! Error disappears
}

// 2. console.error only (567 instances)
} catch (error) {
console.error(error); // Not searchable/alertable
}

// 3. Generic error responses (123 instances)
} catch (err) {
res.status(500).json({ error: 'Internal server error' }); // No details
}
\```

### Missing Error Context

\```typescript
// ❌ Current: Minimal error information
throw new Error('Payment failed');

// ✅ Required: Rich error context
class PaymentError extends Error {
constructor(message: string, public context: {
userId: string;
orderId: string;
amount: number;
gateway: string;
attemptNumber: number;
errorCode?: string;
stackTrace?: string;
}) {
super(message);
this.name = 'PaymentError';
}
}
\```

### Uncaught Error Handlers

**Missing Global Handlers**:
\```javascript
// ❌ Not found in codebase
process.on('uncaughtException', (error) => {
logger.fatal('Uncaught exception', { error });
// Graceful shutdown
});

process.on('unhandledRejection', (reason, promise) => {
logger.error('Unhandled rejection', { reason, promise });
});

// For frontend
window.addEventListener('error', (event) => {
trackError(event.error);
});
\```

### Error Categorization Gaps

| Error Type            | Tracking | Alerting      | Dashboard |
| --------------------- | -------- | ------------- | --------- |
| 4xx Client Errors     | ⚠️ Some  | ❌ No         | ❌ No     |
| 5xx Server Errors     | ⚠️ Some  | ⚠️ Email only | ❌ No     |
| Database Errors       | ❌ No    | ❌ No         | ❌ No     |
| External API Errors   | ❌ No    | ❌ No         | ❌ No     |
| Validation Errors     | ❌ No    | ❌ No         | ❌ No     |
| Business Logic Errors | ❌ No    | ❌ No         | ❌ No     |

## Alerting Strategy

### Current Alerting

**Found**: Basic email alerts for server crashes
**Missing**: Comprehensive alerting strategy

### Missing SLI/SLO Definitions

\```yaml

# Required SLO definitions not found

slos:

- name: API Availability
  sli: successful_requests / total_requests
  objective: 99.9%
  window: 30d
- name: API Latency
  sli: p95_latency
  objective: < 200ms
  window: 30d
- name: Payment Success Rate
  sli: successful_payments / total_payments
  objective: 99.5%
  window: 7d
- name: Error Rate
  sli: error_requests / total_requests
  objective: < 0.1%
  window: 1h
  \```

### Alert Routing Gaps

\```mermaid
graph TD
subgraph "Current Alerts"
A1[Server Down] -->|Email| E[Engineering Email]
end

    subgraph "Missing Alerts"
        M1[High Error Rate]
        M2[Slow Response Time]
        M3[Payment Failures]
        M4[Database Issues]
        M5[Queue Backlog]
        M6[Low Disk Space]
        M7[SSL Expiry]
        M8[API Rate Limits]
    end

    subgraph "Missing Channels"
        C1[PagerDuty]
        C2[Slack]
        C3[SMS]
        C4[Incident Management]
    end

    style M1 fill:#ff6b6b
    style M3 fill:#ff6b6b
    style C1 fill:#ffd93d

\```

### Alert Fatigue Prevention

**Not Implemented**:

- Alert deduplication
- Smart grouping
- Severity levels
- Escalation policies
- Maintenance windows
- Alert suppression rules

## Dashboard Review

### Current Dashboards

Found 5 basic dashboards:

1. Server CPU/Memory (CloudWatch)
2. Basic API requests (StatsD)
3. Database connections (Manual)
4. Error counts (Log grep)
5. Deployment status (Jenkins)

### Missing Critical Dashboards

#### 1. Service Overview Dashboard

\```yaml
panels:

- title: Service Health
  metrics: [availability, latency, error_rate, throughput]
- title: Golden Signals
  metrics: [rate, errors, duration, saturation]
- title: Dependencies Health
  services: [database, cache, external_apis, queues]
- title: Business KPIs
  metrics: [orders/min, revenue/hour, active_users]
  \```

#### 2. User Journey Dashboard

\```yaml
panels:

- title: Funnel Conversion
  stages: [landing, signup, activation, purchase]
- title: User Errors
  metrics: [4xx_by_endpoint, validation_errors, timeout_errors]
- title: Performance by Step
  metrics: [page_load, api_latency, time_to_interactive]
  \```

#### 3. Infrastructure Dashboard

\```yaml
panels:

- title: Resource Utilization
  metrics: [cpu, memory, disk, network, connections]
- title: Scaling Metrics
  metrics: [request_rate, queue_depth, thread_pool_usage]
- title: Cost Metrics
  metrics: [compute_cost, storage_cost, transfer_cost]
  \```

### Dashboard Standards Gap

**Missing**:

- Consistent color coding
- Drill-down capabilities
- Mobile responsiveness
- Annotation support
- Time range sync
- Export capabilities

## Implementation Plan

### Phase 1: Foundation (Week 1-2)

#### 1.1 Structured Logging

\```typescript
// Implement centralized logger
import pino from 'pino';

const logger = pino({
base: {
env: process.env.NODE_ENV,
service: 'api-gateway',
version: process.env.VERSION
},
redact: ['password', 'creditCard', 'ssn'],
timestamp: pino.stdTimeFunctions.isoTime
});

// Request middleware
app.use((req, res, next) => {
req.logger = logger.child({
correlationId: req.headers['x-correlation-id'] || uuidv4(),
userId: req.user?.id,
method: req.method,
path: req.path
});
next();
});
\```

#### 1.2 Basic Metrics

\```typescript
// Implement Prometheus metrics
import { register, Counter, Histogram, Gauge } from 'prom-client';

const httpRequestsTotal = new Counter({
name: 'http_requests_total',
help: 'Total HTTP requests',
labelNames: ['method', 'endpoint', 'status']
});

const httpRequestDuration = new Histogram({
name: 'http_request_duration_seconds',
help: 'HTTP request latency',
labelNames: ['method', 'endpoint'],
buckets: [0.1, 0.5, 1, 2, 5]
});

// Auto-instrument all routes
app.use((req, res, next) => {
const start = Date.now();

res.on('finish', () => {
const duration = (Date.now() - start) / 1000;
httpRequestsTotal.inc({
method: req.method,
endpoint: req.route?.path || 'unknown',
status: res.statusCode
});
httpRequestDuration.observe({
method: req.method,
endpoint: req.route?.path || 'unknown'
}, duration);
});

next();
});
\```

### Phase 2: Observability (Week 3-4)

#### 2.1 Distributed Tracing

\```typescript
// Setup OpenTelemetry
import { NodeSDK } from '@opentelemetry/sdk-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { Resource } from '@opentelemetry/resources';

const sdk = new NodeSDK({
resource: new Resource({
'service.name': 'api-gateway',
'service.version': process.env.VERSION
}),
traceExporter: new JaegerExporter({
endpoint: 'http://jaeger:14268/api/traces'
}),
instrumentations: [
new HttpInstrumentation(),
new ExpressInstrumentation(),
new MongoDBInstrumentation()
]
});

sdk.start();
\```

#### 2.2 Error Tracking

\```typescript
// Integrate Sentry
import \* as Sentry from '@sentry/node';

Sentry.init({
dsn: process.env.SENTRY_DSN,
environment: process.env.NODE_ENV,
integrations: [
new Sentry.Integrations.Http({ tracing: true }),
new Sentry.Integrations.Express({ app })
],
tracesSampleRate: 0.1,
beforeSend(event) {
// Sanitize sensitive data
return sanitizeEvent(event);
}
});

// Error handler middleware
app.use(Sentry.Handlers.errorHandler());
\```

### Phase 3: Intelligence (Month 2)

#### 3.1 SLO-based Alerting

\```yaml

# prometheus-rules.yml

groups:

- name: slo-alerts
  rules: - alert: HighErrorRate
  expr: |
  (sum(rate(http_requests_total{status=~"5.."}[5m]))
  / sum(rate(http_requests_total[5m]))) > 0.01
  for: 5m
  labels:
  severity: critical
  slo: error-rate
  annotations:
  summary: "Error rate above 1%"
        - alert: HighLatency
          expr: |
            histogram_quantile(0.95,
              rate(http_request_duration_seconds_bucket[5m])
            ) > 0.5
          for: 5m
          labels:
            severity: warning
            slo: latency
  \```

#### 3.2 Automated Dashboards

\```typescript
// Dashboard as Code
import { Dashboard, Panel, Target } from 'grafana-dash-gen';

const serviceDashboard = new Dashboard({
title: 'Service Overview',
panels: [
new Panel({
title: 'Request Rate',
targets: [
new Target({
expr: 'sum(rate(http_requests_total[5m])) by (endpoint)'
})
]
}),
new Panel({
title: 'Error Rate',
targets: [
new Target({
expr: 'sum(rate(http_requests_total{status=~"5.."}[5m])) by (endpoint)'
})
]
}),
new Panel({
title: 'P95 Latency',
targets: [
new Target({
expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) by (endpoint)'
})
]
})
]
});

// Export to Grafana
await grafanaAPI.createDashboard(serviceDashboard.generate());
\```

### Phase 4: Optimization (Month 3)

#### 4.1 Synthetic Monitoring

\```typescript
// Synthetic checks
const syntheticChecks = [
{
name: 'User Login Flow',
interval: '5m',
steps: [
{ action: 'GET', url: '/login', expect: { status: 200 } },
{ action: 'POST', url: '/api/auth/login', body: testUser, expect: { status: 200, hasToken: true } },
{ action: 'GET', url: '/api/user/profile', headers: { token: '${token}' }, expect: { status: 200 } }
]
},
{
name: 'Checkout Flow',
interval: '10m',
steps: [
// ... checkout steps
]
}
];
\```

#### 4.2 Anomaly Detection

\```typescript
// Implement anomaly detection
class AnomalyDetector {
async detectAnomalies(metric: string, timeRange: string) {
const historical = await this.getHistoricalData(metric, '30d');
const current = await this.getCurrentData(metric, timeRange);

    const baseline = this.calculateBaseline(historical);
    const stdDev = this.calculateStdDev(historical);

    const anomalies = current.filter(point =>
      Math.abs(point.value - baseline) > (3 * stdDev)
    );

    if (anomalies.length > 0) {
      await this.alert({
        metric,
        anomalies,
        baseline,
        severity: this.calculateSeverity(anomalies, baseline)
      });
    }

}
}
\```

## Cost-Benefit Analysis

### Implementation Costs

| Initiative           | Tools              | Setup Cost | Monthly Cost  | Effort   |
| -------------------- | ------------------ | ---------- | ------------- | -------- |
| Structured Logging   | ELK/Datadog        | $5k        | $500-2k       | 40h      |
| Metrics & Dashboards | Prometheus/Grafana | $3k        | $200          | 60h      |
| Distributed Tracing  | Jaeger             | $3k        | $300          | 40h      |
| Error Tracking       | Sentry             | $1k        | $100-500      | 20h      |
| Alerting             | PagerDuty          | $1k        | $300          | 20h      |
| **Total**            | -                  | **$13k**   | **$1.4-3.3k** | **180h** |

### Benefits & ROI

| Metric              | Current     | With Observability | Improvement     |
| ------------------- | ----------- | ------------------ | --------------- |
| MTTR                | 4+ hours    | 30 minutes         | 87% reduction   |
| Incident Detection  | 30+ minutes | < 1 minute         | 97% faster      |
| Root Cause Analysis | 2+ hours    | 10 minutes         | 92% faster      |
| False Alerts        | N/A         | < 5%               | Predictable     |
| Customer Impact     | Unknown     | Measured           | 100% visibility |

**Annual Savings**:

- Reduced downtime: $200k (2 hours/month @ $100k/hour)
- Faster debugging: $150k (750 dev hours saved)
- Prevented outages: $500k (catching issues early)
- **Total ROI**: 850k/year (28x return)

## Recommendations

### Immediate Actions (This Week)

1. 🚨 **Implement structured logging**

   - Replace all console.log
   - Add correlation IDs
   - Remove sensitive data

2. 🚨 **Add error tracking**

   - Install Sentry/Rollbar
   - Add global error handlers
   - Categorize errors

3. 🚨 **Create first dashboard**
   - Request rate
   - Error rate
   - Basic latency

### Short Term (This Month)

1. **Metrics everywhere**

   - Instrument all endpoints
   - Add business metrics
   - Create SLO definitions

2. **Basic tracing**

   - Trace HTTP requests
   - Add database spans
   - Implement correlation

3. **Alert on SLOs**
   - Define critical alerts
   - Set up PagerDuty
   - Create runbooks

### Long Term (This Quarter)

1. **Full observability**

   - Complete tracing coverage
   - Advanced dashboards
   - Synthetic monitoring

2. **Automation**

   - Auto-remediation
   - Anomaly detection
   - Predictive alerts

3. **Culture shift**
   - Observability-driven development
   - Blameless postmortems
   - SLO reviews

## Appendix

### Logging Standards

\```typescript
// Logging levels and when to use them
logger.trace({ data }, 'Detailed trace info'); // Development only
logger.debug({ query }, 'Debug information'); // Verbose info
logger.info({ userId, action }, 'User action'); // Normal operations
logger.warn({ retry: attempt }, 'Warning condition'); // Concerning but handled
logger.error({ err, context }, 'Error occurred'); // Errors that need attention
logger.fatal({ err }, 'Fatal error, shutting down'); // Unrecoverable errors
\```

### Metric Naming Conventions

\```

# Format: namespace_subsystem_name_unit

http_requests_total
http_request_duration_seconds
db_connections_active
cache_hits_total
payment_amount_dollars
user_signup_total
\```

### Essential Reading

- [Google SRE Book](https://sre.google/sre-book/table-of-contents/)
- [Distributed Systems Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)
- [Site Reliability Workbook](https://sre.google/workbook/table-of-contents/)
````

### Final Storage & Session Completion

```
# Store final observability analysis
mcp__memory__memory_create operation="store_chunk" options='{"content":"[Complete observability analysis with gaps and implementation plan]","session_id":"observability-engineer-$(date +%s)","repository":"github.com/org/repo","tags":["monitoring","observability","logging","metrics","tracing","analysis-complete"],"files_modified":[".claude/MONITORING_OBSERVABILITY_GAPS.md","/monitoring/*","/dashboards/*"]}'

# Create observability thread
mcp__memory__memory_create operation="create_thread" options='{"name":"Observability Gap Analysis","description":"Complete analysis of monitoring, logging, and tracing gaps with implementation roadmap","chunk_ids":["[logging_chunk_id]","[metrics_chunk_id]","[tracing_chunk_id]"],"repository":"github.com/org/repo"}'

# Get automated insights on observability patterns
mcp__memory__memory_intelligence operation="auto_insights" options='{"repository":"github.com/org/repo","session_id":"observability-engineer-$(date +%s)"}'

# Generate citations for monitoring recommendations
mcp__memory__memory_system operation="generate_citations" options='{"query":"observability monitoring recommendations","chunk_ids":["[all_observability_chunk_ids]"],"repository":"github.com/org/repo"}'

# Analyze workflow completion
mcp__memory__memory_tasks operation="workflow_analyze" options='{"session_id":"observability-engineer-$(date +%s)","repository":"github.com/org/repo"}'

# End observability analysis session
mcp__memory__memory_tasks operation="session_end" options='{"session_id":"observability-engineer-$(date +%s)","repository":"github.com/org/repo"}'
```

## Execution Flow

1. **Analyze Logging**: Find patterns and coverage
2. **Check Metrics**: Identify instrumentation gaps
3. **Evaluate Tracing**: Assess distributed visibility
4. **Review Errors**: Check tracking and handling
5. **Examine Dashboards**: Find visualization gaps
6. **Create Roadmap**: Prioritize by impact

Begin by analyzing the current logging implementation and patterns.
