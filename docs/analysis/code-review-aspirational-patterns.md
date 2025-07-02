# Code Review Aspirational Patterns Analysis

## Executive Summary

The 18-prompt code review system contains several structural patterns that lead to **aspirational reviews** - analyses that describe hypothetical findings rather than actual code issues. This report identifies these patterns and provides recommendations for improvement.

## Key Patterns Contributing to Aspirational Reviews

### 1. **Assumption of Findings Without Verification**

**Pattern**: Prompts generate example reports with placeholder data before analyzing actual code.

**Evidence**:
- Prompt 01 (Codebase Overview): Creates markdown template with `[X components]`, `[Y files]` placeholders
- Prompt 07 (Security Analysis): Pre-fills report with example vulnerabilities like SQL injection at `src/db/user.ts:89`
- Prompt 16 (Production Readiness): Creates reports with `[COUNT]`, `[FILE:LINE]` placeholders

**Impact**: AI generates plausible-sounding findings that may not exist in the actual codebase.

### 2. **Generic Command Execution Without Context**

**Pattern**: Uses broad grep/find commands that may return empty results, but reports continue as if data was found.

**Evidence**:
```bash
# From multiple prompts:
grep -r "TODO|FIXME|BUG|ISSUE" . | head -10
find . -name "*.test.js" | wc -l
```

**Problem**: When commands return no results, the prompts still generate reports assuming issues exist.

### 3. **Template-First Reporting**

**Pattern**: Creates comprehensive report templates before analysis, then attempts to fill them.

**Evidence**:
- Every prompt uses `cat > docs/code-review/X-ANALYSIS.md << 'EOF'` to create pre-structured reports
- Templates include specific examples (e.g., "lodash 4.17.15 vulnerability") that become part of the output

**Impact**: Reports contain mix of real findings and template examples.

### 4. **Insufficient Validation Chain**

**Pattern**: Later prompts don't validate findings from earlier ones.

**Evidence**:
- Prompt 18 (Todo Generation) reads previous reports but doesn't verify if findings were real
- No mechanism to distinguish between actual discoveries and placeholder content
- Chain assumes all previous outputs contain valid findings

### 5. **Example-Driven Analysis**

**Pattern**: Prompts include detailed code examples that get incorporated into findings.

**Evidence**:
```typescript
// From Security Analysis prompt:
const query = `SELECT * FROM users WHERE name LIKE '%${searchTerm}%'`;
```

**Problem**: These examples appear in reports as if they were found in the actual codebase.

### 6. **Missing Reality Checks**

**Pattern**: No validation that discovered issues actually exist.

**Evidence**:
- No commands to verify file existence before reporting issues
- No confirmation that line numbers are accurate
- No validation that code snippets match actual files

### 7. **Overly Optimistic Command Outputs**

**Pattern**: Commands assume specific project structures and tools.

**Evidence**:
```bash
npm audit --json > npm-audit.json  # Assumes npm project
go vet ./...                       # Assumes Go project
mvn compile                        # Assumes Java/Maven project
```

**Problem**: When tools aren't present, reports still generate findings.

### 8. **Memory MCP Reinforcement**

**Pattern**: Storing assumptions as facts in memory system.

**Evidence**:
```bash
memory_store_chunk content="Security analysis completed. Critical vulnerabilities: [count]"
memory_store_decision decision="Dependency health status: [healthy|at-risk|critical]"
```

**Impact**: Future analyses build on stored assumptions, compounding the problem.

## Specific Problematic Patterns by Prompt

### Security Analysis (Prompt 07)
- Pre-populated with specific CVE examples
- Includes hardcoded vulnerable code snippets
- Generates remediation for hypothetical issues

### Dependency Analysis (Prompt 08)
- Lists specific outdated packages (node-uuid, request) as examples
- Includes version numbers and migration paths for packages that may not exist

### Test Coverage (Prompt 09)
- Assumes test framework presence
- Generates coverage percentages without actual measurement

### Production Readiness (Prompt 16)
- Creates blocking issues list before scanning
- Uses placeholder file:line references

### Comprehensive Todo (Prompt 18)
- Consolidates all previous assumptions
- No mechanism to validate actual vs. hypothetical findings

## Root Causes

1. **Template-Driven Design**: Reports are structured before analysis
2. **Optimistic Execution**: Assumes all commands succeed and return data
3. **Example Pollution**: Code examples in prompts contaminate actual findings
4. **No Validation Loop**: Missing feedback mechanism to verify discoveries
5. **Context Assumption**: Assumes specific tech stacks and project structures

## Recommendations for Improvement

### 1. **Verification-First Approach**
```bash
# Check if files exist before analyzing
if [ -f "package.json" ]; then
    # Run npm-specific commands
fi
```

### 2. **Dynamic Report Generation**
- Generate reports AFTER analysis, not before
- Use actual findings to structure output
- Avoid pre-filled templates

### 3. **Reality Validation**
```bash
# Verify findings exist
if grep -q "SQL.*injection.*pattern" file.js; then
    # Report actual finding with real line number
fi
```

### 4. **Conditional Examples**
- Separate instructional examples from actual findings
- Clearly mark hypothetical scenarios
- Don't include examples in final reports

### 5. **Progressive Discovery**
- Start with project structure discovery
- Adapt subsequent analysis to actual tech stack
- Skip irrelevant analysis phases

### 6. **Finding Verification Chain**
- Each prompt validates previous findings
- Mark unverified findings as "potential"
- Include confidence scores

### 7. **Memory MCP Best Practices**
- Store only verified findings
- Include validation status in stored data
- Tag assumptions vs. confirmed issues

## Conclusion

The current 18-prompt system is architecturally sound but suffers from an **aspirational bias** where hypothetical findings are presented as real discoveries. The template-first approach, combined with example pollution and lack of validation, creates reports that mix actual issues with imagined ones.

The solution requires a fundamental shift from **template-driven** to **discovery-driven** reporting, with robust validation at each step and clear separation between examples and findings.