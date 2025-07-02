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
Use Zen MCP tools for advanced flow analysis and visualization:

**1. Analyze System Flows:**
```bash
mcp__zen__analyze \
  files=["/api", "/services", "/controllers", "/handlers"] \
  prompt="Trace and document the complete flow of key system operations. Identify actor interactions, service calls, and data transformations." \
  model="pro" \
  analysis_type="architecture" \
  output_format="detailed"
```

**2. Deep Dive into Authentication Flows:**
```bash
mcp__zen__thinkdeep \
  prompt="Analyze our authentication and authorization flows. Map the complete journey from login to protected resource access." \
  files=["/auth", "/middleware/auth.js", "/services/token-service.js"] \
  model="pro" \
  thinking_mode="high" \
  focus_areas=["JWT flow", "session management", "role-based access", "token refresh"]
```

**3. Debug Complex Interaction Issues:**
```bash
mcp__zen__debug \
  prompt="Users report intermittent failures during checkout process" \
  files=["/api/checkout", "/services/payment", "/services/inventory", "/services/notification"] \
  error_context="Transaction rolled back but user charged. Occurs ~5% of requests." \
  model="pro" \
  thinking_mode="max"
```

### Task Tool Usage
Search for flow patterns and system interactions:

```bash
# Find controller to service calls
task search "controller.*service|handler.*service|route.*controller"

# Search for async operation chains
task search "await.*then|Promise.all|async.*function.*await"

# Find event emitters and listeners
task search "emit\(|on\(|EventEmitter|publish|subscribe"

# Look for transaction boundaries
task search "beginTransaction|commit|rollback|transaction\("

# Find external API calls
task search "fetch\(|axios|http.request|RestTemplate"

# Search for workflow patterns
task search "workflow|process|pipeline|chain|sequence"

# Find middleware chains
task search "app.use|router.use|middleware.*next"

# Look for error propagation
task search "catch.*throw|error.*bubble|propagate.*error"
```

**Benefits:**
- Zen MCP provides deep understanding of complex interaction patterns
- Task tool enables rapid discovery of flow components and connections
- Combined approach ensures comprehensive sequence documentation

---

# Sequence Diagram Visualization

You are a system architect specializing in visual documentation. Your goal is to create sequence diagrams based on ACTUAL code flows discovered through systematic exploration.

## 🚨 CRITICAL: Discovery-First Diagram Generation

**MANDATORY PROCESS:**
1. **VERIFY** components and APIs from previous prompts exist
2. **TRACE** actual function calls and API flows
3. **MAP** real interactions with file:line evidence
4. **CREATE** diagrams only for verified flows
5. **NEVER** create hypothetical or idealized sequences

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #5 in the analysis chain.**

**Input Validation:**
- **REQUIRED**: First read ALL previous outputs `docs/code-review/1-CODEBASE_OVERVIEW.md` through `docs/code-review/4-DATABASE_OPTIMIZATION.md`
- **VERIFY**: All components referenced in previous analyses exist
- **USE**: Only verified endpoints, models, and queries from earlier prompts
- **TRACE**: Actual code paths to create accurate sequences

**Evidence Requirements:**
- Every actor in diagrams MUST be a verified component
- Every interaction MUST trace to actual code
- Every API call MUST reference discovered endpoints
- Every database operation MUST cite actual queries
- NO example flows without code evidence

**Chain Foundation:**
- Store only verified sequence diagrams with tags: `["sequence-diagrams", "visualization", "system-flows", "prompt-5", "verified"]`
- Create visual documentation of actual system behavior
- Provide accurate flow references for security analysis

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `diagrams/README.md` - Diagram index and navigation
- `diagrams/api-flows.md` - API request/response sequences
- `diagrams/auth-flows.md` - Authentication and authorization sequences
- `diagrams/data-flows.md` - Data processing and persistence sequences
- `diagrams/business-flows.md` - Business process workflows
- `diagrams/error-flows.md` - Error handling and recovery sequences
- `diagrams/system-interactions.md` - Service-to-service communication

## 0. Session Initialization

```
memory_tasks session_create session_id="diagrams-$(date +%s)" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
```

## 1. Load and Verify Previous Findings

### Step 1: Gather Components from Previous Analyses

```bash
# Load all verified components from previous prompts
echo "=== Loading verified components ==="

# From Architecture Analysis (Prompt #2)
if [ -f "docs/code-review/2-ARCHITECTURE_ANALYSIS.md" ]; then
  echo "Components from architecture:"
  grep -E "✓ COMPONENT:|Path:|Evidence:" docs/code-review/2-ARCHITECTURE_ANALYSIS.md
fi

# From API Analysis (Prompt #3)
if [ -f "docs/code-review/3-API_CONTRACT_ANALYSIS.md" ]; then
  echo "Endpoints from API analysis:"
  grep -E "Endpoint:.*\[HTTP|File:|Handler:" docs/code-review/3-API_CONTRACT_ANALYSIS.md
fi

# From Database Analysis (Prompt #4)
if [ -f "docs/code-review/4-DATABASE_OPTIMIZATION.md" ]; then
  echo "Database operations from analysis:"
  grep -E "Model:|Query Location:|File:" docs/code-review/4-DATABASE_OPTIMIZATION.md
fi
```

## 2. Trace Actual Code Flows

### Step 2: Follow Function Calls Through Components

```bash
# For each verified endpoint, trace its execution path
echo "=== Tracing API endpoint flows ==="

# Get handler functions from API analysis
HANDLERS=$(grep "Handler:" docs/code-review/3-API_CONTRACT_ANALYSIS.md 2>/dev/null | awk '{print $2}')

for handler in $HANDLERS; do
  echo "Tracing flow for handler: $handler"
  # Find the handler implementation
  grep -n "$handler" $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules) 2>/dev/null | head -5
  
  # Look for function calls within the handler
  if [ -f "$handler_file" ]; then
    grep -n -A10 "function $handler\|const $handler\|$handler.*=" "$handler_file" 2>/dev/null | \
      grep "\.\|await\|call\|query"
  fi
done
```

## 3. Map Actual Function Call Chains

### Step 3: Identify Real Service Interactions

```bash
# Find actual service-to-service calls
echo "=== Mapping service interactions ==="

# Look for HTTP client calls (service-to-service)
grep -n "fetch\|axios\|http\.\(get\|post\)\|request\(" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules) 2>/dev/null | head -20

# Find database calls in service methods
echo "=== Database interactions in services ==="
for service_dir in $(find . -type d -name "*service*" | grep -v node_modules); do
  echo "Service: $service_dir"
  grep -n "query\|find\|save\|insert\|update" "$service_dir"/*.{js,ts} 2>/dev/null | head -10
done

# Trace actual async/await chains
echo "=== Async call chains ==="
grep -n -B2 -A5 "await.*\." $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20) 2>/dev/null | \
  grep -E "await|async|then"
```

## 4. Generate Evidence-Based Sequence Diagrams

### CRITICAL: Only Create Diagrams for Discovered Flows

Create `diagrams/api-flows.md` with ONLY verified sequences:

```markdown
# API Flow Diagrams - VERIFIED SEQUENCES ONLY

## Discovery Summary
- **Endpoints Traced**: [Count from Step 2]
- **Service Interactions Found**: [Count from Step 3]
- **Database Operations Mapped**: [Count]

## Discovered API Flows

### Flow: [Actual Endpoint Name]
**Endpoint**: `[HTTP Method] [Path]` at `[file:line]`
**Handler**: `[functionName]` at `[file:line]`

\\```mermaid
sequenceDiagram
    participant Client
    participant [Actual Component from file]
    participant [Actual Service Called]
    participant [Database if found]
    
    Note over Client,[Last Component]: Based on code at [file:line]
    
    Client->>[Component]: [Actual HTTP method/path]
    Note right of [Component]: Handler: [function] at [file:line]
    
    [Component]->>[Service]: [Actual function call found]
    Note right of [Service]: Call at [file:line]
    
    [Only include database if query found]
    [Service]->>[Database]: [Actual query operation]
    Note right of [Database]: Query at [file:line]
\\```

**Evidence Trail**:
1. Endpoint defined at: `[file:line]`
2. Handler implementation: `[file:line]`
3. Service call: `[file:line]`
4. Database operation: `[file:line]` (if applicable)

### Missing Expected Flows
- ❌ Authentication flow: No auth endpoints found
- ❌ User registration: No signup endpoint found
- ❌ Error handling: No consistent error flow detected
```

## 5. Analyze Authentication Patterns

### Step 4: Find Actual Auth Implementation

```bash
# Search for authentication middleware and flows
echo "=== Finding authentication patterns ==="

# Look for auth middleware
grep -n "auth\|Auth\|jwt\|JWT\|token\|Token" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules) 2>/dev/null | \
  grep -E "middleware|verify|validate" | head -15

# Find protected route patterns
echo "=== Protected routes ==="
grep -n -B2 -A2 "requireAuth\|isAuthenticated\|authMiddleware\|protected" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules) 2>/dev/null | head -15

# Trace actual auth flow
echo "=== Auth validation flow ==="
for auth_file in $(grep -l "verify.*token\|jwt.*verify" $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules)); do
  echo "Auth logic in: $auth_file"
  grep -n -A5 "verify\|validate.*token" "$auth_file" 2>/dev/null | head -10
done
```

Create `diagrams/auth-flows.md` with ONLY discovered auth patterns:

```markdown
# Authentication Flows - VERIFIED PATTERNS ONLY

## Auth Implementation Found

### Discovered Auth Patterns
[Only document if authentication code found]

### Auth Middleware Flow
[Only create diagram if middleware found with evidence]

**Evidence**:
- Middleware defined at: `[file:line]`
- Token validation at: `[file:line]`
- Protected routes using middleware: [List with file:line]

### Missing Auth Elements
- ❌ No JWT implementation found
- ❌ No auth middleware detected
- ❌ No protected routes identified
```

## 6. Analyze Data Processing Patterns

### Step 7: Find Actual Data Processing Code

```bash
# Search for actual data processing patterns
echo "=== Finding data processing flows ==="

# Look for data transformation patterns
grep -n "transform\|process\|convert\|parse\|serialize" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20) 2>/dev/null | head -15

# Find validation patterns
echo "=== Data validation patterns ==="
grep -n "validate\|schema\|joi\|yup\|zod\|ajv" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20) 2>/dev/null | head -15

# Look for database transaction patterns
echo "=== Database transaction patterns ==="
grep -n "transaction\|BEGIN\|COMMIT\|ROLLBACK" \
  $(find . -name "*.js" -o -name "*.ts" -o -name "*.sql" | grep -v node_modules | head -20) 2>/dev/null | head -15

# Find actual data flow through the system
echo "=== Data flow patterns ==="
for service_file in $(find . -name "*service*" -name "*.js" -o -name "*.ts" | grep -v node_modules | head -10); do
  if [ -f "$service_file" ]; then
    echo "Service: $service_file"
    # Look for method chains that indicate data flow
    grep -n -A3 "\.\|await.*\.\|then(" "$service_file" 2>/dev/null | head -10
  fi
done
```

Create `diagrams/data-flows.md` with ONLY discovered patterns:

```markdown
# Data Processing Flows - VERIFIED PATTERNS ONLY

## Discovery Summary
- **Data Processing Files Found**: [Count from Step 7]
- **Validation Patterns Found**: [Count]
- **Transaction Patterns Found**: [Count]

## Discovered Data Flows

### Data Processing Pattern: [Actual Pattern Name]
**Found in**: `[file:line]`

[Only create diagram if actual data flow discovered with evidence]

\\```mermaid
sequenceDiagram
    participant [Actual Component from code]
    participant [Actual Next Step from code]
    
    Note over [Components]: Based on code at [file:line]
    
    [Component]->>[Next]: [Actual method call found]
    Note right of [Next]: Code at [file:line]
\\```

**Evidence Trail**:
1. Data input at: `[file:line]`
2. Processing step: `[file:line]`
3. Validation: `[file:line]` (if found)
4. Persistence: `[file:line]` (if found)

### Missing Expected Data Flows
- ❌ Data pipeline: No pipeline pattern found
- ❌ ETL process: No ETL code detected
- ❌ Batch processing: No batch patterns found
```

## 7. Analyze Business Process Code

### Step 8: Discover Actual Business Workflows

```bash
# Search for business process implementations
echo "=== Finding business process flows ==="

# Look for user registration/onboarding
echo "--- Registration/Onboarding Patterns ---"
grep -n "register\|signup\|onboard\|createUser\|newUser" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20) 2>/dev/null | head -15

# Find payment processing code
echo "--- Payment Processing Patterns ---"
grep -n "payment\|charge\|transaction\|stripe\|paypal" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20) 2>/dev/null | head -15

# Look for order processing workflows
echo "--- Order/Workflow Patterns ---"
grep -n "order\|workflow\|process\|status.*=" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20) 2>/dev/null | head -15

# Find notification patterns
echo "--- Notification Patterns ---"
grep -n "notify\|email\|sms\|notification\|alert" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20) 2>/dev/null | head -15
```

### Step 9: Trace Business Logic Flows

```bash
# For each business process found, trace the actual flow
echo "=== Tracing business logic flows ==="

# If registration found, trace the flow
REGISTRATION_FILES=$(grep -l "register\|signup" $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules))
for reg_file in $REGISTRATION_FILES; do
  if [ -f "$reg_file" ]; then
    echo "Registration flow in: $reg_file"
    # Look for the sequence of calls
    grep -n -A10 "register\|signup" "$reg_file" 2>/dev/null | \
      grep -E "await|then|call|save|create|send" | head -10
  fi
done
```

Create `diagrams/business-flows.md` with ONLY discovered workflows:

```markdown
# Business Process Flows - VERIFIED WORKFLOWS ONLY

## Discovery Summary
- **Business Process Files Found**: [Count from Step 8]
- **Registration Flows**: [Found/Not Found]
- **Payment Flows**: [Found/Not Found]
- **Notification Patterns**: [Count]

## Discovered Business Processes

### Process: [Actual Process Name from Code]
**Implementation**: `[file:line]`

[Only create diagram if actual business flow found]

\\```mermaid
sequenceDiagram
    participant [Actor from code]
    participant [Component from code]
    
    Note over [All]: Based on implementation at [file:line]
    
    [Actor]->>[Component]: [Actual method call]
    Note right of [Component]: [file:line]
\\```

**Evidence Trail**:
1. Process starts at: `[file:line]`
2. Validation step: `[file:line]` (if found)
3. Business logic: `[file:line]`
4. Completion: `[file:line]`

### Missing Expected Business Flows
- ❌ Customer onboarding: No registration flow found
- ❌ Payment processing: No payment code detected
- ❌ Order fulfillment: No order workflow found
```

## 8. Analyze System Interactions

### Step 10: Discover Service-to-Service Communication

```bash
# Find actual service communication patterns
echo "=== Finding system interactions ==="

# Look for microservice patterns
echo "--- Service Communication Patterns ---"
grep -n "http\|fetch\|axios\|request\|RestTemplate" \
  $(find . -name "*.js" -o -name "*.ts" -o -name "*.java" | grep -v node_modules | head -20) 2>/dev/null | head -15

# Find message queue patterns
echo "--- Message Queue Patterns ---"
grep -n "publish\|subscribe\|queue\|kafka\|rabbitmq\|redis" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20) 2>/dev/null | head -15

# Look for event patterns
echo "--- Event-Driven Patterns ---"
grep -n "emit\|on(\|addEventListener\|EventEmitter" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20) 2>/dev/null | head -15

# Find gateway patterns
echo "--- API Gateway Patterns ---"
grep -n "gateway\|proxy\|route\|forward" \
  $(find . -name "*.js" -o -name "*.ts" | grep -v node_modules | head -20) 2>/dev/null | head -15
```

### Step 11: Map Actual Service Dependencies

```bash
# Trace actual service calls
echo "=== Mapping service dependencies ==="

# Find configuration files that might define service URLs
echo "--- Service Configuration ---"
for config_file in $(find . -name "*config*" -name "*.js" -o -name "*.json" -o -name "*.yml" | grep -v node_modules | head -10); do
  if [ -f "$config_file" ]; then
    echo "Config: $config_file"
    grep -n "url\|endpoint\|service" "$config_file" 2>/dev/null | head -5
  fi
done

# Find actual HTTP calls between services
echo "--- Inter-Service HTTP Calls ---"
for service_file in $(find . -name "*service*" -name "*.js" -o -name "*.ts" | grep -v node_modules | head -10); do
  if [ -f "$service_file" ]; then
    echo "Service: $service_file"
    grep -n -B2 -A2 "http.*://\|fetch(\|axios\." "$service_file" 2>/dev/null | head -10
  fi
done
```

Create `diagrams/system-interactions.md` with ONLY discovered interactions:

```markdown
# System Interaction Flows - VERIFIED PATTERNS ONLY

## Discovery Summary
- **Service Communication Found**: [Count from Step 10]
- **Message Queue Usage**: [Found/Not Found]
- **Event Patterns**: [Count]
- **Gateway Configuration**: [Found/Not Found]

## Discovered System Interactions

### Interaction: [Actual Service-to-Service Call]
**Found in**: `[file:line]`

[Only create diagram if actual interaction discovered]

\\```mermaid
sequenceDiagram
    participant [Service A from code]
    participant [Service B from code]
    
    Note over [Services]: Based on code at [file:line]
    
    [Service A]->>[Service B]: [Actual HTTP call or event]
    Note right of [Service B]: Endpoint: [actual path from code]
\\```

**Evidence**:
- Service A location: `[file:line]`
- HTTP call/Event: `[file:line]`
- Service B endpoint: `[file:line]`

### Missing Expected Interactions
- ❌ Microservice architecture: No service-to-service calls found
- ❌ Message queue: No queue implementation detected
- ❌ Event bus: No event-driven patterns found
- ❌ API Gateway: No gateway configuration found
```

## 9. Generate Evidence-Based Diagram Index

### CRITICAL: Index Only Created Diagrams

Create `diagrams/README.md` with ONLY verified content:

```markdown
# System Sequence Diagrams - EVIDENCE-BASED DOCUMENTATION

**Generation Date**: [Current date]
**Analysis Method**: Code-first discovery
**Verification**: All diagrams based on actual code with file:line references

## 📋 Discovered Diagram Categories

### 🔌 API Interactions
[Only include if api-flows.md was created with actual endpoints]
- [API Flows](api-flows.md) - [Count] verified endpoints documented
- [Authentication Flows](auth-flows.md) - [Status: Found/Not Found]

### 💾 Data Processing
[Only include if data-flows.md was created with actual patterns]
- [Data Flows](data-flows.md) - [Count] data processing patterns found

### 🏢 Business Processes
[Only include if business-flows.md was created with actual workflows]
- [Business Flows](business-flows.md) - [Count] business processes traced

### 🔄 System Architecture
[Only include if system-interactions.md was created with actual interactions]
- [System Interactions](system-interactions.md) - [Count] service interactions mapped

## ❌ Expected But Not Found

Document what sequence diagrams could not be created due to missing code:

### Missing API Documentation
- No API endpoints discovered in codebase
- No OpenAPI/Swagger specification found

### Missing Business Flows
- No registration workflow implementation found
- No payment processing code detected
- No order management system found

### Missing System Patterns
- No microservice communication patterns
- No event-driven architecture detected
- No message queue implementation found

## 🔍 Discovery Methodology

1. **Code-First Analysis**: Started with actual code files
2. **Evidence Requirements**: Every diagram element traced to code
3. **Verification**: File:line references for all sequences
4. **Transparency**: Missing elements clearly documented

## 📝 How to Use These Diagrams

- **Verify First**: Check file:line references still exist
- **Update Carefully**: Only add sequences found in code
- **Document Gaps**: Add to "Not Found" when expected patterns missing

Generated from actual codebase analysis on [Date]
```

## 10. Final Validation and Memory Storage

```bash
# Validate all sequence diagrams reference real code
echo "=== Validating sequence diagram generation ==="

# Check how many actual flows were discovered
API_FLOWS=$(grep -c "Endpoint:" diagrams/api-flows.md 2>/dev/null || echo "0")
AUTH_FLOWS=$(grep -c "Auth.*Flow" diagrams/auth-flows.md 2>/dev/null || echo "0")
DATA_FLOWS=$(grep -c "Processing Pattern:" diagrams/data-flows.md 2>/dev/null || echo "0")
BUSINESS_FLOWS=$(grep -c "Process:" diagrams/business-flows.md 2>/dev/null || echo "0")
SYSTEM_FLOWS=$(grep -c "Interaction:" diagrams/system-interactions.md 2>/dev/null || echo "0")

echo "Sequence diagrams created:"
echo "- API Flows: $API_FLOWS"
echo "- Auth Flows: $AUTH_FLOWS"
echo "- Data Flows: $DATA_FLOWS"
echo "- Business Flows: $BUSINESS_FLOWS"
echo "- System Interactions: $SYSTEM_FLOWS"
```

```
memory_store_chunk
  content="Sequence diagram analysis completed. Discovered: $API_FLOWS API flows, $AUTH_FLOWS auth patterns, $DATA_FLOWS data flows, $BUSINESS_FLOWS business processes, $SYSTEM_FLOWS system interactions. All with code evidence."
  session_id="diagrams-$(date +%s)"
  repository="github.com/org/repo"
  tags=["sequence-diagrams", "mermaid", "visualization", "evidence-based", "verified"]

memory_store_decision
  decision="Sequence diagram coverage: [comprehensive|partial|minimal]"
  rationale="Found [X] total sequence flows across [Y] categories. Missing: [list]. All documented flows have file:line evidence."
  context="Most complex flow: [describe]. Missing critical flows: [list]"
  session_id="diagrams-$(date +%s)"
  repository="github.com/org/repo"

memory_tasks session_end session_id="diagrams-$(date +%s)" repository="github.com/org/repo"
```

## Execution Notes

- **Comprehensive Coverage**: API, authentication, data, business, and system flows
- **Mermaid Format**: Standard sequence diagram syntax for GitHub/GitLab rendering
- **Actor Identification**: Extract from architectural analysis and code patterns  
- **Flow Discovery**: Based on API contracts, database interactions, and business logic
- **Error Scenarios**: Include failure paths and recovery sequences
- **Token Efficient**: Focused templates with essential diagram patterns

## 📋 Todo List Generation

**REQUIRED**: Generate or append to `docs/code-review/code-review-todo-list.md` with findings from this analysis.

### Todo Entry Format - EVIDENCE-BASED ONLY
```markdown
## Sequence Diagram Analysis Findings

**Analysis Date**: [Date]
**Flows Discovered**: [Total count across all categories]
**Flows Missing**: [Count of expected but not found]

### 🔴 CRITICAL (Immediate Action Required)
[Only if critical missing flows impact system functionality]
- [ ] **Missing [Flow Type]**: [Description based on analysis]
  - **Evidence**: Searched for [pattern] in [locations], not found
  - **Impact**: [Concrete impact on system]
  - **Effort**: [Time to implement]
  - **Why Critical**: [Specific reason this flow is essential]

### 🟡 HIGH (Sprint Priority)
[Only for important missing flows discovered through analysis]
- [ ] **Document [Existing Flow]**: Found at `[file:line]` but undocumented
  - **Evidence**: Flow exists but no sequence diagram
  - **Impact**: Team lacks understanding of [specific process]
  - **Files**: `[actual files with the flow]`

### 🟢 MEDIUM (Backlog)
[Only for flows that exist but could be improved]
- [ ] **Optimize [Flow Name]**: Current implementation at `[file:line]`
  - **Evidence**: [Specific inefficiency found]
  - **Current**: [What happens now with file:line]
  - **Suggested**: [Specific improvement]

### 🔵 LOW (Future Consideration)
[Only minor improvements based on actual findings]

### ❌ MISSING SEQUENCE DOCUMENTATION
- [ ] **No API flow diagrams**: [Count] endpoints found but undocumented
  - **Found at**: [List files with endpoints]
  - **Impact**: API behavior not visually documented
- [ ] **No auth flow diagrams**: Auth code exists but no sequence diagram
  - **Found at**: `[file:line]` 
  - **Impact**: Security flow not documented
- [ ] **No business process diagrams**: [Count] workflows found but undocumented
  - **Processes**: [List actual processes found]
```

### Implementation Rules
1. ONLY create todos for actual findings or missing documentation
2. EVERY todo must reference what was searched and where
3. Include evidence of what exists vs what's documented
4. NO hypothetical sequence improvements without code evidence
5. Focus on documenting discovered but undocumented flows
6. Tag with `#sequence-diagrams #documentation #verified`