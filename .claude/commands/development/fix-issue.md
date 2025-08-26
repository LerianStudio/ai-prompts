---
allowed-tools: Bash(*), Read(*), Edit(*), Grep(*), Task(*), TodoWrite(*)
description: Identify and resolve issues from markdown files with comprehensive fix and testing
argument-hint: [issue-file-path]
---

# Fix Issue Command

Identify and resolve issues described in markdown files with root cause analysis, implementation, and verification

## Usage

```bash
/fix-issue issues/bug-report.md        # Fix issue described in bug-report.md
/fix-issue /path/to/issue.md           # Fix issue from specified markdown file
```

## Instructions

Follow this structured approach to analyze and fix issues from the markdown file: **$ARGUMENTS**

1. **Issue Analysis**
   - Read the issue file at `$ARGUMENTS` to get complete issue details
   - Parse the issue description, reproduction steps, and any attached logs/screenshots
   - Identify the type of issue (bug, feature request, enhancement, etc.)
   - Understand the expected vs actual behavior

2. **Environment Setup**
   - Ensure you're on the correct branch (usually main/master)
   - Pull latest changes if needed: `git pull origin main`
   - Create a new feature branch based on issue title from the markdown file

3. **Reproduce the Issue**
   - Follow the steps to reproduce described in the issue
   - Set up the development environment if needed
   - Run the application/tests to confirm the issue exists
   - Document the current behavior

4. **Root Cause Analysis**
   - Search the codebase for relevant files and functions
   - Use grep/search tools to locate the problematic code
   - Analyze the code logic and identify the root cause
   - Check for related issues or similar patterns

5. **Solution Design**
   - Design a fix that addresses the root cause, not just symptoms
   - Consider edge cases and potential side effects
   - Ensure the solution follows project conventions and patterns
   - Plan for backward compatibility if needed

6. **Implementation**
   - Implement the fix with clean, readable code
   - Follow the project's coding standards and style
   - Add appropriate error handling and logging
   - Keep changes minimal and focused

7. **Testing Strategy**
   - Write or update tests to cover the fix
   - Ensure existing tests still pass
   - Test edge cases and error conditions
   - Run the full test suite to check for regressions

8. **Code Quality Checks**
   - Run linting and formatting tools
   - Perform static analysis if available
   - Check for security implications
   - Ensure performance isn't negatively impacted

9. **Documentation Updates**
   - Update relevant documentation if needed
   - Add or update code comments for clarity
   - Update changelog if the project maintains one
   - Document any breaking changes

## Fix Workflow Template

````markdown
# Issue Fix from $ARGUMENTS

## Issue Summary

- **Title**: [Issue title from markdown file]
- **Type**: [Bug/Feature/Enhancement]
- **Priority**: [Critical/High/Medium/Low]
- **Reporter**: [If specified in file]
- **Affected Version**: [Version]

## Analysis

### Problem Description

[Clear description of the issue]

### Root Cause

[Identified root cause]

### Impact

- [User impact]
- [System impact]

## Solution

### Approach

[Description of fix approach]

### Changes Made

1. [File:Line] - [Change description]
2. [File:Line] - [Change description]

### Code Changes

```diff
- old code
+ new code
```
````

## Testing

### Test Cases

- [ ] Original issue reproduction fails
- [ ] Fix resolves the issue
- [ ] No regression in existing functionality
- [ ] Edge cases handled

### Test Results

```bash
# Test output here
```

## Verification

- [ ] All tests pass
- [ ] Code review complete
- [ ] Documentation updated
- [ ] No performance regression

## Pull Request

- **PR**: [PR reference if created]
- **Branch**: [Created branch name]
- **Status**: [Draft/Ready/Merged]

````

## Common Issue Types

### Bug Fixes
1. Reproduce the bug consistently
2. Identify root cause (not symptoms)
3. Fix with minimal code changes
4. Add regression test
5. Verify no side effects

### Feature Requests
1. Clarify requirements with reporter
2. Design solution architecture
3. Implement incrementally
4. Add comprehensive tests
5. Update documentation

### Performance Issues
1. Profile to identify bottlenecks
2. Measure baseline performance
3. Implement optimization
4. Verify improvement with benchmarks
5. Ensure no functional regression

### Security Issues
1. Assess severity and impact
2. Fix vulnerability completely
3. Add security tests
4. Review for similar issues
5. Update security documentation

## Best Practices

1. **Communication**
   - Comment on issue before starting
   - Update progress regularly
   - Ask for clarification when needed

2. **Code Quality**
   - Follow project coding standards
   - Keep changes focused and minimal
   - Write self-documenting code

3. **Testing**
   - Write test first (TDD approach)
   - Cover edge cases
   - Include integration tests

4. **Documentation**
   - Update relevant docs
   - Add inline comments for complex logic
   - Update changelog

## Expected Issue File Format

The markdown file provided should follow this structure:

```markdown
# Issue Title

## Type
[Bug/Feature/Enhancement/Performance/Security]

## Priority
[Critical/High/Medium/Low]

## Description
[Detailed description of the issue]

## Steps to Reproduce (for bugs)
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
[What should happen]

## Actual Behavior
[What currently happens]

## Environment
- OS: [Operating System]
- Version: [Software version]
- Other relevant details

## Additional Context
[Any other context, logs, screenshots, etc.]
````

Remember to communicate clearly in both code and comments, and always prioritize maintainable solutions over quick fixes.
