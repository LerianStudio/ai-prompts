You are a world-class security researcher with expertise in application security, penetration testing, and secure code review. Conduct a thorough security analysis building on the existing architecture documentation.

## 0. Context Loading

```
# Load prior architecture analysis
cat .claude/ARCHITECTURE_ANALYSIS.md
memory_search query="architecture component API" repository="github.com/org/repo"
memory_get_context repository="github.com/org/repo"
```

## 1. Attack Surface Mapping

### Entry Point Analysis

Based on architecture analysis, identify:

- All external APIs (REST, GraphQL, WebSocket)
- File upload endpoints
- Authentication endpoints
- Public vs authenticated routes
- Third-party integrations

```
grep -r "router\|route\|endpoint\|api" --include="*.{js,ts,go,py,java}" .
grep -r "upload\|file\|multipart" --include="*.{js,ts,go,py,java}" .
```

### Input Vectors

- HTTP headers, cookies, query params
- Request bodies (JSON, XML, multipart)
- WebSocket messages
- File uploads
- Environment variables
- Database queries
- External API responses

```
memory_store_chunk
  content="Attack surface: [endpoints list]. Input vectors: [detailed mapping]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["security", "attack-surface", "entry-points"]
```

## 2. Vulnerability Pattern Detection

### Authentication & Authorization

```
# Search for auth patterns
grep -r "auth\|login\|session\|jwt\|token" --include="*.{js,ts,go,py,java}" .
grep -r "permission\|role\|rbac\|acl" --include="*.{js,ts,go,py,java}" .
```

Check for:

- [ ] Hardcoded credentials: `password.*=.*["']`
- [ ] Weak session management: predictable tokens
- [ ] Missing auth checks: direct object references
- [ ] JWT vulnerabilities: none algorithm, weak secrets
- [ ] Privilege escalation: role manipulation

### Input Validation & Injection

```
# Search for dangerous patterns
grep -r "exec\|eval\|Function\|setTimeout.*\(" --include="*.{js,ts,py}" .
grep -r "query.*\+\|WHERE.*\$\|SELECT.*\+" --include="*.{js,ts,go,py,java}" .
grep -r "innerHTML\|dangerouslySetInnerHTML" --include="*.{js,ts,jsx,tsx}" .
```

Check for:

- [ ] SQL injection: string concatenation in queries
- [ ] NoSQL injection: `$where`, `mapReduce` with user input
- [ ] Command injection: `exec`, `spawn` with user input
- [ ] XSS: unescaped output, `innerHTML`
- [ ] XXE: XML parsing without disable external entities
- [ ] LDAP/XPath injection: string building

### Cryptographic Issues

```
# Search for crypto usage
grep -r "crypto\|cipher\|encrypt\|hash\|md5\|sha1" --include="*.{js,ts,go,py,java}" .
grep -r "random\|Math\.random\|rand\(" --include="*.{js,ts,go,py,java}" .
```

Check for:

- [ ] Weak algorithms: MD5, SHA1, DES
- [ ] Hardcoded keys/salts
- [ ] Insufficient randomness: Math.random for security
- [ ] Missing encryption: sensitive data in plaintext
- [ ] Poor key management: keys in code/config

```
memory_store_chunk
  content="Vulnerability findings: [categorized list with file:line refs]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["security", "vulnerabilities", "severity:[high|medium|low]"]
```

## 3. Dependency Security Analysis

### Package Scanning

```
# Check for vulnerable dependencies
npm audit --json  # for Node.js
safety check --json  # for Python
go list -json -m all | nancy sleuth  # for Go
```

### Manual Review

- Check package.json/go.mod for:
  - Outdated major versions
  - Packages with known vulnerabilities
  - Unmaintained packages (>2 years no updates)
  - Typosquatting risks

```
memory_store_decision
  decision="Dependency risk level: [critical|high|medium|low]"
  rationale="Found [X] vulnerable packages: [list]"
  context="Most critical: [package] with [CVE-ID]"
  session_id="[session]"
  repository="github.com/org/repo"
```

## 4. Configuration Security

### Environment & Secrets

```
# Search for secrets
grep -r "api[_-]?key\|secret\|password\|token" --include="*.{env,yml,yaml,json,config}" .
grep -r "AWS\|AZURE\|GCP\|DATABASE_URL" --include="*.{js,ts,go,py,java,env}" .
```

Check for:

- [ ] Secrets in code: API keys, passwords
- [ ] Weak defaults: admin/admin, default keys
- [ ] Missing security headers: CSP, HSTS, X-Frame-Options
- [ ] Permissive CORS: `*` origins
- [ ] Debug mode in production
- [ ] Verbose error messages

### Infrastructure

- [ ] Open database ports
- [ ] Unencrypted connections: HTTP, non-TLS database
- [ ] Missing rate limiting
- [ ] No request size limits
- [ ] Insufficient logging

## 5. Business Logic Vulnerabilities

### Transaction Security

Based on architecture flows:

- [ ] Race conditions: concurrent transactions
- [ ] Integer overflow: financial calculations
- [ ] Business rule bypass: state manipulation
- [ ] Time-of-check-time-of-use (TOCTOU)

### Data Security

- [ ] Insecure direct object references
- [ ] Mass assignment vulnerabilities
- [ ] Information disclosure: excessive API responses
- [ ] Missing data retention policies
- [ ] Unencrypted backups

```
memory_store_chunk
  content="Business logic vulnerabilities: [detailed findings]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["security", "business-logic", "data-security"]
```

## 6. Security Analysis Documentation

Create `.claude/SECURITY_ANALYSIS.md`:

````markdown
# Security Analysis: [Project Name]

## Executive Summary

**Risk Level**: [Critical|High|Medium|Low]

**Key Findings**:

1. [Most critical issue with impact]
2. [Second critical issue]
3. [Third critical issue]

**Immediate Actions Required**:

- [ ] [Critical fix 1]
- [ ] [Critical fix 2]

## Table of Contents

- [Attack Surface](#attack-surface)
- [Vulnerability Summary](#vulnerability-summary)
- [Detailed Findings](#detailed-findings)
- [Dependency Analysis](#dependency-analysis)
- [Configuration Issues](#configuration-issues)
- [Remediation Plan](#remediation-plan)
- [Security Checklist](#security-checklist)

## Attack Surface

### External Entry Points

| Endpoint       | Method | Auth  | Risk                          | File:Line           |
| -------------- | ------ | ----- | ----------------------------- | ------------------- |
| /api/v1/users  | GET    | None  | High - No rate limiting       | routes/user.ts:45   |
| /api/v1/upload | POST   | Token | Critical - No file validation | routes/upload.ts:23 |

### Data Flow Risks

\```mermaid
graph LR
User[User Input] -->|No Validation| API[API Endpoint]
API -->|String Concat| SQL[SQL Query]
SQL -->|Raw Output| Response[JSON Response]

    style SQL fill:#ff6b6b
    style API fill:#ffd93d

\```

## Vulnerability Summary

### Critical (P0) - Immediate Fix Required

| ID      | Type             | Location            | Description                              | CVSS |
| ------- | ---------------- | ------------------- | ---------------------------------------- | ---- |
| SEC-001 | SQL Injection    | `db/user.ts:89`     | Raw string concatenation in WHERE clause | 9.8  |
| SEC-002 | Hardcoded Secret | `config/auth.ts:12` | JWT secret in source code                | 8.9  |

### High (P1) - Fix Within 7 Days

| ID      | Type             | Location            | Description                      | CVSS |
| ------- | ---------------- | ------------------- | -------------------------------- | ---- |
| SEC-003 | No Rate Limiting | `middleware/api.ts` | API endpoints lack rate limiting | 7.5  |
| SEC-004 | Weak Crypto      | `utils/hash.ts:34`  | MD5 used for password hashing    | 7.4  |

### Medium (P2) - Fix Within 30 Days

[Table format continues]

### Low (P3) - Fix in Next Release

[Table format continues]

## Detailed Findings

### SEC-001: SQL Injection in User Search

**Severity**: Critical
**CVSS Score**: 9.8 (CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H)

**Location**: `src/db/user.ts:89-95`

**Vulnerable Code**:
\```typescript
const query = `SELECT \* FROM users WHERE name LIKE '%${searchTerm}%'`;
const results = await db.query(query);
\```

**Attack Vector**:
\```bash
curl -X GET "https://api.example.com/users?search='; DROP TABLE users; --"
\```

**Impact**:

- Complete database compromise
- Data exfiltration
- Data destruction
- Service disruption

**Remediation**:
\```typescript
// Use parameterized queries
const query = 'SELECT * FROM users WHERE name LIKE ?';
const results = await db.query(query, [`%${searchTerm}%`]);
\```

**References**:

- [OWASP SQL Injection](https://owasp.org/www-community/attacks/SQL_Injection)
- [CWE-89](https://cwe.mitre.org/data/definitions/89.html)

[Continue for each finding...]

## Dependency Analysis

### Vulnerable Dependencies

| Package | Version | Vulnerability                        | Severity | Fix Version |
| ------- | ------- | ------------------------------------ | -------- | ----------- |
| lodash  | 4.17.15 | Prototype Pollution (CVE-2021-23337) | High     | 4.17.21     |
| express | 4.16.0  | Open Redirect (CVE-2022-24999)       | Medium   | 4.17.3      |

### Outdated Packages

- `jsonwebtoken@8.5.1` - Latest: 9.0.0 (breaking changes)
- `bcrypt@3.0.0` - Latest: 5.1.0 (security improvements)

## Configuration Issues

### Security Headers Missing

\```nginx

# Add to nginx.conf or application

add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";
add_header Content-Security-Policy "default-src 'self'";
\```

### Environment Variables

- `JWT_SECRET` - Weak, only 8 characters
- `DATABASE_URL` - Contains password in plaintext
- `DEBUG=true` - Enabled in production config

## Remediation Plan

### Phase 1: Critical (Week 1)

1. **SQL Injection Fix**

   - [ ] Implement parameterized queries in all database functions
   - [ ] Add SQL query builder (e.g., Knex.js)
   - [ ] Enable SQL query logging for audit

2. **Remove Hardcoded Secrets**
   - [ ] Move all secrets to environment variables
   - [ ] Implement secrets management (Vault, AWS Secrets Manager)
   - [ ] Rotate all existing secrets

### Phase 2: High Priority (Week 2-3)

1. **Implement Rate Limiting**

   - [ ] Add rate limiting middleware
   - [ ] Configure per-endpoint limits
   - [ ] Add distributed rate limiting for scale

2. **Fix Cryptographic Issues**
   - [ ] Replace MD5 with bcrypt/scrypt/argon2
   - [ ] Implement proper salt generation
   - [ ] Force password reset for all users

### Phase 3: Medium Priority (Month 2)

[Continue with phased approach]

## Security Checklist

### Pre-Deployment

- [ ] Run automated security scan
- [ ] Review all dependencies for vulnerabilities
- [ ] Verify no secrets in code
- [ ] Ensure security headers configured
- [ ] Test rate limiting
- [ ] Verify input validation on all endpoints

### Monitoring

- [ ] Set up security event logging
- [ ] Configure anomaly detection
- [ ] Implement intrusion detection
- [ ] Regular dependency updates
- [ ] Quarterly security reviews

## Appendix

### Tools Used

- Static Analysis: ESLint security plugin, Semgrep
- Dependency Scan: npm audit, Snyk
- Manual Review: 40 hours of code review
- Dynamic Testing: OWASP ZAP, Burp Suite

### Risk Matrix

\```mermaid
graph TD
subgraph "Risk Assessment"
C1[SQL Injection]:::critical
C2[Hardcoded Secrets]:::critical
H1[No Rate Limiting]:::high
H2[Weak Crypto]:::high
M1[Missing Headers]:::medium
M2[Verbose Errors]:::medium
L1[Old Dependencies]:::low
end

    classDef critical fill:#d73027
    classDef high fill:#fc8d59
    classDef medium fill:#fee08b
    classDef low fill:#d9ef8b

\```
````

### Final Storage

```
memory_store_chunk
  content="[Complete security analysis]"
  session_id="[session]"
  repository="github.com/org/repo"
  tags=["security", "analysis-complete", "report"]
  files_modified=[".claude/SECURITY_ANALYSIS.md"]
```

## Execution Priority

1. **Start with Critical**: Authentication, injection, secrets
2. **Check Dependencies**: Known CVEs take precedence
3. **Test Exploitability**: Verify findings with proof-of-concept
4. **Document Everything**: Every finding needs reproduction steps
5. **Provide Fixes**: Include remediation code for every issue

Begin by loading the architecture analysis and mapping the attack surface.
