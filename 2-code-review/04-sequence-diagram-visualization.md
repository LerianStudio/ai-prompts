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

# Sequence Diagram Generator

Generate comprehensive mermaid sequence diagrams for data flows, API workflows, and system interactions.

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #4 in the analysis chain.**

**Dependency Checking:**
- **REQUIRED**: First read ALL previous outputs `docs/code-review/0-CODEBASE_OVERVIEW.md` through `docs/code-review/3-DATABASE_OPTIMIZATION.md` if they exist
- Use architectural components from prompt #1 to identify actors and systems
- Reference API contracts from prompt #2 for endpoint interaction flows
- Use database design from prompt #3 for data persistence sequences
- Create visual documentation that will support subsequent security, business, and quality analysis

**Output Review:**
- If `diagrams/` directory or sequence diagrams already exist:
  1. Read and analyze existing diagrams first
  2. Cross-reference with architectural, API, and database analysis from prompts 0-3
  3. Update diagrams to reflect current architecture and data flows
  4. Add missing sequences identified in the foundational analysis
  5. Ensure diagrams represent core system interactions

**Chain Coordination:**
- Store findings in memory MCP with tags: `["sequence-diagrams", "visualization", "system-flows", "prompt-4"]`
- Create foundational visual documentation for subsequent analysis phases
- Ensure diagrams reflect architectural decisions and API/database design
- Provide clear system visualization to support security, business, and quality analysis

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

## 1. System Discovery

### Extract System Components
```bash
# Find main services/components
grep -r "class\|interface\|service\|controller" --include="*.{go,ts,js,py,java}" . | head -20

# Find API endpoints
grep -r "router\|@.*Mapping\|app\.\|HandleFunc" --include="*.{go,ts,js,py,java}" . | head -20

# Find database interactions
grep -r "SELECT\|INSERT\|UPDATE\|DELETE\|Query\|Exec" --include="*.{go,ts,js,py,java}" . | head -20
```

## 2. Generate API Flow Diagrams

Create `diagrams/api-flows.md`:

```markdown
# API Flow Diagrams

## User Authentication Flow

\\```mermaid
sequenceDiagram
    participant C as Client
    participant A as API Gateway
    participant AS as Auth Service
    participant DB as Database
    
    C->>A: POST /auth/login
    A->>AS: validate credentials
    AS->>DB: query user
    DB-->>AS: user data
    AS->>AS: generate JWT
    AS-->>A: token + user info
    A-->>C: 200 {token, user}
    
    Note over C,DB: Successful login flow
\\```

## Order Processing Flow

\\```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant OS as Order Service
    participant PS as Payment Service
    participant IS as Inventory Service
    participant DB as Database
    
    C->>A: POST /orders
    A->>OS: create order
    OS->>IS: check inventory
    IS-->>OS: availability confirmed
    OS->>PS: process payment
    PS-->>OS: payment successful
    OS->>DB: save order
    DB-->>OS: order saved
    OS-->>A: order created
    A-->>C: 201 {order}
    
    Note over C,DB: Complete order flow
\\```

## Error Handling Flow

\\```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant S as Service
    participant DB as Database
    
    C->>A: POST /payment
    A->>S: process payment
    S->>DB: save transaction
    DB-->>S: error: connection failed
    S->>S: log error
    S->>S: rollback transaction
    S-->>A: 500 {error: "payment failed"}
    A-->>C: 500 {error: "internal error"}
    
    Note over C,DB: Error handling and rollback
\\```
```

## 3. Generate Authentication Flows

Create `diagrams/auth-flows.md`:

```markdown
# Authentication & Authorization Flows

## JWT Token Validation

\\```mermaid
sequenceDiagram
    participant C as Client
    participant M as Middleware
    participant AS as Auth Service
    participant R as Resource
    
    C->>M: GET /protected (Bearer token)
    M->>AS: validate token
    AS->>AS: verify signature
    AS->>AS: check expiration
    AS-->>M: token valid + user claims
    M->>R: forward request + user context
    R-->>M: resource data
    M-->>C: 200 {data}
\\```

## OAuth2 Flow

\\```mermaid
sequenceDiagram
    participant U as User
    participant C as Client App
    participant AS as Auth Server
    participant RS as Resource Server
    
    U->>C: login request
    C->>AS: authorization request
    AS->>U: login page
    U->>AS: credentials
    AS->>AS: validate user
    AS-->>C: authorization code
    C->>AS: exchange code for token
    AS-->>C: access token
    C->>RS: API request + token
    RS->>AS: validate token
    AS-->>RS: token valid
    RS-->>C: protected resource
    C-->>U: display data
\\```
```

## 4. Generate Data Flow Diagrams

Create `diagrams/data-flows.md`:

```markdown
# Data Processing Flows

## Data Pipeline Flow

\\```mermaid
sequenceDiagram
    participant S as Source
    participant I as Ingestion
    participant P as Processor
    participant V as Validator
    participant DB as Database
    participant C as Cache
    
    S->>I: raw data
    I->>P: transform data
    P->>V: validate schema
    V->>V: check business rules
    V->>DB: persist data
    V->>C: cache results
    DB-->>V: confirmation
    C-->>V: cached
    V-->>P: success
    P-->>I: processed
    I-->>S: acknowledgment
\\```

## Database Transaction Flow

\\```mermaid
sequenceDiagram
    participant A as Application
    participant TM as Transaction Manager
    participant DB as Database
    participant L as Logger
    
    A->>TM: begin transaction
    TM->>DB: START TRANSACTION
    A->>TM: execute query 1
    TM->>DB: INSERT user
    A->>TM: execute query 2
    TM->>DB: UPDATE balance
    A->>TM: commit
    TM->>DB: COMMIT
    TM->>L: log success
    TM-->>A: transaction complete
    
    Note over A,L: Successful transaction
\\```
```

## 5. Generate Business Process Flows

Create `diagrams/business-flows.md`:

```markdown
# Business Process Flows

## Customer Onboarding

\\```mermaid
sequenceDiagram
    participant C as Customer
    participant W as Web App
    participant V as Validation Service
    participant KYC as KYC Service
    participant N as Notification Service
    participant DB as Database
    
    C->>W: submit registration
    W->>V: validate form data
    V-->>W: validation passed
    W->>KYC: initiate KYC check
    KYC->>KYC: document verification
    KYC-->>W: KYC approved
    W->>DB: create customer record
    W->>N: send welcome email
    N-->>C: welcome email sent
    W-->>C: registration complete
\\```

## Payment Processing

\\```mermaid
sequenceDiagram
    participant C as Customer
    participant P as Payment Gateway
    participant PS as Payment Service
    participant B as Bank
    participant F as Fraud Detection
    participant DB as Database
    
    C->>P: submit payment
    P->>F: fraud check
    F-->>P: low risk score
    P->>PS: process payment
    PS->>B: charge request
    B-->>PS: payment authorized
    PS->>DB: record transaction
    PS-->>P: payment successful
    P-->>C: payment confirmed
\\```
```

## 6. Generate System Interaction Diagrams

Create `diagrams/system-interactions.md`:

```markdown
# System Interaction Flows

## Microservice Communication

\\```mermaid
sequenceDiagram
    participant AG as API Gateway
    participant US as User Service
    participant OS as Order Service
    participant PS as Payment Service
    participant NS as Notification Service
    participant MQ as Message Queue
    
    AG->>US: authenticate user
    US-->>AG: user validated
    AG->>OS: create order
    OS->>PS: charge payment
    PS-->>OS: payment processed
    OS->>MQ: publish order.created
    MQ->>NS: order.created event
    NS->>NS: send confirmation email
    OS-->>AG: order created
    AG-->>Client: order response
\\```

## Event-Driven Architecture

\\```mermaid
sequenceDiagram
    participant P as Producer
    participant EB as Event Bus
    participant C1 as Consumer 1
    participant C2 as Consumer 2
    participant C3 as Consumer 3
    
    P->>EB: publish event
    EB->>C1: deliver event
    EB->>C2: deliver event
    EB->>C3: deliver event
    
    par
        C1->>C1: process event
    and
        C2->>C2: process event
    and
        C3->>C3: process event
    end
    
    C1-->>EB: ack
    C2-->>EB: ack
    C3-->>EB: ack
\\```
```

## 7. Generate Diagram Index

Create `diagrams/README.md`:

```markdown
# System Sequence Diagrams

Visual documentation of system interactions, data flows, and business processes.

## 📋 Diagram Categories

### 🔌 API Interactions
- [API Flows](api-flows.md) - Request/response patterns
- [Authentication Flows](auth-flows.md) - Login and authorization sequences
- [Error Flows](error-flows.md) - Error handling and recovery

### 💾 Data Processing
- [Data Flows](data-flows.md) - Data pipeline and processing sequences
- [Database Interactions](data-flows.md#database-transaction-flow) - Transaction patterns

### 🏢 Business Processes  
- [Business Flows](business-flows.md) - End-to-end business workflows
- [Payment Processing](business-flows.md#payment-processing) - Payment flow sequences

### 🔄 System Architecture
- [System Interactions](system-interactions.md) - Service-to-service communication
- [Event Flows](system-interactions.md#event-driven-architecture) - Event-driven patterns

## 🎯 Key Patterns

**Synchronous Communication**: Direct request-response patterns
**Asynchronous Processing**: Event-driven and queue-based flows  
**Error Handling**: Rollback and recovery sequences
**Security**: Authentication and authorization flows
**Data Pipeline**: ETL and data processing workflows

## 🔍 How to Read

- **Participants**: System components (services, databases, external systems)
- **Messages**: Operations, API calls, data transfers
- **Activations**: Processing time on each component
- **Notes**: Important business logic or technical details

## 🛠️ Updating Diagrams

When system architecture changes:
1. Update relevant sequence diagrams
2. Verify participant names match current services
3. Add new interaction patterns
4. Remove deprecated flows
5. Update this index with new diagram links

Generated from codebase analysis - keep synchronized with actual implementation.
```

```
memory_store_chunk
  content="Generated sequence diagrams: API flows, auth flows, data flows, business processes, system interactions. Total diagrams: [count]"
  session_id="diagrams-$(date +%s)"
  repository="github.com/org/repo"
  tags=["sequence-diagrams", "mermaid", "visualization", "complete"]

memory_tasks session_end session_id="diagrams-$(date +%s)" repository="github.com/org/repo"
```

## Execution Notes

- **Comprehensive Coverage**: API, authentication, data, business, and system flows
- **Mermaid Format**: Standard sequence diagram syntax for GitHub/GitLab rendering
- **Actor Identification**: Extract from architectural analysis and code patterns  
- **Flow Discovery**: Based on API contracts, database interactions, and business logic
- **Error Scenarios**: Include failure paths and recovery sequences
- **Token Efficient**: Focused templates with essential diagram patterns