---
allowed-tools: Read(*), Write(*), Edit(*), Glob(*), Grep(*), Task(*)
description: Clean comments following clean code principles - remove redundant, obvious, and bad comments while preserving meaningful ones
argument-hint: [--file-pattern=<pattern>] [--dry-run]
---

# Clean Comments

Clean comments in code following clean code principles. Removes redundant, obvious noise, and bad comments while preserving meaningful documentation, warnings, and legal comments.

## Usage

This command analyzes comments in your codebase and removes those that violate clean code principles while preserving valuable ones. If no file pattern is specified, it will analyze the entire codebase automatically.

**Recommended workflow:**

```bash
# First understand the codebase architecture and patterns
/documentation:analyze-codebase

# Then clean comments with architectural context
/code-quality:clean-comments

# Or combine both commands for precision cleanup
/documentation:analyze-codebase && /code-quality:clean-comments
```

## Integration Benefits

When used with `/documentation:analyze-codebase`, this command:

- **Preserves architectural documentation** - Keeps comments explaining system design and patterns
- **Context-aware cleaning** - Understands which comments are critical for complex modules
- **Pattern-aware decisions** - Maintains comments that explain established coding patterns
- **Smart prioritization** - Focuses cleanup efforts on files with the most comment issues
- **Respects conventions** - Preserves project-specific documentation standards

## Clean Code Comment Rules

1. **Always try to explain yourself in code** - Remove comments that can be replaced with better function/variable names
2. **Don't be redundant** - Remove comments that just repeat what the code obviously does
3. **Don't add obvious noise** - Remove comments like `i++; // increment i`
4. **Don't use closing brace comments** - Remove `} // end of if block` style comments
5. **Don't comment out code** - Remove commented-out code blocks
6. **Keep explanation of intent** - Preserve comments explaining WHY, not WHAT
7. **Keep warnings of consequences** - Preserve comments about important side effects
8. **Keep legal and informative comments** - Preserve copyright, licenses, TODOs

## Process

### Phase 1: Architecture-Aware Analysis (when integrated with analyze-codebase)

1. **Understand Codebase Context**
   - Identify key architectural patterns and conventions
   - Map critical system components and their responsibilities
   - Understand established documentation patterns
   - Identify complex modules requiring careful comment preservation

### Phase 2: Targeted Comment Analysis

2. **Scan Files**
   - Find all files matching the pattern (or entire codebase if no pattern specified)
   - Prioritize files with most comment issues (using codebase analysis)
   - Identify different types of comments in context of project patterns
   - Categorize by clean code rules while respecting architecture

### Phase 3: Context-Aware Cleaning

3. **Clean Bad Comments**
   - Remove redundant comments that repeat code
   - Remove obvious noise comments
   - Remove closing brace comments
   - Remove commented-out code blocks
   - **Preserve architectural explanations** identified in Phase 1

4. **Preserve Good Comments**
   - Keep intent explanations and clarifications
   - Keep consequence warnings
   - Keep legal/copyright notices
   - Keep TODO comments
   - **Keep system design documentation** critical to understanding
   - **Keep pattern explanations** that help maintain conventions

5. **Suggest Code Improvements**
   - Identify where comments can be replaced with better naming
   - Suggest function extractions for complex logic
   - **Recommend architectural improvements** based on codebase analysis

## Examples

### Standalone Usage

```bash
# Clean comments in entire codebase
/code-quality:clean-comments

# Clean comments in all JavaScript files
/code-quality:clean-comments --file-pattern="**/*.js"

# Dry run to see what would be cleaned in entire codebase
/code-quality:clean-comments --dry-run

# Dry run for specific files
/code-quality:clean-comments --file-pattern="src/**/*.ts" --dry-run

# Clean specific file
/code-quality:clean-comments --file-pattern="app.js"
```

### Integrated Usage (Recommended)

```bash
# Comprehensive analysis followed by precision cleanup
/documentation:analyze-codebase && /code-quality:clean-comments

# Architecture-aware cleanup with dry run
/documentation:analyze-codebase && /code-quality:clean-comments --dry-run

# Focus on specific component with full context
/documentation:analyze-codebase lib/components && /code-quality:clean-comments --file-pattern="lib/components/**/*"
```

**Before:**

```javascript
// Check if user is eligible for discount
if (user.age >= 65 && user.membershipYears >= 5) {
  // Apply senior discount
  total = total * 0.9 // multiply by 0.9 to get 10% discount
} // end if block
```

**After:**

```javascript
if (user.isEligibleForSeniorDiscount()) {
  total = total * SENIOR_DISCOUNT_RATE
}
```
