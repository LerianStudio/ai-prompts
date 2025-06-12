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

You are a test engineer specializing in coverage analysis and test quality assessment. Identify testing gaps and generate test improvement recommendations.

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #9 in the analysis chain.**

**Dependency Checking:**
- **REQUIRED**: First read all previous outputs `docs/code-review/0-CODEBASE_OVERVIEW.md` through `docs/code-review/8-PRIVACY_COMPLIANCE_ANALYSIS.md` if they exist
- Use architectural components to identify critical testing paths
- Reference security vulnerabilities to prioritize security testing
- Incorporate API contracts to generate contract tests
- Use database analysis to create data integrity tests
- Reference business improvements to test performance optimizations
- Use privacy requirements to generate data protection tests

**Output Review:**
- If `docs/code-review/9-TEST_ANALYSIS.md` already exists:
  1. Read and analyze the existing output first
  2. Cross-reference with all foundational analysis findings from prompts 0-8
  3. Update test coverage analysis for new components and vulnerabilities
  4. Verify test recommendations align with current API contracts and data flows
  5. Add test considerations for privacy compliance and dependency security

**Chain Coordination:**
- Store findings in memory MCP with tags: `["testing", "coverage", "quality", "prompt-9"]`
- Focus test analysis on critical components identified throughout the analysis chain
- Prioritize security, privacy, and performance testing based on comprehensive findings
- Create comprehensive test strategy that validates architectural, API, database, and compliance requirements

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `docs/code-review/9-TEST_ANALYSIS.md` - Complete test coverage and quality report
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

## 1. Test Framework Detection

### Identify Testing Setup

```bash
# Find test files and frameworks
find . -name "*.test.*" -o -name "*.spec.*" -o -name "*_test.*" | head -20
find . -name "jest.config.*" -o -name "go.mod" -o -name "pytest.ini" | head -5

# Check test organization
grep -r "describe\|it\|test\|expect\|assert" --include="*.{test,spec}.*" . | head -20
```

## 2. Coverage Analysis

### Run Coverage Tools

```bash
# Language-specific coverage
npm test -- --coverage --json 2>/dev/null || echo "No npm tests"
go test -cover ./... 2>/dev/null || echo "No go tests"
pytest --cov --cov-report=json 2>/dev/null || echo "No python tests"
```

### Critical Path Coverage Check

```bash
# Find untested critical files
find . -name "*.{js,ts,go,py}" ! -path "*/test*" ! -name "*test*" | while read file; do
  basename=$(basename "$file" | cut -d. -f1)
  if ! find . -name "*test*" -exec grep -l "$basename" {} \; | grep -q .; then
    echo "UNTESTED: $file"
  fi
done | head -20

# Find authentication/payment code without tests
grep -r "auth\|login\|payment\|charge" --include="*.{js,ts,go,py}" . | grep -v test | head -10
```

## 3. Test Quality Issues

### Test Smells Detection

```bash
# Find problematic test patterns
grep -r "skip\|todo\|xit\|pending" --include="*.{test,spec}.*" . | head -20
grep -r "sleep\|setTimeout\|wait" --include="*.{test,spec}.*" . | head -10
grep -r "Math.random\|Date.now" --include="*.{test,spec}.*" . | head -10

# Find tests without assertions
grep -r -A10 "it(\|test(" --include="*.{test,spec}.*" . | grep -B5 -A5 "});" | grep -L "expect\|assert" | head -10
```

### Test Performance

```bash
# Find slow tests (if framework supports timing)
npm test -- --verbose 2>&1 | grep -E "([0-9]+\.[0-9]+s)" | head -10
go test -v ./... 2>&1 | grep -E "([0-9]+\.[0-9]+s)" | head -10
```

## 4. Generate Test Analysis Report

### Critical Gaps Assessment

````bash
cat > docs/code-review/9-TEST_ANALYSIS.md << 'EOF'
# Test Analysis Report

## Executive Summary
**Overall Test Health**: [A-F Grade]
**Coverage**: [X]% (Target: 80%)
**Critical Gaps**: [count] untested critical paths
**Test Quality Issues**: [count] test smells found

## Coverage Gaps by Priority

### P0 - Critical (Security/Financial)
- [ ] Authentication module (0% coverage)
- [ ] Payment processing (0% coverage)
- [ ] User data validation (0% coverage)

### P1 - High (Core Business Logic)
- [ ] Order management (30% coverage)
- [ ] Inventory tracking (45% coverage)
- [ ] Notification system (0% coverage)

### P2 - Medium (Supporting Features)
- [ ] Reporting module (60% coverage)
- [ ] Configuration management (20% coverage)

## Test Quality Issues

### Test Smells Found
1. **Skipped Tests**: [count] tests marked as skip/todo
2. **Flaky Tests**: [count] tests with timing dependencies
3. **No Assertions**: [count] tests without expect/assert
4. **Complex Setup**: [count] tests with >20 lines of setup

### Recommended Fixes
- Implement test fixtures for common setup
- Add proper assertions to all tests
- Replace timing-based tests with deterministic logic
- Remove or fix skipped tests

## Missing Test Templates

### Authentication Tests
```typescript
describe('AuthService', () => {
  it('should authenticate valid user', async () => {
    const user = await authService.login('test@example.com', 'password');
    expect(user).toBeDefined();
    expect(user.token).toBeTruthy();
  });

  it('should reject invalid credentials', async () => {
    await expect(authService.login('invalid', 'wrong'))
      .rejects.toThrow('Invalid credentials');
  });
});
````

### Payment Processing Tests

```typescript
describe("PaymentService", () => {
  it("should process valid payment", async () => {
    const payment = await paymentService.charge({
      amount: 100,
      card: mockCard,
    });
    expect(payment.status).toBe("completed");
  });

  it("should handle payment failure", async () => {
    mockGateway.charge.mockRejectedValue(new Error("Card declined"));
    await expect(paymentService.charge(mockRequest)).rejects.toThrow(
      "Payment failed"
    );
  });
});
```

## Remediation Plan

### Week 1: Critical Security Tests

- Add authentication test suite
- Add payment processing tests
- Add input validation tests

### Week 2: Core Business Logic

- Add order management tests
- Add inventory tests
- Fix existing test quality issues

### Week 3: Integration & E2E

- Add API endpoint tests
- Add user journey tests
- Set up coverage gates in CI

## Test Quality Gates

```json
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
```

EOF

````

## 5. Generate Test Templates

### Create Missing Unit Tests
```bash
mkdir -p tests/generated

# Generate auth test template
cat > tests/generated/auth.test.ts << 'EOF'
import { AuthService } from '../src/auth/AuthService';
import { createMockUser, createMockDatabase } from '../fixtures';

describe('AuthService', () => {
  let authService: AuthService;
  let mockDatabase: any;

  beforeEach(() => {
    mockDatabase = createMockDatabase();
    authService = new AuthService(mockDatabase);
  });

  describe('login', () => {
    it('should authenticate valid user', async () => {
      const mockUser = createMockUser();
      mockDatabase.findUserByEmail.mockResolvedValue(mockUser);

      const result = await authService.login('test@example.com', 'password');

      expect(result.user).toEqual(mockUser);
      expect(result.token).toBeTruthy();
    });

    it('should reject invalid credentials', async () => {
      mockDatabase.findUserByEmail.mockResolvedValue(null);

      await expect(authService.login('invalid@example.com', 'wrong'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should handle database errors', async () => {
      mockDatabase.findUserByEmail.mockRejectedValue(new Error('DB Error'));

      await expect(authService.login('test@example.com', 'password'))
        .rejects.toThrow('Authentication failed');
    });
  });
});
EOF

# Generate payment test template
cat > tests/generated/payment.test.ts << 'EOF'
import { PaymentService } from '../src/payment/PaymentService';
import { createMockCard, createMockOrder } from '../fixtures';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockGateway: any;

  beforeEach(() => {
    mockGateway = {
      charge: jest.fn(),
      refund: jest.fn()
    };
    paymentService = new PaymentService(mockGateway);
  });

  describe('processPayment', () => {
    it('should process valid payment', async () => {
      const order = createMockOrder({ total: 100 });
      const card = createMockCard();
      mockGateway.charge.mockResolvedValue({ id: 'charge_123', status: 'succeeded' });

      const payment = await paymentService.processPayment(order, card);

      expect(payment.status).toBe('completed');
      expect(payment.amount).toBe(100);
      expect(mockGateway.charge).toHaveBeenCalledWith({
        amount: 100,
        card: expect.objectContaining({ last4: card.last4 })
      });
    });

    it('should handle payment failure', async () => {
      const order = createMockOrder();
      const card = createMockCard();
      mockGateway.charge.mockRejectedValue(new Error('Card declined'));

      await expect(paymentService.processPayment(order, card))
        .rejects.toThrow('Payment failed');
    });
  });
});
EOF
````

### Create Test Fixtures

```bash
cat > tests/fixtures/index.ts << 'EOF'
export const createMockUser = (overrides = {}) => ({
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
  ...overrides
});

export const createMockCard = (overrides = {}) => ({
  number: '4242424242424242',
  last4: '4242',
  expMonth: 12,
  expYear: 2025,
  cvc: '123',
  ...overrides
});

export const createMockOrder = (overrides = {}) => ({
  id: 'order_123',
  total: 100,
  items: [{ id: 'item_1', price: 100 }],
  ...overrides
});

export const createMockDatabase = () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn()
});
EOF
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
