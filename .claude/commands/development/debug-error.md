---
allowed-tools: Read(*), Edit(*), Bash(*), Grep(*), Task(*), TodoWrite(*)
description: Systematically debug and fix errors with comprehensive root cause analysis
argument-hint: [error-message-or-description]
---

# Systematically Debug and Fix Errors

Systematically debug and fix errors with root cause analysis and prevention strategies

## Usage

```bash
/debug-error "TypeError: Cannot read property 'id' of undefined"
/debug-error "API returns 500 on user login"
/debug-error "Memory leak in production after 24 hours"
```

## Instructions

Follow this comprehensive debugging methodology to resolve: **$ARGUMENTS**

1. **Error Information Gathering**
   - Collect the complete error message, stack trace, and error code
   - Note when the error occurs (timing, conditions, frequency)
   - Identify the environment where the error happens (dev, staging, prod)
   - Gather relevant logs from before and after the error

2. **Reproduce the Error**
   - Create a minimal test case that reproduces the error consistently
   - Document the exact steps needed to trigger the error
   - Test in different environments if possible
   - Note any patterns or conditions that affect error occurrence

3. **Stack Trace Analysis**
   - Read the stack trace from bottom to top to understand the call chain
   - Identify the exact line where the error originates
   - Trace the execution path leading to the error
   - Look for any obvious issues in the failing code

4. **Code Context Investigation**
   - Examine the code around the error location
   - Check recent changes that might have introduced the bug
   - Review variable values and state at the time of error
   - Analyze function parameters and return values

5. **Hypothesis Formation**
   - Based on evidence, form hypotheses about the root cause
   - Consider common JavaScript/TypeScript causes:
     - Undefined/null reference errors
     - Type mismatches in TypeScript
     - Async/await race conditions
     - Event loop blocking
     - Closure and scope issues
     - npm dependency conflicts
     - Build configuration problems

6. **Frontend Debugging Tools Setup**
   - Use Chrome DevTools for React debugging
   - Configure source maps for TypeScript debugging
   - Install React Developer Tools browser extension
   - Use Redux DevTools for state management debugging
   - Configure breakpoints and conditional breakpoints in DevTools
   - Enable console.log, console.trace, console.time
   - Use React Profiler for component performance analysis

7. **Systematic Investigation**
   - Test each hypothesis methodically
   - Use binary search approach to isolate the problem
   - Add strategic logging or print statements
   - Check data flow and transformations step by step

8. **Data Validation**
   - Verify input data format and validity
   - Check for edge cases and boundary conditions
   - Validate assumptions about data state
   - Test with different data sets to isolate patterns

9. **Dependency Analysis**
   - Check external dependencies and their versions
   - Verify network connectivity and API availability
   - Review configuration files and environment variables
   - Test database connections and query execution

10. **Memory and Resource Analysis**
    - Check for memory leaks or excessive memory usage
    - Monitor CPU and I/O resource consumption
    - Analyze garbage collection patterns if applicable
    - Check for resource deadlocks or contention

11. **Concurrency Issues Investigation**
    - Look for race conditions in multi-threaded code
    - Check synchronization mechanisms and locks
    - Analyze async operations and promise handling
    - Test under different load conditions

12. **Root Cause Identification**
    - Once the cause is identified, understand why it happened
    - Determine if it's a logic error, design flaw, or external issue
    - Assess the scope and impact of the problem
    - Consider if similar issues exist elsewhere

13. **Solution Implementation**
    - Design a fix that addresses the root cause
    - Consider multiple solution approaches and trade-offs
    - Implement the fix with appropriate error handling
    - Add validation and defensive programming where needed

14. **Testing the Fix**
    - Test the fix against the original error case
    - Test edge cases and related scenarios
    - Run regression tests to ensure no new issues
    - Test under various load and stress conditions

15. **Prevention Measures**
    - Add appropriate unit and integration tests
    - Improve error handling and logging
    - Add input validation and defensive checks
    - Update documentation and code comments

16. **Monitoring and Alerting**
    - Set up monitoring for similar issues
    - Add metrics and health checks
    - Configure alerts for error thresholds
    - Implement better observability

17. **Documentation**
    - Document the error, investigation process, and solution
    - Update troubleshooting guides
    - Share learnings with the team
    - Update code comments with context

18. **Post-Resolution Review**
    - Analyze why the error wasn't caught earlier
    - Review development and testing processes
    - Consider improvements to prevent similar issues
    - Update coding standards or guidelines if needed

## Debugging Output Template

````markdown
# Debug Report: [Error Description]

## Error Summary

- **Type**: [Bug/Performance/Security/Logic]
- **Severity**: [Critical/High/Medium/Low]
- **First Occurred**: [Timestamp]
- **Frequency**: [Always/Sometimes/Rare]
- **Environment**: [Dev/Staging/Production]

## Root Cause Analysis

### Immediate Cause

[Direct cause of the error]

### Root Cause

[Underlying systemic issue]

### Contributing Factors

1. [Factor 1]
2. [Factor 2]

## Investigation Process

### Steps Taken

1. [Investigation step with result]
2. [Investigation step with result]

### Evidence Collected

- Stack trace: [Key findings]
- Logs: [Relevant entries]
- Metrics: [Performance data]

## Solution

### Immediate Fix

```typescript
// Fixed TypeScript/JavaScript code here
```
````

### Long-term Solution

[Systemic improvements needed]

## Testing

### Test Cases Added

- [Test 1: Description]
- [Test 2: Description]

### Verification Steps

1. [How to verify fix works]
2. [How to ensure no regression]

## Prevention

### Process Improvements

- [Change to prevent recurrence]
- [Monitoring additions]

### Lessons Learned

- [Key takeaway 1]
- [Key takeaway 2]

```

## Common JavaScript/TypeScript Error Patterns

### Core JavaScript Errors
- **TypeError: Cannot read property of undefined**: Check optional chaining (?.), nullish coalescing (??)
- **ReferenceError**: Variable not defined, check scope and hoisting
- **SyntaxError**: Invalid JavaScript syntax, missing brackets/parentheses
- **RangeError**: Invalid array length, stack overflow in recursion

### TypeScript Specific
- **Type 'X' is not assignable to type 'Y'**: Type mismatch, check interfaces
- **Property does not exist on type**: Missing type definitions
- **Cannot find module**: Check tsconfig paths, type declarations
- **Generic type requires type arguments**: Provide type parameters

### Async/Promise Errors
- **UnhandledPromiseRejection**: Missing catch blocks or try/catch
- **Cannot await outside async function**: Wrap in async function
- **Promise pending indefinitely**: Missing resolve/reject
- **Race conditions**: Use Promise.all, Promise.race properly

### React/Vue/Angular Errors
- **React: Too many re-renders**: Check useEffect dependencies
- **React: Invalid hook call**: Hooks called conditionally or in loops
- **Vue: Cannot read property of undefined in template**: Check v-if conditions
- **Angular: ExpressionChangedAfterItHasBeenCheckedError**: Change detection issues

### Frontend API Errors
- **CORS blocked**: Check backend CORS configuration or use proxy
- **Network Error**: API endpoint unreachable or wrong URL
- **401 Unauthorized**: Missing or invalid authentication token
- **422 Unprocessable Entity**: Request validation failed

### Frontend Performance Issues
- **Memory Leaks**: Unreleased useEffect cleanup, event listeners
- **Component re-render loops**: Missing useCallback/useMemo dependencies
- **Large bundle sizes**: Unused imports, missing tree shaking
- **Slow component rendering**: Heavy computations in render cycles

Remember to maintain detailed notes throughout the debugging process and consider the wider implications of both the error and the fix.
```
