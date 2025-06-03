You are a production readiness auditor. Identify incomplete implementations, security issues, and production blockers across all languages.

## 🔗 Prompt Chaining Rules

**CRITICAL: This is prompt #11 in the analysis chain.**

**Dependency Checking:**
- **REQUIRED**: First read ALL previous outputs `.claude/0-CODEBASE_OVERVIEW.md` through `.claude/10-DOCUMENTATION.md` if they exist
- Use architectural component analysis to focus readiness assessment on critical paths
- Reference security vulnerabilities from prompt #2 to prioritize security blockers
- Use API contract analysis from prompt #4 to validate API readiness
- Reference database optimization from prompt #5 to check data layer readiness
- Use observability gaps from prompt #6 to ensure monitoring is production-ready
- Reference dependency vulnerabilities from prompt #7 to identify supply chain blockers
- Use privacy compliance from prompt #8 to ensure regulatory readiness
- Reference test coverage from prompt #9 to validate quality gates
- Use documentation status from prompt #10 to ensure operational readiness

**Output Review:**
- If `.claude/11-READINESS_AUDIT.md` already exists:
  1. Read and analyze the existing output first
  2. Cross-reference with all findings from the comprehensive analysis chain
  3. Update production blocker assessment based on current state
  4. Verify readiness status reflects latest architectural and security changes
  5. Add new production concerns based on chain analysis findings

**Chain Coordination:**
- Store findings in memory MCP with tags: `["production-readiness", "audit", "blockers", "prompt-11"]`
- Create comprehensive readiness assessment that integrates all previous analysis findings
- Focus on deployment blockers identified across the entire analysis chain
- Provide final go/no-go recommendation based on complete system analysis

## File Organization

**REQUIRED OUTPUT LOCATIONS:**

- `.claude/11-READINESS_AUDIT.md` - Complete audit report with findings
- `.claude/11-CRITICAL_ISSUES.md` - Priority-ranked critical issues

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

## 1. Critical Security Scan

### Hardcoded Secrets Detection

```bash
# Find secrets in code
grep -r -i "password.*=.*['\"].*['\"]" --include="*.{js,ts,go,py,java}" . | head -20
grep -r -i "secret.*=.*['\"].*['\"]" --include="*.{js,ts,go,py,java}" . | head -20
grep -r -i "api.*key.*=.*['\"].*['\"]" --include="*.{js,ts,go,py,java}" . | head -20

# Find missing environment variable usage
grep -r "process\.env\|os\.Getenv\|System\.getenv" --include="*.{js,ts,go,py,java}" . | wc -l
```

### Authentication Bypass Vulnerabilities

```bash
# Find missing authentication checks
grep -r "app\.\|router\.\|HandleFunc" --include="*.{js,ts,go,py,java}" . | grep -v "auth\|login\|token" | head -20

# Find admin endpoints without auth
grep -r "/admin\|/api/admin" --include="*.{js,ts,go,py,java}" . | head -10
```

## 2. TODO & Incomplete Implementation Scan

### Critical TODO Discovery

```bash
# Find blocking TODOs
grep -r -i "todo.*critical\|todo.*prod\|todo.*fix.*before" --include="*.{js,ts,go,py,java}" . | head -30

# Find placeholder implementations
grep -r "not implemented\|placeholder\|coming soon\|throw.*Error\|panic(\|raise NotImplementedError" --include="*.{js,ts,go,py,java}" . | head -30

# Find empty function bodies
grep -r -A2 "function.*{$\|def.*:$\|func.*{$" --include="*.{js,ts,go,py,java}" . | grep -A1 -B1 "^\s*}$\|^\s*pass$\|^\s*return$" | head -20
```

### Language-Specific Incomplete Patterns

```bash
# JavaScript/TypeScript issues
grep -r "console\.log\|debugger\|any\[\]\|@ts-ignore" --include="*.{js,ts}" . | head -20

# Go issues
grep -r "fmt\.Println\|log\.Fatal\|panic(" --include="*.go" . | head -20

# Python issues
grep -r "print(\|pass$" --include="*.py" . | head -20

# Java issues
grep -r "System\.out\.println\|throw new UnsupportedOperationException" --include="*.java" . | head -20
```

## 3. Missing Error Handling

### Unhandled Errors Detection

```bash
# Find missing try-catch blocks
grep -r -A5 "fetch\|http\|axios\|request" --include="*.{js,ts}" . | grep -v "catch\|try" | head -20

# Find missing Go error handling
grep -r -A2 "err.*:=" --include="*.go" . | grep -v "if err" | head -20

# Find unhandled exceptions
grep -r -B2 -A2 "throw\|raise" --include="*.{js,ts,py,java}" . | grep -v "try\|catch\|except" | head -20
```

## 4. Configuration & Environment Issues

### Missing Production Config

```bash
# Check for hardcoded URLs
grep -r "http://\|https://" --include="*.{js,ts,go,py,java}" . | grep -v "localhost\|example\.com" | head -20

# Find missing environment configs
[ ! -f ".env.example" ] && echo "ERROR: Missing .env.example"
[ ! -f "Dockerfile" ] && echo "WARNING: Missing Dockerfile"
find . -name "*prod*" -o -name "*production*" | grep -E "\.(json|yml|yaml|env)$" | wc -l
```

## 5. Critical Test Coverage Gaps

### Untested Critical Code

```bash
# Find core files without tests
find . -name "*.{js,ts,go,py,java}" ! -path "*/test*" ! -name "*test*" | while read file; do
  basename=$(basename "$file")
  if ! find . -name "*test*" -exec grep -l "$basename" {} \; | grep -q .; then
    echo "No tests: $file"
  fi
done | head -20

# Find skipped tests
grep -r "skip\|pending\|todo\|xit\|xdescribe" --include="*.{test,spec}.{js,ts,go,py}" . | head -20
```

## 6. Production Readiness Check

### Essential Production Components

```bash
# Health check endpoint
grep -r "health\|status\|ping" --include="*.{js,ts,go,py,java}" . | wc -l

# Graceful shutdown
grep -r "SIGTERM\|SIGINT\|shutdown" --include="*.{js,ts,go,py,java}" . | wc -l

# Structured logging
grep -r "console\.log\|fmt\.Println\|print(" --include="*.{js,ts,go,py,java}" ./src ./lib ./app 2>/dev/null | wc -l
```

## 7. Generate Critical Issues Report

### Priority-Ranked Issues

```bash
cat > .claude/CRITICAL_ISSUES.md << 'EOF'
# Critical Production Blockers

## P0 - IMMEDIATE (Deploy Blockers)
- [ ] Hardcoded secrets in source code
- [ ] Missing authentication on admin endpoints
- [ ] Unhandled database errors
- [ ] SQL injection vulnerabilities

## P1 - HIGH (Security & Data)
- [ ] Missing input validation
- [ ] Authentication bypass possible
- [ ] Unencrypted sensitive data
- [ ] Missing error boundaries

## P2 - MEDIUM (Functionality)
- [ ] Incomplete payment processing
- [ ] Missing notification system
- [ ] Placeholder tax calculations
- [ ] No graceful degradation

## P3 - LOW (Quality)
- [ ] Debug logging in production
- [ ] Missing test coverage
- [ ] Outdated dependencies
- [ ] Code duplication
EOF
```

### Full Audit Report

```bash
cat > .claude/READINESS_AUDIT.md << 'EOF'
# Production Readiness Audit

## Executive Summary
**Status**: 🔴 NOT READY
**Critical Issues**: [COUNT]
**Security Risk**: HIGH
**Estimated Fix Time**: [WEEKS] weeks

## Critical Findings

### 🔴 DEPLOY BLOCKERS
1. **Hardcoded Database Credentials** - [FILE:LINE]
2. **No Authentication on Admin Routes** - [FILE:LINE]
3. **Unhandled Payment Errors** - [FILE:LINE]

### 🟡 HIGH PRIORITY
1. **SQL Injection Vulnerabilities** - [FILE:LINE]
2. **Missing Input Validation** - [FILE:LINE]
3. **Incomplete Core Features** - [FILE:LINE]

## Remediation Plan

### Week 1: Security Fixes
- Remove hardcoded secrets
- Add authentication middleware
- Fix SQL injection points
- Implement input validation

### Week 2: Core Functionality
- Complete payment processing
- Add error handling
- Implement health checks
- Fix incomplete features

### Week 3: Testing & Quality
- Add critical path tests
- Remove debug logging
- Set up monitoring
- Validate production config

## Next Steps
1. **STOP** current deployment plans
2. **FIX** P0 security issues immediately
3. **TEST** all fixes thoroughly
4. **DEPLOY** only after all P0/P1 issues resolved
EOF
```

```
memory_store_chunk
  content="Production readiness audit completed. Critical blockers: [count]. Security issues: [count]. Estimated remediation: [weeks] weeks"
  session_id="audit-$(date +%s)"
  repository="github.com/org/repo"
  tags=["audit", "production-readiness", "security", "critical-issues"]

memory_store_decision
  decision="Production deployment: BLOCKED"
  rationale="Critical security vulnerabilities and incomplete implementations found. [count] P0 issues must be fixed before production"
  context="Comprehensive audit reveals significant production readiness gaps"
  session_id="audit-$(date +%s)"
  repository="github.com/org/repo"

memory_tasks session_end session_id="audit-$(date +%s)" repository="github.com/org/repo"
```

## Execution Notes

- **Security First**: Scan for hardcoded secrets and authentication bypasses
- **Focus Critical Path**: Prioritize payment processing, user management, admin functions
- **Language Agnostic**: Covers Go, JavaScript/TypeScript, Python, Java patterns
- **Actionable Results**: Provides specific file:line references and fix examples
- **Risk-Based Priority**: P0 (deploy blockers) → P1 (security) → P2 (functionality) → P3 (quality)
