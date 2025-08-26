# Security Analysis

I'll perform comprehensive security analysis and remediation of your codebase.

Arguments: `$ARGUMENTS` - specific paths or security focus areas

## Phase 1: Security Assessment

### Extended Thinking for Security Analysis

For complex security scenarios, I'll use extended thinking to identify sophisticated vulnerabilities:

<think>
When analyzing security:
- Attack vectors that aren't immediately obvious
- Chain vulnerabilities that individually seem harmless
- Business logic flaws that enable exploitation
- Timing attacks and race conditions
- Supply chain vulnerabilities in dependencies
- Architectural weaknesses that enable lateral movement
</think>

**Triggers for Extended Analysis:**

- Authentication and authorization systems
- Financial transaction processing
- Cryptographic implementations
- Multi-tenant architectures
- API security boundaries

**SECURITY ANALYSIS PROCESS:**

1. Scan the specified paths or entire codebase
2. Identify vulnerabilities across all security dimensions
3. Categorize risks by severity level
4. Create comprehensive vulnerability report
5. Develop prioritized remediation plan

I'll analyze security across dimensions:

**Vulnerability Detection:**

- Hardcoded secrets and credentials
- Dependency vulnerabilities
- Insecure configurations
- Input validation issues
- Authentication weaknesses

**Risk Categorization:**

- **Critical**: Immediate exploitation possible
- **High**: Serious vulnerabilities
- **Medium**: Should be addressed
- **Low**: Best practice improvements

## Phase 2: Remediation Planning

Based on findings, I'll create remediation plan:

**Priority Order:**

1. Critical credential exposures
2. High-risk vulnerabilities
3. Dependency updates
4. Configuration hardening
5. Code pattern improvements

I'll create a detailed remediation plan with:

- Each vulnerability details
- Risk assessment
- Remediation approach
- Verification method

## Phase 3: Intelligent Remediation

I'll fix vulnerabilities appropriately:

**Remediation Patterns:**

- Secrets → Environment variables
- Hardcoded values → Configuration files
- Weak validation → Strong patterns
- Outdated deps → Safe updates

**Safe Practices:**

- Never log sensitive data
- Use secure defaults
- Apply principle of least privilege
- Implement defense in depth

## Phase 4: Incremental Fixing

I'll remediate systematically:

**Execution Process:**

1. Create git checkpoint
2. Fix vulnerability safely
3. Verify fix doesn't break functionality
4. Update plan with completion
5. Move to next vulnerability

**Progress Tracking:**

- Document each vulnerability fix
- Verify remediation effectiveness
- Create security-focused commits

## Phase 5: Verification

After each remediation:

- Test functionality preserved
- Verify vulnerability resolved
- Check for new issues introduced
- Update security documentation

## Security Report

After completing the analysis, I'll provide:

- **Vulnerability Summary**: Total issues found by severity
- **Risk Assessment**: Overall security posture evaluation
- **Priority Fixes**: Critical vulnerabilities requiring immediate attention
- **Remediation Plan**: Step-by-step fix implementation
- **Verification Results**: Confirmation that fixes work properly

## Practical Examples

**Start Scanning:**

```
/security-scan                # Full project scan
/security-scan src/api/       # Focus on API
/security-scan "credentials"  # Credential focus
```

**Focused Analysis:**

```
/security-scan auth/     # Focus on authentication code
/security-scan api/      # Analyze API endpoints only
/security-scan database/ # Database security review
```

## Safety Guarantees

**Protection Measures:**

- Git checkpoint before fixes
- Functionality preservation
- No security regression
- Clear audit trail

**Important:** I will NEVER:

- Expose secrets in commits
- Break existing security
- Add AI attribution
- Log sensitive data

## Core Security Analysis Process

1. **Comprehensive Scanning** - Analyze all code for security vulnerabilities
2. **Risk Assessment** - Categorize findings by severity and impact
3. **Prioritized Remediation** - Address critical issues first
4. **Safe Implementation** - Fix vulnerabilities without breaking functionality
5. **Thorough Verification** - Ensure all fixes are effective and complete
6. **Documentation** - Provide clear security improvement summary

I'll deliver complete security analysis and remediation for your codebase with detailed reporting on all vulnerabilities found and fixed.
