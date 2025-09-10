---
allowed-tools: Read(*), Glob(*), Grep(*), Bash(*), Task(*)
description: Comprehensive code quality review with actionable recommendations and git diff analysis
argument-hint: [--target=<path>] [--git-scope=<scope>] [--diff-context]
---

# /code-quality:code-review

<instructions>
Performs comprehensive code quality review with security, performance, and maintainability analysis. Supports focused git-scope analysis for active development workflows and traditional path-based analysis.

<purpose>
- Comprehensive code quality review with security, performance, and maintainability analysis
- Git-focused analysis for faster, more relevant results during development
- Structured reporting with actionable recommendations
- Integration with development workflows through git scope targeting
</purpose>

<scope>
Covers complete code quality assessment including security vulnerabilities, performance bottlenecks, maintainability issues, and technical debt analysis with detailed reporting.
</scope>
</instructions>

<context>
This command provides systematic code quality assessment focused on identifying issues, vulnerabilities, and improvement opportunities without making changes to the codebase.
</context>

<usage_examples>

## Usage Examples

```bash
# Git-focused review (recommended for active development)
/code-quality:code-review --git-scope=all-changes                   # Review all git changes
/code-quality:code-review --git-scope=staged                        # Review staged files only
/code-quality:code-review --git-scope=branch                        # Review feature branch changes
/code-quality:code-review --git-scope=all-changes --diff-context    # Review with git diff context

# Traditional scope-based review
/code-quality:code-review                                            # Review entire repository
/code-quality:code-review --target=src/                             # Focus on specific directory
/code-quality:code-review --target=src/api/users.ts                 # Review specific file
/code-quality:code-review --target=src/components/                  # Review component directory

# Combined approaches
/code-quality:code-review --git-scope=branch --target=src/          # Review branch changes in src/ only
```

</usage_examples>

<process>
## Review Process

### 1. Initial Analysis

**Git-Focused Analysis** (when `--git-scope` used):

```bash
# Validate git repository and get target files
if ! git rev-parse --git-dir >/dev/null 2>&1; then
    echo "Error: Not a git repository. Git-focused options require a git repository." >&2
    exit 1
fi

# Show git scope statistics
echo "## Git Changes Analysis"
case "$git_scope" in
    "staged")
        echo "Reviewing staged files only"
        git diff --cached --stat
        ;;
    "branch")
        echo "Reviewing feature branch changes vs main/master"
        base_branch=$(git merge-base HEAD main 2>/dev/null || git merge-base HEAD master 2>/dev/null)
        git diff --stat "$base_branch..HEAD"
        ;;
    "all-changes")
        echo "Reviewing all uncommitted changes"
        git diff --stat HEAD
        ;;
esac

# Show diff context if requested
if [[ "$diff_context" == "true" ]]; then
    echo ""
    echo "### Code Changes Context:"
    git diff --unified=3 ${git_range} | head -50
    if [[ $(git diff --unified=3 ${git_range} | wc -l) -gt 50 ]]; then
        echo "... (truncated, use git diff for full context)"
    fi
    echo ""
fi
```

**Traditional Analysis**:

- Examine repository structure and identify framework/language
- Check for configuration files (package.json, tsconfig.json, .eslintrc, etc.)
- Review README and documentation for context

### 2. Code Quality Assessment

- Scan for code smells, anti-patterns, and potential bugs
- Check for consistent coding style and naming conventions
- Identify unused imports, variables, or dead code
- Review error handling and logging practices
- Evaluate code complexity and maintainability

### 3. Security Review

- Look for common vulnerabilities (injection, XSS, etc.)
- Check for hardcoded secrets, API keys, or passwords
- Review authentication and authorization implementation
- Examine input validation and sanitization
- Check for secure headers and CORS configuration
- Review dependencies for known vulnerabilities
- OWASP Top 10 compliance check

### 4. Performance Analysis

- Identify inefficient algorithms and data structures
- Check for memory leaks (event listeners, timers)
- Review database query optimization
- Analyze bundle size and import strategies
- Check for unnecessary dependencies
- Review async/await and Promise handling
- Identify opportunities for caching and lazy loading

### 5. Testing & Documentation

- Check existing test coverage and quality
- Identify areas lacking proper testing
- Evaluate code comments and inline documentation
- Review API documentation completeness
- Assess README and setup instructions

### 6. Recommendation Generation

**Analysis Output**:

- Prioritized list of issues found
- Specific file and line number references
- Detailed explanations of problems
- Suggested solutions with code examples

**Report Categories**:

- Critical security vulnerabilities
- Performance optimization opportunities
- Maintainability improvements needed
- Technical debt assessment
- Testing gap analysis

</process>

<formatting>
## Output Format

**IMPORTANT: All findings must be presented in structured tables for better visual clarity and organization.**

```markdown
# Code Review Report

## Executive Summary

| Metric          | Value      | Status   |
| --------------- | ---------- | -------- |
| Files Reviewed  | [X] files  | ℹ️       |
| Critical Issues | [Y] issues | 🔴       |
| Warnings        | [Z] issues | 🟡       |
| Suggestions     | [A] items  | 🟢       |
| Overall Score   | [B]/10     | ✅/⚠️/❌ |

## Git Analysis (when using git-scope)

| Property             | Value                     |
| -------------------- | ------------------------- |
| **Scope**            | [git-scope value]         |
| **Files in Scope**   | [number of files]         |
| **Lines Changed**    | +[additions] -[deletions] |
| **Commits Reviewed** | [commit range]            |
| **Branch**           | [current branch]          |

## 🔴 Critical Issues (Must Fix Immediately)

| #   | File               | Line | Issue               | Severity    | Impact           |
| --- | ------------------ | ---- | ------------------- | ----------- | ---------------- |
| 1   | `path/to/file.js`  | 45   | [Brief description] | 🔴 Critical | [Impact summary] |
| 2   | `path/to/other.ts` | 128  | [Brief description] | 🔴 Critical | [Impact summary] |

### Detailed Critical Issues

**For each critical issue, provide:**

| Issue               | Details                                  |
| ------------------- | ---------------------------------------- |
| **File**            | `path/to/file.js:45`                     |
| **Category**        | Security/Performance/Logic               |
| **Description**     | [Detailed explanation]                   |
| **Current Code**    | `javascript<br/>[problematic code]<br/>` |
| **Recommended Fix** | `javascript<br/>[corrected code]<br/>`   |
| **Risk Level**      | High/Medium/Low                          |
| **Effort Required** | 1-5 story points                         |

## 🟡 Warnings (Should Address Soon)

| #   | File             | Line | Issue         | Category        | Priority |
| --- | ---------------- | ---- | ------------- | --------------- | -------- |
| 1   | `src/utils.js`   | 23   | [Description] | Code Quality    | High     |
| 2   | `src/api.ts`     | 67   | [Description] | Performance     | Medium   |
| 3   | `src/helpers.js` | 145  | [Description] | Maintainability | Medium   |

## 🟢 Suggestions (Nice to Have)

| #   | File              | Area         | Suggestion               | Benefit         | Effort |
| --- | ----------------- | ------------ | ------------------------ | --------------- | ------ |
| 1   | `src/components/` | React        | Implement useCallback    | Performance     | Low    |
| 2   | `src/types/`      | TypeScript   | Add stricter types       | Type Safety     | Medium |
| 3   | `src/utils/`      | Architecture | Extract common utilities | Maintainability | Low    |

## Code Quality Metrics

| Metric                    | Current | Target | Status   | Trend   |
| ------------------------- | ------- | ------ | -------- | ------- |
| **Cyclomatic Complexity** | X.X     | <10    | ✅/⚠️/❌ | ↗️/→/↘️ |
| **Code Duplication**      | X.X%    | <5%    | ✅/⚠️/❌ | ↗️/→/↘️ |
| **Test Coverage**         | XX%     | >80%   | ✅/⚠️/❌ | ↗️/→/↘️ |
| **Type Coverage**         | XX%     | >95%   | ✅/⚠️/❌ | ↗️/→/↘️ |
| **Bundle Size**           | XXkB    | <500kB | ✅/⚠️/❌ | ↗️/→/↘️ |
| **Performance Score**     | XX/100  | >90    | ✅/⚠️/❌ | ↗️/→/↘️ |

## Security Analysis

| Check                          | Result   | Details               |
| ------------------------------ | -------- | --------------------- |
| **Input Validation**           | ✅/⚠️/❌ | [Summary of findings] |
| **Authentication**             | ✅/⚠️/❌ | [Summary of findings] |
| **Authorization**              | ✅/⚠️/❌ | [Summary of findings] |
| **Data Sanitization**          | ✅/⚠️/❌ | [Summary of findings] |
| **Dependency Vulnerabilities** | ✅/⚠️/❌ | [Summary of findings] |
| **Secrets Exposure**           | ✅/⚠️/❌ | [Summary of findings] |
| **OWASP Compliance**           | ✅/⚠️/❌ | [Summary of findings] |

## Performance Analysis

| Area                     | Score | Issues Found   | Recommendations       |
| ------------------------ | ----- | -------------- | --------------------- |
| **Algorithm Efficiency** | X/10  | [count] issues | [Key recommendations] |
| **Memory Usage**         | X/10  | [count] issues | [Key recommendations] |
| **Database Queries**     | X/10  | [count] issues | [Key recommendations] |
| **Bundle Optimization**  | X/10  | [count] issues | [Key recommendations] |
| **Async Operations**     | X/10  | [count] issues | [Key recommendations] |

## File-by-File Analysis

| File                        | Issues | Warnings | Suggestions | Score  | Priority |
| --------------------------- | ------ | -------- | ----------- | ------ | -------- |
| `src/app.js`                | 0      | 2        | 1           | 8.5/10 | Medium   |
| `src/api/users.js`          | 1      | 1        | 3           | 6.2/10 | High     |
| `src/components/Header.tsx` | 0      | 0        | 2           | 9.1/10 | Low      |

## Testing Analysis

| Test Category         | Coverage | Quality        | Missing Areas             |
| --------------------- | -------- | -------------- | ------------------------- |
| **Unit Tests**        | XX%      | Good/Fair/Poor | [List of uncovered areas] |
| **Integration Tests** | XX%      | Good/Fair/Poor | [List of uncovered areas] |
| **E2E Tests**         | XX%      | Good/Fair/Poor | [List of uncovered areas] |
| **Security Tests**    | XX%      | Good/Fair/Poor | [List of uncovered areas] |

## ✨ Positive Findings

| Category         | Finding                   | Impact                |
| ---------------- | ------------------------- | --------------------- |
| **Architecture** | [Strong point observed]   | [Benefit description] |
| **Code Quality** | [Good pattern identified] | [Benefit description] |
| **Security**     | [Commendable practice]    | [Benefit description] |
| **Performance**  | [Optimization found]      | [Benefit description] |

## Action Plan

| Priority           | Task                           | Files Affected           | Estimated Effort | Owner        |
| ------------------ | ------------------------------ | ------------------------ | ---------------- | ------------ |
| **🔴 Immediate**   | Fix SQL injection in users API | `src/api/users.js`       | 2 hours          | Backend Dev  |
| **🔴 Immediate**   | Add authentication middleware  | `src/routes/admin.js`    | 1 hour           | Backend Dev  |
| **🟡 This Sprint** | Improve test coverage          | `src/utils/`, `src/api/` | 1 day            | QA Team      |
| **🟡 This Sprint** | Refactor duplicate code        | `src/components/`        | 4 hours          | Frontend Dev |
| **🟢 Next Sprint** | Add TypeScript strict mode     | All `.js` files          | 2 days           | Full Team    |

## Recommended Next Steps

1. **Immediate Actions** (< 1 day)
   - Address all critical security issues
   - Fix blocking bugs

2. **Short Term** (This Sprint)
   - Resolve high-priority warnings
   - Improve test coverage to >80%

3. **Long Term** (Next Sprint+)
   - Technical debt reduction
   - Performance optimizations
   - Documentation improvements
```

## Review Categories

### Security

- Input validation and sanitization
- Authentication and authorization
- Secure data storage and transmission
- Dependency vulnerabilities
- OWASP Top 10 compliance

### Performance

- Algorithm efficiency (O(n) complexity)
- Database query optimization
- Caching strategies
- Bundle size impact
- Memory usage patterns

### Code Quality

- SOLID principles adherence
- DRY (Don't Repeat Yourself)
- Clear naming conventions
- Proper error handling
- Test coverage

### Maintainability

- Code readability
- Documentation completeness
- Modular architecture
- Dependency management
- Technical debt assessment

## Frontend-Specific Reviews

### React/TypeScript

- Component re-render optimization (useMemo, useCallback)
- Memory leaks in useEffect hooks
- Bundle size and tree shaking effectiveness
- TypeScript strict mode compliance
- Accessibility (a11y) compliance
- State management patterns (Context vs external stores)

### Performance & UX

- Core Web Vitals optimization
- Image optimization and lazy loading
- Route-based code splitting
- CSS-in-JS performance impact
- Mobile responsiveness
- Progressive Web App features

### Security & Best Practices

- XSS prevention in dynamic content
- Content Security Policy implementation
- Authentication token handling
- API key security (environment variables)
- Third-party library vulnerability scan

## Example Output

```markdown
# Code Review Report: Git Changes (branch scope)

## Executive Summary

| Metric          | Value                              | Status |
| --------------- | ---------------------------------- | ------ |
| Files Reviewed  | 12 files (from 47 total in branch) | ℹ️     |
| Critical Issues | 2 issues                           | 🔴     |
| Warnings        | 5 issues                           | 🟡     |
| Suggestions     | 8 items                            | 🟢     |
| Overall Score   | 7.4/10                             | ⚠️     |

## Git Analysis

| Property             | Value                              |
| -------------------- | ---------------------------------- |
| **Scope**            | branch (feature/user-auth vs main) |
| **Files in Scope**   | 12 files                           |
| **Lines Changed**    | +247 -89                           |
| **Commits Reviewed** | 3 commits (a1b2c3d..f4e5d6c)       |
| **Branch**           | feature/user-auth                  |

## 🔴 Critical Issues (Must Fix Immediately)

| #   | File                  | Line | Issue                        | Severity    | Impact                   |
| --- | --------------------- | ---- | ---------------------------- | ----------- | ------------------------ |
| 1   | `src/api/users.js`    | 45   | SQL Injection vulnerability  | 🔴 Critical | Arbitrary code execution |
| 2   | `src/routes/admin.js` | 23   | Missing authentication check | 🔴 Critical | Unauthorized access      |

### Detailed Critical Issues

| Issue               | Details                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| **File**            | `src/api/users.js:45`                                                                                |
| **Category**        | Security                                                                                             |
| **Description**     | Direct string concatenation in SQL query allows injection attacks                                    |
| **Current Code**    | ``javascript<br/>const query = `SELECT * FROM users WHERE id = ${userId}`<br/>``                     |
| **Recommended Fix** | `javascript<br/>const query = 'SELECT * FROM users WHERE id = ?'<br/>db.query(query, [userId])<br/>` |
| **Risk Level**      | High                                                                                                 |
| **Effort Required** | 1 story point                                                                                        |

| Issue               | Details                                                                                         |
| ------------------- | ----------------------------------------------------------------------------------------------- |
| **File**            | `src/routes/admin.js:23`                                                                        |
| **Category**        | Security                                                                                        |
| **Description**     | Admin endpoint lacks authentication middleware                                                  |
| **Current Code**    | `javascript<br/>router.post('/admin/users', createUser)<br/>`                                   |
| **Recommended Fix** | `javascript<br/>router.post('/admin/users', authenticate, authorize('admin'), createUser)<br/>` |
| **Risk Level**      | High                                                                                            |
| **Effort Required** | 1 story point                                                                                   |

## 🟡 Warnings (Should Address Soon)

| #   | File                          | Line | Issue                    | Category        | Priority |
| --- | ----------------------------- | ---- | ------------------------ | --------------- | -------- |
| 1   | `src/utils/helpers.js`        | 23   | Unused import statement  | Code Quality    | High     |
| 2   | `src/components/UserCard.tsx` | 67   | Missing error handling   | Reliability     | Medium   |
| 3   | `src/api/auth.js`             | 145  | Hardcoded timeout values | Maintainability | Medium   |
| 4   | `src/types/user.ts`           | 12   | Loose type definition    | Type Safety     | Medium   |
| 5   | `src/hooks/useAuth.ts`        | 89   | Memory leak potential    | Performance     | Low      |

## Code Quality Metrics

| Metric                    | Current | Target | Status | Trend |
| ------------------------- | ------- | ------ | ------ | ----- |
| **Cyclomatic Complexity** | 7.2     | <10    | ✅     | →     |
| **Code Duplication**      | 2.1%    | <5%    | ✅     | ↘️    |
| **Test Coverage**         | 76%     | >80%   | ⚠️     | ↗️    |
| **Type Coverage**         | 92%     | >95%   | ⚠️     | →     |
| **Bundle Size**           | 485kB   | <500kB | ✅     | ↗️    |
| **Performance Score**     | 87/100  | >90    | ⚠️     | →     |

## Action Plan

| Priority           | Task                            | Files Affected                | Estimated Effort | Owner        |
| ------------------ | ------------------------------- | ----------------------------- | ---------------- | ------------ |
| **🔴 Immediate**   | Fix SQL injection vulnerability | `src/api/users.js`            | 1 hour           | Backend Dev  |
| **🔴 Immediate**   | Add authentication middleware   | `src/routes/admin.js`         | 30 min           | Backend Dev  |
| **🟡 This Sprint** | Remove unused imports           | `src/utils/helpers.js`        | 15 min           | Any Dev      |
| **🟡 This Sprint** | Add error boundaries            | `src/components/UserCard.tsx` | 2 hours          | Frontend Dev |
| **🟢 Next Sprint** | Improve test coverage to 80%+   | Multiple files                | 1 day            | QA Team      |
```

Remember to be constructive and provide specific examples with file paths and line numbers where applicable.
</formatting>
