---
allowed-tools: Read(*), Grep(*), LS(*), Bash(*), Task(*)
description: Comprehensive code quality review with actionable recommendations and git diff analysis
argument-hint: [directory-or-file] (optional target for focused review)
model: sonnet
---

# Comprehensive Code Quality Review

Perform comprehensive code quality review with security, performance, and maintainability analysis.

## Usage

```bash
/code-review                    # Review entire repository using git diff
/code-review src/               # Focus on specific directory
/code-review src/api/users.ts   # Review specific file
/code-review src/components/    # Review component directory
```

## Review Process

### 1. Initial Analysis

- Run `git diff` to identify recent changes for focused review
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

## Output Format

````markdown
# Code Review Report

## Summary

✅ **[X] files reviewed**  
⚠️ **[Y] critical issues found**  
💡 **[Z] suggestions for improvement**

## 🔴 Critical Issues (Must Fix)

### 1. [Issue Title]

**File**: `path/to/file.js:line`  
**Severity**: 🔴 Critical  
**Issue**: [Description]

```javascript
// Current (vulnerable):
[problematic code]

// Fixed:
[corrected code]
```

**Impact**: [What happens if not fixed]

## 🟡 Warnings (Should Fix)

### 1. [Warning Title]

**File**: `path/to/file.js:line`  
**Severity**: 🟡 Medium  
**Issue**: [Description]

```javascript
[suggested improvement]
```

## 🟢 Suggestions (Consider Improving)

### 1. [Suggestion Title]

**File**: `path/to/file.js`  
**Severity**: 🟢 Low

[Improvement description and example]

## Code Quality Metrics

| Metric        | Score | Target | Status   |
| ------------- | ----- | ------ | -------- |
| Complexity    | X.X   | <10    | ✅/⚠️/❌ |
| Duplication   | X.X%  | <5%    | ✅/⚠️/❌ |
| Test Coverage | XX%   | >80%   | ✅/⚠️/❌ |
| Type Coverage | XX%   | >95%   | ✅/⚠️/❌ |

## ✨ Positive Findings

- [Strong points observed]
- [Good patterns identified]
- [Commendable practices]

## Action Items

1. **Immediate**: [Critical security/bug fixes]
2. **This Sprint**: [Important improvements]
3. **Technical Debt**: [Long-term refactoring]
````

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

````markdown
# Code Review Report: src/api/

## Summary

✅ **12 files reviewed**  
⚠️ **2 critical issues found**  
💡 **8 suggestions for improvement**

## 🔴 Critical Issues (Must Fix)

### 1. SQL Injection Vulnerability

**File**: `src/api/users.js:45`  
**Severity**: 🔴 Critical  
**Issue**: Direct string concatenation in SQL query

```javascript
// Current (vulnerable):
const query = `SELECT * FROM users WHERE id = ${userId}`

// Fixed:
const query = 'SELECT * FROM users WHERE id = ?'
db.query(query, [userId])
```

**Impact**: Allows attackers to execute arbitrary SQL commands

### 2. Missing Authentication Check

**File**: `src/routes/admin.js:23`  
**Severity**: 🔴 Critical  
**Issue**: Admin endpoint lacks authentication middleware

```javascript
// Add authentication middleware:
router.post('/admin/users', authenticate, authorize('admin'), createUser)
```

**Impact**: Unauthorized access to admin functionality

## Code Quality Metrics

| Metric        | Score | Target | Status |
| ------------- | ----- | ------ | ------ |
| Complexity    | 7.2   | <10    | ✅     |
| Duplication   | 2.1%  | <5%    | ✅     |
| Test Coverage | 76%   | >80%   | ⚠️     |
| Type Coverage | 92%   | >95%   | ⚠️     |
````

Remember to be constructive and provide specific examples with file paths and line numbers where applicable.
