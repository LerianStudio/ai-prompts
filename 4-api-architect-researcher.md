You are a world-class API architect with expertise in API design, contract testing, and backwards compatibility. Conduct a thorough API contract analysis building on the existing architecture documentation.

## 0. Context Loading

```
# Load prior analyses
cat .claude/ARCHITECTURE_ANALYSIS.md
memory_search query="API endpoints routes REST GraphQL" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
```

## 1. API Discovery & Inventory

### Endpoint Extraction

```
# Find all API route definitions
grep -r "router\.\|app\.\|route\(" --include="*.{js,ts,go,py,java}" . | grep -E "(get|post|put|patch|delete|GET|POST|PUT|PATCH|DELETE)"
grep -r "@Get\|@Post\|@Put\|@Delete\|@Patch" --include="*.{ts,java}" .  # Decorators
grep -r "HandleFunc\|Handle\(" --include="*.go" .  # Go handlers
find . -name "*.proto" -o -name "*.graphql" -o -name "*.gql"  # Other API types
```

### API Type Classification

- REST endpoints
- GraphQL schemas
- WebSocket events
- gRPC services
- Webhook receivers
- Internal APIs vs External APIs

```
# Extract OpenAPI/Swagger definitions if they exist
find . -name "swagger.*" -o -name "openapi.*" -o -name "*.yaml" -o -name "*.yml" | grep -i "api\|swagger\|openapi"
```

```
memory_store_chunk
  content="API types found: [REST|GraphQL|WebSocket|gRPC]. Total endpoints: [count]. Documented: [X%]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["api", "contract", "inventory"]
```

## 2. Schema & Contract Extraction

### Request/Response Schema Detection

```
# Find request validation schemas
grep -r "body\|params\|query" --include="*.{js,ts,go,py}" . | grep -B5 -A5 "validate\|schema\|type"
grep -r "interface.*Request\|interface.*Response\|type.*Request\|type.*Response" --include="*.{ts,go}" .
grep -r "class.*Request\|class.*Response\|class.*DTO" --include="*.{java,py,ts}" .
```

### Data Model Extraction

For each endpoint, extract:

- HTTP method
- Path pattern
- Path parameters
- Query parameters
- Request body schema
- Response schema(s)
- Error responses
- Headers required

Example extraction:

```typescript
// From: src/routes/user.ts
app.post('/api/v1/users',
  validateBody(CreateUserSchema),
  async (req, res) => {
    // Implementation
  }
);

// Extract to:
{
  method: 'POST',
  path: '/api/v1/users',
  request: {
    body: {
      email: 'string, required, email format',
      password: 'string, required, min 8 chars',
      name: 'string, optional'
    }
  },
  response: {
    200: { id: 'uuid', email: 'string', name: 'string' },
    400: { error: { code: 'string', message: 'string' } },
    409: { error: { code: 'DUPLICATE_EMAIL', message: 'string' } }
  }
}
```

```
memory_store_chunk
  content="Endpoints with schemas: [count]. Missing schemas: [list]. Schema formats: [types]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["api", "schemas", "contracts"]
```

## 3. Breaking Change Detection

### Historical Analysis

```
# Check git history for API changes
git log -p --grep="api\|endpoint\|route" -- "**/routes/**" "**/controllers/**" | grep -E "^\+|^-" | grep -E "(get|post|put|delete|path)"

# Find removed endpoints
git diff HEAD~100 HEAD --name-status | grep "^D.*\(route\|controller\|api\)"

# Find modified endpoints
git log --oneline --name-only | grep -E "(route|api|controller)" | sort | uniq -c | sort -rn
```

### Breaking Changes to Detect

- [ ] Removed endpoints
- [ ] Changed URL paths
- [ ] Modified required fields
- [ ] Changed field types
- [ ] Removed response fields
- [ ] Changed error codes
- [ ] Modified authentication

### Semantic Versioning Violations

```typescript
// Breaking change example - field type change
// Before (v1.0):
interface UserResponse {
  id: number; // Was number
  email: string;
}

// After (v1.1):
interface UserResponse {
  id: string; // Now string - BREAKING!
  email: string;
}
```

```
memory_store_decision
  decision="API stability: [stable|unstable|breaking]"
  rationale="Found [X] breaking changes in last [Y] commits"
  context="Most impacted: [endpoint] with [change type]"
  session_id="[session]"
  repository="github.com/org/repo"
```

## 4. Documentation Validation

### Documentation Coverage

```
# Find documented vs undocumented endpoints
# Count endpoints in code
endpoints_in_code=$(grep -r "router\.\|app\." --include="*.{js,ts}" . | wc -l)

# Count documented endpoints
find . -name "*.md" -o -name "*.yaml" -o -name "*.json" | xargs grep -l "endpoint\|api" | xargs cat | grep -E "(GET|POST|PUT|DELETE|PATCH)"
```

### Documentation Quality Checks

For each endpoint, verify:

- [ ] Description exists
- [ ] Request examples provided
- [ ] Response examples provided
- [ ] Error cases documented
- [ ] Authentication requirements clear
- [ ] Rate limits specified
- [ ] Deprecation notices

### OpenAPI Generation

```yaml
# Generate OpenAPI spec from code
openapi: 3.0.0
info:
  title: [Project] API
  version: 1.0.0
  description: Auto-generated from code analysis

paths:
  /api/v1/users:
    post:
      summary: Create a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: User created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
```

## 5. Consistency Analysis

### Naming Convention Validation

```
# Check for inconsistent naming
grep -r "route\|endpoint" --include="*.{js,ts,go}" . | grep -oE "/(api/)?v?[0-9]?/[a-zA-Z0-9_/-]+" | sort | uniq

# Find camelCase vs snake_case inconsistencies
grep -r "JSON\|json" --include="*.{js,ts,go}" . | grep -E "([a-z]+_[a-z]+|[a-z][A-Z])"
```

Issues to find:

- [ ] Mixed URL conventions (/users vs /api/users vs /v1/users)
- [ ] Inconsistent parameter naming (userId vs user_id vs id)
- [ ] Mixed response formats (data vs result vs direct response)
- [ ] Inconsistent error formats
- [ ] Mixed authentication methods

### Response Format Standardization

```typescript
// Find all response patterns
// Pattern 1: { data: T }
// Pattern 2: { result: T, meta: {} }
// Pattern 3: T (direct)
// Pattern 4: { success: boolean, data?: T, error?: E }
```

```
memory_store_chunk
  content="Naming inconsistencies: [list]. Response patterns: [count]. Standardization needed: [areas]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["api", "consistency", "standards"]
```

## 6. Backwards Compatibility Analysis

### Version Detection

```
# Find API versioning patterns
grep -r "v[0-9]\|version" --include="*.{js,ts,go,py}" . | grep -i "api"
find . -type d -name "v1" -o -name "v2" -o -name "v*"
```

### Compatibility Matrix

| Endpoint       | v1  | v2  | Breaking Changes       | Migration Path     |
| -------------- | --- | --- | ---------------------- | ------------------ |
| GET /users     | ✓   | ✓   | None                   | N/A                |
| GET /users/:id | ✓   | ✓   | Response field removed | Add field back     |
| POST /users    | ✓   | ✗   | Endpoint removed       | Use POST /accounts |

### Deprecation Tracking

```
# Find deprecated endpoints
grep -r "deprecated\|@deprecated\|DEPRECATED" --include="*.{js,ts,go,py,java}" .
grep -r "TODO.*remove\|FIXME.*legacy" --include="*.{js,ts,go,py}" .
```

## 7. Contract Testing Implementation

### Generate Contract Tests

```typescript
// For each endpoint, generate contract test
describe("API Contract: POST /api/v1/users", () => {
  const CONTRACT_VERSION = "1.0.0";

  it("should accept valid request schema", async () => {
    const validRequest = {
      email: "test@example.com",
      password: "SecurePass123",
      name: "Test User",
    };

    const response = await api.post("/api/v1/users", validRequest);

    expect(response.status).toBe(201);
    expect(response.body).toMatchSchema({
      type: "object",
      required: ["id", "email"],
      properties: {
        id: { type: "string", format: "uuid" },
        email: { type: "string", format: "email" },
        name: { type: "string" },
      },
    });
  });

  it("should reject invalid request schema", async () => {
    const invalidRequest = {
      email: "not-an-email",
      password: "123", // Too short
    };

    const response = await api.post("/api/v1/users", invalidRequest);

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should maintain backwards compatibility", async () => {
    // Test that old clients still work
    const legacyRequest = {
      email: "test@example.com",
      password: "SecurePass123",
      // 'name' was optional in v1
    };

    const response = await api.post("/api/v1/users", legacyRequest);
    expect(response.status).toBe(201);
  });
});
```

## 8. API Contract Documentation

Create `.claude/API_CONTRACT.md`:

````markdown
# API Contract Analysis: [Project Name]

## Executive Summary

**API Maturity Level**: [1-5] Richardson Maturity Model
**Contract Coverage**: [X]% endpoints with defined contracts
**Breaking Changes**: [Y] in last 6 months
**Documentation Coverage**: [Z]%

**Critical Issues**:

1. [x] endpoints without any contract definition
2. [Y] breaking changes without version bump
3. [Z] undocumented error responses

## Table of Contents

- [API Inventory](#api-inventory)
- [Contract Definitions](#contract-definitions)
- [Breaking Changes](#breaking-changes)
- [Consistency Report](#consistency-report)
- [Backwards Compatibility](#backwards-compatibility)
- [Contract Tests](#contract-tests)
- [OpenAPI Specification](#openapi-specification)

## API Inventory

### REST Endpoints

Total: [X] endpoints across [Y] resources

\```mermaid
graph TB
subgraph "Public API"
Auth["/api/v1/auth/*<br/>5 endpoints"]
Users["/api/v1/users/*<br/>8 endpoints"]
Orders["/api/v1/orders/*<br/>12 endpoints"]
end

    subgraph "Internal API"
        Admin["/internal/admin/*<br/>15 endpoints"]
        Health["/internal/health/*<br/>3 endpoints"]
    end

    subgraph "Webhooks"
        Payment["/webhooks/payment<br/>POST only"]
        Shipping["/webhooks/shipping<br/>POST only"]
    end

\```

### GraphQL Schema

[If applicable]
\```graphql
type Query {
user(id: ID!): User
users(filter: UserFilter, pagination: Pagination): UserConnection!
}

type Mutation {
createUser(input: CreateUserInput!): User!
updateUser(id: ID!, input: UpdateUserInput!): User!
}
\```

### WebSocket Events

[If applicable]
| Event | Direction | Payload | Description |
|-------|-----------|---------|-------------|
| user.updated | Server→Client | User object | Real-time user updates |
| order.status | Server→Client | Order status | Order status changes |

## Contract Definitions

### Authentication Endpoints

#### POST /api/v1/auth/login

**Description**: Authenticate user and receive access token

**Request**:
\```typescript
{
email: string; // Required, email format
password: string; // Required, min 8 chars
remember?: boolean; // Optional, default false
}
\```

**Response 200**:
\```typescript
{
token: string; // JWT token
refreshToken: string;
expiresIn: number; // Seconds
user: {
id: string;
email: string;
name: string;
};
}
\```

**Response 401**:
\```typescript
{
error: {
code: 'INVALID_CREDENTIALS',
message: 'Invalid email or password'
}
}
\```

**Contract Test**: ✓ Implemented
**Breaking Changes**: None
**Deprecation**: None

[Continue for all endpoints...]

## Breaking Changes

### Recent Breaking Changes (Last 6 Months)

#### 1. GET /api/v1/users/:id Response Change

**Date**: 2024-10-15
**Commit**: abc123def
**Change Type**: Field Removal
**Impact**: High

**Before**:
\```json
{
"id": "123",
"email": "user@example.com",
"phoneNumber": "+1234567890" // Removed
}
\```

**After**:
\```json
{
"id": "123",
"email": "user@example.com"
// phoneNumber removed for privacy
}
\```

**Migration Strategy**:

- Add deprecation notice 3 months before
- Provide /api/v2/users/:id with new schema
- Maintain v1 with null phoneNumber for 6 months

#### 2. POST /api/v1/orders Required Field Addition

[Details...]

### Breaking Change Timeline

\```mermaid
gantt
title API Breaking Changes Timeline
dateFormat YYYY-MM-DD

    section User API
    phoneNumber removal    :done, 2024-10-15, 30d
    id type change        :active, 2024-12-01, 60d

    section Order API
    status enum change    :2025-01-15, 45d

    section Deprecations
    v1 endpoints         :2025-03-01, 90d

\```

## Consistency Report

### URL Pattern Analysis

\```
Standard Pattern: /api/v{version}/{resource}/{id?}/{action?}

Conforming: 45 endpoints (85%)
Non-conforming: 8 endpoints (15%)

Non-conforming examples:

- /users/list (missing /api/v1 prefix)
- /api/getUser (non-RESTful)
- /v1/api/users (incorrect order)
  \```

### Response Format Inconsistencies

| Pattern          | Count | Example       | Recommendation      |
| ---------------- | ----- | ------------- | ------------------- |
| `{ data: T }`    | 23    | GET /users    | Standardize on this |
| `{ result: T }`  | 12    | GET /orders   | Migrate to data     |
| Direct `T`       | 8     | GET /config   | Wrap in data object |
| `{ items: T[] }` | 5     | GET /products | Use data array      |

### Error Response Formats

\```typescript
// Found 4 different error patterns
// Pattern 1 (recommended):
{ error: { code: string, message: string, details?: any } }

// Pattern 2:
{ errors: Array<{ field: string, message: string }> }

// Pattern 3:
{ message: string, statusCode: number }

// Pattern 4:
{ error: string }
\```

## Backwards Compatibility

### Version Support Matrix

| Version | Status   | Support Until | Usage |
| ------- | -------- | ------------- | ----- |
| v1      | Stable   | 2025-12-31    | 78%   |
| v2      | Beta     | -             | 22%   |
| v3      | Planning | -             | 0%    |

### Compatibility Checks

✓ All v1 endpoints available in v2
✓ Request schemas are supersets (optional fields added only)
✗ Response schemas have breaking changes (3 endpoints)
✓ Error codes remain consistent
✗ Authentication method changed (token format)

### Migration Guides

#### Migrating from v1 to v2

1. **Update Authentication**
   ```diff
   - Authorization: Token {token}
   + Authorization: Bearer {token}
   ```
````

2. **Handle Response Changes**

   ```diff
   // User response
   - { id: 123, email: "..." }
   + { id: "uuid-here", email: "..." }
   ```

3. **Update Error Handling**
   ```diff
   - if (response.statusCode === 400)
   + if (response.status === 400 && response.body.error.code)
   ```

## Contract Tests

### Coverage by Endpoint Type

\```mermaid
pie title "Contract Test Coverage"
"Fully Tested" : 45
"Partially Tested" : 25
"Not Tested" : 30
\```

### Generated Contract Test Suite

Location: `/tests/contracts/`

\```
/tests/contracts/
├── auth.contract.test.ts (5 endpoints, 23 tests)
├── users.contract.test.ts (8 endpoints, 41 tests)
├── orders.contract.test.ts (12 endpoints, 67 tests)
├── shared/
│ ├── schemas.ts (reusable schema definitions)
│ └── matchers.ts (custom Jest matchers)
└── backwards-compatibility/
├── v1-to-v2.test.ts
└── deprecation.test.ts
\```

### Contract Test Example

\```typescript
import { contract } from '@pact-foundation/pact';

describe('User API Contract', () => {
contract('Consumer', 'Provider', (provider) => {
provider
.uponReceiving('a request to create a user')
.withRequest({
method: 'POST',
path: '/api/v1/users',
headers: { 'Content-Type': 'application/json' },
body: {
email: match.email('user@example.com'),
password: match.string('password123'),
name: match.string('John Doe')
}
})
.willRespondWith({
status: 201,
headers: { 'Content-Type': 'application/json' },
body: {
id: match.uuid('550e8400-e29b-41d4-a716-446655440000'),
email: match.email('user@example.com'),
name: match.string('John Doe')
}
});
});
});
\```

## OpenAPI Specification

### Generated OpenAPI 3.0 Spec

\```yaml
openapi: 3.0.0
info:
title: [Project Name] API
version: 2.0.0
description: |
REST API for [Project Name]

    ## Authentication
    All endpoints require Bearer token authentication except /auth/login

    ## Rate Limiting
    - 100 requests per minute for authenticated users
    - 20 requests per minute for unauthenticated users

contact:
email: api-support@example.com
license:
name: MIT

servers:

- url: https://api.example.com/v2
  description: Production
- url: https://staging-api.example.com/v2
  description: Staging
- url: http://localhost:3000/v2
  description: Development

security:

- bearerAuth: []

tags:

- name: Authentication
  description: User authentication endpoints
- name: Users
  description: User management
- name: Orders
  description: Order processing

paths:
/auth/login:
post:
tags: [Authentication]
summary: Authenticate user
security: [] # No auth required
requestBody:
required: true
content:
application/json:
schema:
$ref: '#/components/schemas/LoginRequest'
examples:
valid:
value:
email: user@example.com
password: SecurePass123
responses:
'200':
description: Successfully authenticated
content:
application/json:
schema:
$ref: '#/components/schemas/LoginResponse'
'401':
$ref: '#/components/responses/Unauthorized'
'429':
$ref: '#/components/responses/RateLimited'

/users:
get:
tags: [Users]
summary: List users
parameters: - $ref: '#/components/parameters/PageParam' - $ref: '#/components/parameters/LimitParam' - name: role
in: query
schema:
type: string
enum: [admin, user, guest]
responses:
'200':
description: User list
content:
application/json:
schema:
$ref: '#/components/schemas/UserList'

components:
schemas:
LoginRequest:
type: object
required: [email, password]
properties:
email:
type: string
format: email
password:
type: string
minLength: 8

    LoginResponse:
      type: object
      required: [token, expiresIn, user]
      properties:
        token:
          type: string
        refreshToken:
          type: string
        expiresIn:
          type: integer
        user:
          $ref: '#/components/schemas/User'

    User:
      type: object
      required: [id, email]
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
          format: email
        name:
          type: string

    Error:
      type: object
      required: [error]
      properties:
        error:
          type: object
          required: [code, message]
          properties:
            code:
              type: string
            message:
              type: string
            details:
              type: object

responses:
Unauthorized:
description: Authentication required
content:
application/json:
schema:
$ref: '#/components/schemas/Error'
example:
error:
code: UNAUTHORIZED
message: Authentication required

securitySchemes:
bearerAuth:
type: http
scheme: bearer
bearerFormat: JWT
\```

### API Documentation Site

Generated at: `/docs/api/`

- Interactive API explorer
- Code examples in multiple languages
- Webhook testing tools
- Change log tracking

## Recommendations

### Immediate Actions

1. **Standardize Response Format**

   - Adopt `{ data: T, error?: Error }` pattern
   - Update all endpoints within 30 days
   - Add response transformer middleware

2. **Version Properly**

   - Create v2 namespace for breaking changes
   - Add deprecation headers to v1
   - Set sunset dates for old versions

3. **Complete Contract Coverage**
   - Generate contract tests for remaining 30% endpoints
   - Add to CI/CD pipeline
   - Fail builds on contract violations

### Long-term Improvements

1. **API Gateway Implementation**

   - Centralized rate limiting
   - Request/response transformation
   - Version routing

2. **GraphQL Federation**

   - Combine REST and GraphQL
   - Single schema source of truth
   - Better client experience

3. **Event-Driven APIs**
   - WebSocket for real-time
   - Server-sent events for updates
   - Webhook management system

## Contract Validation CI/CD

\```yaml

# .github/workflows/api-contract.yml

name: API Contract Validation

on: [push, pull_request]

jobs:
contract-tests:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v2

      - name: Run contract tests
        run: npm run test:contracts

      - name: Validate OpenAPI spec
        run: npx @stoplight/spectral-cli lint openapi.yaml

      - name: Check breaking changes
        run: npx @openapitools/openapi-diff old-spec.yaml openapi.yaml

      - name: Generate documentation
        run: npm run docs:api:generate

      - name: Publish contract
        if: github.ref == 'refs/heads/main'
        run: npm run contracts:publish

\```

```

### Final Storage
```

memory_store_chunk
content="[Complete API contract analysis with schemas and compatibility report]"
session_id="[session]"
repository="github.com/org/repo"
tags=["api", "contracts", "analysis-complete", "openapi"]
files_modified=[".claude/API_CONTRACT.md", "openapi.yaml", "/tests/contracts/*"]

```

## Execution Priority

1. **Inventory First**: Map all endpoints before analyzing
2. **Schema Extraction**: Focus on request/response contracts
3. **Breaking Change Detection**: Check git history thoroughly
4. **Test Generation**: Create contract tests for critical paths
5. **Documentation**: Generate OpenAPI spec and examples

Begin by discovering all API endpoints and their current documentation status.
```
