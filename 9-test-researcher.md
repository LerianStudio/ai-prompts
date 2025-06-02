You are a world-class test engineer with expertise in test-driven development, code coverage analysis, and quality assurance. Conduct a thorough test analysis building on the existing architecture documentation.

## 0. Session & Context Initialization

```
# Initialize test analysis session
mcp__memory__memory_tasks operation="session_create" options='{"session_id":"test-researcher-$(date +%s)","repository":"github.com/org/repo"}'

# Load prior architecture analysis
cat .claude/ARCHITECTURE_ANALYSIS.md
mcp__memory__memory_read operation="search" options='{"query":"architecture components endpoints","repository":"github.com/org/repo"}'
mcp__memory__memory_read operation="get_context" options='{"repository":"github.com/org/repo"}'

# Find similar bug patterns across repositories
mcp__memory__memory_read operation="find_similar" options='{"problem":"test coverage gaps and quality issues","repository":"github.com/org/repo"}'
```

## 1. Test Discovery & Mapping

### Test Framework Detection

```
# Identify test frameworks and configuration
find . -name "*.test.*" -o -name "*.spec.*" -o -name "*_test.*" | head -20
find . -name "jest.config.*" -o -name "mocha.opts" -o -name "pytest.ini" -o -name "go.mod"
grep -r "describe\|it\|test\|expect\|assert" --include="*.{test,spec}.*" . | head -20
```

### Test Organization Analysis

- Map test files to source files
- Identify test naming conventions
- Detect test directory structure
- Find integration vs unit tests
- Locate E2E test suites

```
# Generate test coverage map
find . -name "*.js" -o -name "*.ts" -o -name "*.go" -o -name "*.py" | grep -v test | while read src; do
  test_file=$(echo $src | sed 's/\.\(js\|ts\|go\|py\)$/.test.\1/')
  if [ -f "$test_file" ]; then echo "✓ $src"; else echo "✗ $src"; fi
done
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"Test framework: [detected]. Coverage: [X%]. Test files: [count]. Untested files: [list]","session_id":"test-researcher-$(date +%s)","repository":"github.com/org/repo","tags":["testing","coverage","test-discovery"]}'
```

## 2. Coverage Analysis

### Quantitative Coverage

```
# Run coverage tools based on detected framework
npm test -- --coverage --json  # JavaScript/TypeScript
go test -cover -coverprofile=coverage.out ./...  # Go
pytest --cov --cov-report=json  # Python
```

### Critical Path Coverage

Based on architecture analysis, check coverage for:

- [ ] Authentication flows
- [ ] Payment processing
- [ ] Data validation
- [ ] Error handling
- [ ] API endpoints
- [ ] Business logic core

### Coverage Gaps by Component

```
# Map uncovered code by criticality
grep -r "class\|function\|const.*=" --include="*.{js,ts,go,py}" . | grep -v test > all_functions.txt
# Compare with test assertions
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"Critical paths without tests: [list]. Coverage by component: [breakdown]","session_id":"test-researcher-$(date +%s)","repository":"github.com/org/repo","tags":["testing","coverage-gaps","critical-paths"]}'
```

## 3. Test Quality Assessment

### Test Smell Detection

```
# Find test quality issues
grep -r "skip\|todo\|xit\|it\.skip" --include="*.{test,spec}.*" .  # Skipped tests
grep -r "any\[\]\|as any" --include="*.{test,spec}.ts" .  # Type safety issues
grep -r "sleep\|setTimeout\|wait" --include="*.{test,spec}.*" .  # Timing dependencies
grep -r "Math\.random\|Date\.now" --include="*.{test,spec}.*" .  # Non-deterministic
```

### Anti-patterns to Find

- [ ] Tests with no assertions
- [ ] Overly complex test setups
- [ ] Hardcoded test data
- [ ] Tests testing implementation details
- [ ] Flaky tests (timing/order dependent)
- [ ] Tests with external dependencies

### Test Maintainability Metrics

```
# Calculate test complexity
find . -name "*.test.*" -o -name "*.spec.*" | xargs wc -l | sort -rn | head -20
# Find duplicate test code
grep -r "beforeEach\|beforeAll\|setup" --include="*.{test,spec}.*" . | sort | uniq -c | sort -rn
```

```
mcp__memory__memory_create operation="store_decision" options='{"decision":"Test quality grade: [A-F]","rationale":"Found [X] test smells, [Y]% duplicate setup code, [Z] flaky tests","context":"Most problematic: [test file] with [issues]","session_id":"test-researcher-$(date +%s)","repository":"github.com/org/repo"}'
```

## 4. Test Execution Analysis

### Performance Profiling

```
# Find slow tests
npm test -- --verbose 2>&1 | grep -E "([0-9]+\.[0-9]+s)"
go test -v ./... | grep -E "([0-9]+\.[0-9]+s)"
pytest --durations=20
```

### Test Suite Optimization

- [ ] Identify slowest test files
- [ ] Find redundant test cases
- [ ] Detect over-mocking
- [ ] Analyze test parallelization opportunities
- [ ] Check test database usage

### Flaky Test Detection

```
# Run tests multiple times to find flaky ones
for i in {1..10}; do
  echo "Run $i:"
  npm test 2>&1 | grep -E "(✓|✗|FAIL|PASS)"
done | sort | uniq -c | sort -rn
```

## 5. Test Generation Opportunities

### Missing Unit Tests

For each untested function, generate test template:

```typescript
// For function: calculateDiscount(price: number, discountPercent: number): number

describe("calculateDiscount", () => {
  it("should calculate discount correctly", () => {
    expect(calculateDiscount(100, 10)).toBe(90);
  });

  it("should handle zero price", () => {
    expect(calculateDiscount(0, 10)).toBe(0);
  });

  it("should handle zero discount", () => {
    expect(calculateDiscount(100, 0)).toBe(100);
  });

  it("should handle negative inputs", () => {
    expect(() => calculateDiscount(-100, 10)).toThrow();
  });

  it("should handle discount > 100%", () => {
    expect(() => calculateDiscount(100, 150)).toThrow();
  });
});
```

### Missing Integration Tests

Based on API endpoints without tests:

```typescript
// For endpoint: POST /api/users

describe("POST /api/users", () => {
  it("should create user with valid data", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ email: "test@example.com", password: "secure123" });

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe("test@example.com");
  });

  it("should reject invalid email", async () => {
    const response = await request(app)
      .post("/api/users")
      .send({ email: "invalid", password: "secure123" });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_EMAIL");
  });

  // Add more test cases...
});
```

```
mcp__memory__memory_create operation="store_chunk" options='{"content":"Test generation targets: [prioritized list]. Templates generated: [count]","session_id":"test-researcher-$(date +%s)","repository":"github.com/org/repo","tags":["testing","test-generation","templates"]}'
```

## 6. Test Strategy Recommendations

### Testing Pyramid Analysis

```
# Count test types
unit_tests=$(find . -name "*.test.*" -o -name "*.spec.*" | grep -v "e2e\|integration" | wc -l)
integration_tests=$(find . -path "*/integration/*" -name "*test*" | wc -l)
e2e_tests=$(find . -path "*/e2e/*" -name "*test*" | wc -l)
```

### Recommended Distribution

- Unit Tests: 70% (fast, isolated)
- Integration Tests: 20% (component interaction)
- E2E Tests: 10% (critical user paths)

## 7. Test Analysis Documentation

Create `.claude/TEST_ANALYSIS.md`:

````markdown
# Test Analysis: [Project Name]

## Executive Summary

**Overall Test Health**: [A-F Grade]

**Coverage**: [X]% (Target: 80%)
**Test Execution Time**: [Y] seconds
**Flaky Tests**: [Z] identified

**Critical Gaps**:

1. [Component] - 0% coverage, handles payment processing
2. [API Endpoint] - No integration tests
3. [Error Paths] - Untested error scenarios

## Table of Contents

- [Coverage Report](#coverage-report)
- [Test Quality Analysis](#test-quality-analysis)
- [Performance Analysis](#performance-analysis)
- [Missing Tests](#missing-tests)
- [Test Generation Plan](#test-generation-plan)
- [Recommendations](#recommendations)

## Coverage Report

### Overall Coverage

\```mermaid
pie title "Code Coverage by Type"
"Covered" : 67
"Uncovered" : 33
\```

### Coverage by Component

| Component       | Lines | Coverage | Critical | Priority |
| --------------- | ----- | -------- | -------- | -------- |
| Authentication  | 450   | 23%      | Yes      | P0       |
| User Service    | 680   | 78%      | Yes      | P2       |
| Payment Service | 890   | 12%      | Yes      | P0       |
| Reporting       | 234   | 91%      | No       | P3       |
| Utils           | 567   | 45%      | No       | P1       |

### Uncovered Critical Paths

\```mermaid
graph LR
A[User Login] -->|✗| B[Validate Credentials]
B -->|✗| C[Generate Token]
C -->|✗| D[Set Session]

    E[Process Payment] -->|✗| F[Validate Card]
    F -->|✗| G[Charge Card]
    G -->|✗| H[Update Order]

    style B fill:#ff6b6b
    style C fill:#ff6b6b
    style F fill:#ff6b6b
    style G fill:#ff6b6b

\```

## Test Quality Analysis

### Test Smells Found

#### 1. Hardcoded Test Data

**Count**: 156 occurrences
**Example**: `tests/user.test.js:45`
\```javascript
// Bad
const user = {
id: 123,
email: 'test@test.com',
password: 'password123'
};

// Good
const user = createMockUser();
\```

#### 2. No Assertions

**Count**: 23 tests
**Example**: `tests/api.test.js:89`
\```javascript
// Bad
it('should process order', async () => {
await processOrder(order);
// No assertion!
});

// Good
it('should process order', async () => {
const result = await processOrder(order);
expect(result.status).toBe('completed');
expect(result.id).toBeDefined();
});
\```

#### 3. Flaky Tests

**Count**: 8 tests
**Common Causes**:

- Race conditions (4 tests)
- Time-dependent logic (3 tests)
- Test order dependencies (1 test)

**Example Fix**:
\```javascript
// Bad - Flaky
it('should expire token', async () => {
createToken();
await sleep(1000);
expect(isTokenExpired()).toBe(true);
});

// Good - Deterministic
it('should expire token', async () => {
const token = createToken({ expiresIn: -1 });
expect(isTokenExpired(token)).toBe(true);
});
\```

### Test Complexity Metrics

| Metric          | Current | Target | Status |
| --------------- | ------- | ------ | ------ |
| Avg Setup Lines | 47      | <20    | ⚠️     |
| Avg Test Lines  | 31      | <30    | ✓      |
| Mock Depth      | 4.2     | <3     | ⚠️     |
| Assertions/Test | 1.8     | >3     | ⚠️     |

## Performance Analysis

### Slowest Test Suites

\```mermaid
gantt
title Test Execution Time (seconds)
dateFormat X
axisFormat %s

    section Unit Tests
    UserService      :0, 3
    AuthService      :3, 2
    OrderService     :5, 4

    section Integration
    API Tests        :9, 8
    Database Tests   :17, 12

    section E2E
    User Journey     :29, 15
    Checkout Flow    :44, 18

\```

### Optimization Opportunities

1. **Parallelize Test Suites**
   - Current: Sequential execution (62s total)
   - Potential: Parallel execution (~25s total)
2. **Database Test Optimization**

   - Current: Full DB reset per test
   - Proposed: Transaction rollback pattern
   - Savings: 8s per test file

3. **Mock Heavy Services**
   - Email service calls: +2s per test
   - External API calls: +3s per test
   - File I/O operations: +1s per test

## Missing Tests

### Critical Missing Unit Tests

#### Authentication Module

\```typescript
// auth.service.ts - 0% coverage
export class AuthService {
async validateCredentials(email: string, password: string): Promise<User>
async generateToken(user: User): Promise<string>
async refreshToken(token: string): Promise<string>
async revokeToken(token: string): Promise<void>
async validateToken(token: string): Promise<TokenPayload>
}

// Needed tests:

- ✗ Valid credentials should return user
- ✗ Invalid credentials should throw
- ✗ Token generation with proper claims
- ✗ Token refresh with validity check
- ✗ Token revocation
- ✗ Expired token handling
  \```

#### Payment Processing

\```typescript
// payment.service.ts - 12% coverage
export class PaymentService {
async processPayment(order: Order, card: Card): Promise<Payment>
async refundPayment(paymentId: string, amount?: number): Promise<Refund>
async validateCard(card: Card): Promise<boolean>
async handleWebhook(payload: any): Promise<void>
}

// Critical missing tests:

- ✗ Successful payment flow
- ✗ Failed payment handling
- ✗ Partial refund logic
- ✗ Webhook signature validation
- ✗ Idempotency handling
  \```

### Missing Integration Tests

#### API Endpoints Without Tests

| Method | Endpoint               | Priority | Reason             |
| ------ | ---------------------- | -------- | ------------------ |
| POST   | /api/auth/login        | P0       | Core functionality |
| POST   | /api/payments          | P0       | Financial risk     |
| DELETE | /api/users/:id         | P0       | Data deletion      |
| POST   | /api/orders/:id/refund | P0       | Financial risk     |
| GET    | /api/reports/financial | P1       | Business critical  |

### Missing E2E Tests

Critical User Journeys:

1. **Complete Purchase Flow**
   - Browse → Add to Cart → Checkout → Payment → Confirmation
2. **User Registration & Verification**

   - Register → Email Verify → Login → Profile Setup

3. **Order Management**
   - View Orders → Request Refund → Track Status

## Test Generation Plan

### Phase 1: Critical Security & Financial (Week 1)

\```typescript
// Generated test template for payment processing
describe('PaymentService', () => {
describe('processPayment', () => {
it('should process valid payment', async () => {
const order = createMockOrder({ total: 100 });
const card = createMockCard({ valid: true });

      const payment = await paymentService.processPayment(order, card);

      expect(payment).toMatchObject({
        status: 'completed',
        amount: 100,
        orderId: order.id
      });
      expect(mockPaymentGateway.charge).toHaveBeenCalledWith({
        amount: 100,
        card: expect.objectContaining({ last4: card.last4 })
      });
    });

    it('should handle payment failure gracefully', async () => {
      const order = createMockOrder();
      const card = createMockCard({ valid: false });

      await expect(paymentService.processPayment(order, card))
        .rejects.toThrow('Payment failed');

      expect(order.status).toBe('payment_failed');
      expect(mockLogger.error).toHaveBeenCalled();
    });

    // Generate 10-15 more test cases...

});
});
\```

### Phase 2: Core Business Logic (Week 2)

- Order management tests
- Inventory management tests
- User service tests
- Notification system tests

### Phase 3: API Integration Tests (Week 3)

- All REST endpoints
- GraphQL resolvers
- WebSocket handlers
- Webhook endpoints

## Recommendations

### Immediate Actions

1. **Set Coverage Gates**
   \```json
   {
   "jest": {
   "coverageThreshold": {
   "global": {
   "branches": 80,
   "functions": 80,
   "lines": 80,
   "statements": 80
   }
   }
   }
   }
   \```

2. **Implement Test Fixtures**
   \```typescript
   // fixtures/index.ts
   export const fixtures = {
   user: () => ({ id: uuid(), email: faker.email(), ... }),
   order: () => ({ id: uuid(), items: [], ... }),
   // ... more fixtures
   };
   \```

3. **Add Pre-commit Hooks**
   \```bash
   # .husky/pre-commit
   npm test -- --coverage --changedSince=main
````

### Testing Best Practices

#### Test Structure Template

\```typescript
describe('[Component/Function Name]', () => {
// Arrange
let service: Service;
let mockDependency: jest.Mocked<Dependency>;

beforeEach(() => {
// Setup
});

afterEach(() => {
// Cleanup
});

describe('[Method Name]', () => {
it('should [expected behavior] when [condition]', () => {
// Arrange
const input = createTestInput();

      // Act
      const result = service.method(input);

      // Assert
      expect(result).toEqual(expectedOutput);
      expect(mockDependency.called).toHaveBeenCalledWith(input);
    });

});
});
\```

### Continuous Improvement

1. **Weekly Test Reviews**

   - Review new uncovered code
   - Fix flaky tests
   - Optimize slow tests

2. **Monthly Test Audits**

   - Update test strategies
   - Review test quality metrics
   - Refactor test utilities

3. **Quarterly Goals**
   - Q1: Achieve 80% coverage
   - Q2: Reduce test time by 50%
   - Q3: Zero flaky tests
   - Q4: Full E2E automation

## Testing Maturity Model

\```mermaid
graph TB
subgraph "Current State (Level 2)"
A[Some Unit Tests]
B[Manual Testing]
C[Basic CI]
end

    subgraph "Target State (Level 4)"
        D[80%+ Coverage]
        E[Automated E2E]
        F[Performance Tests]
        G[Security Tests]
        H[Continuous Testing]
    end

    A --> D
    B --> E
    C --> F & G & H

\```

## Appendix

### Test Execution Commands

\```bash

# Run all tests with coverage

npm test -- --coverage

# Run specific test file

npm test -- auth.test.js

# Run tests in watch mode

npm test -- --watch

# Run tests with debugging

node --inspect-brk ./node_modules/.bin/jest --runInBand

# Generate coverage report

npm test -- --coverage --coverageReporters=html
\```

### Generated Test Files

- `/tests/generated/auth.test.ts` - 245 lines
- `/tests/generated/payment.test.ts` - 312 lines
- `/tests/generated/api.test.ts` - 489 lines
- `/tests/fixtures/index.ts` - 156 lines
- `/tests/helpers/index.ts` - 89 lines

```

### Final Storage & Session Completion
```
# Store final test analysis
mcp__memory__memory_create operation="store_chunk" options='{"content":"[Complete test analysis with coverage data and quality metrics]","session_id":"test-researcher-$(date +%s)","repository":"github.com/org/repo","tags":["testing","analysis-complete","coverage","quality"],"files_modified":[".claude/TEST_ANALYSIS.md","/tests/generated/*"]}'

# Create testing analysis thread
mcp__memory__memory_create operation="create_thread" options='{"name":"Test Coverage & Quality Analysis","description":"Complete testing analysis with coverage gaps, quality metrics, and generation plan","chunk_ids":["[test_discovery_chunk_id]","[coverage_chunk_id]","[quality_chunk_id]","[generation_chunk_id]"],"repository":"github.com/org/repo"}'

# Find similar bug patterns for test improvement
mcp__memory__memory_read operation="find_similar" options='{"problem":"test flakiness and coverage gaps","repository":"github.com/org/repo"}'

# Get task completion statistics for testing
mcp__memory__memory_tasks operation="task_completion_stats" options='{"repository":"github.com/org/repo"}'

# Generate citations for testing best practices
mcp__memory__memory_system operation="generate_citations" options='{"query":"test coverage quality recommendations","chunk_ids":["[all_test_chunk_ids]"],"repository":"github.com/org/repo"}'

# Analyze workflow completion
mcp__memory__memory_tasks operation="workflow_analyze" options='{"session_id":"test-researcher-$(date +%s)","repository":"github.com/org/repo"}'

# End test analysis session
mcp__memory__memory_tasks operation="session_end" options='{"session_id":"test-researcher-$(date +%s)","repository":"github.com/org/repo"}'
```

## Execution Notes

1. **Start with Coverage**: Get baseline metrics first
2. **Focus on Critical**: Test payment/auth paths first
3. **Automate Generation**: Use templates for consistency
4. **Track Progress**: Update coverage after each sprint
5. **Prevent Regression**: Add tests for every bug fix

Begin by running coverage analysis and mapping test files to source files.
```
