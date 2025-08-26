---
allowed-tools: Read(*), Write(*), Edit(*), Glob(*), Grep(*)
description: Clean comments following clean code principles - remove redundant, obvious, and bad comments while preserving meaningful ones
argument-hint: [file-pattern] [--dry-run]
---

# Clean Comments

Clean comments in code following clean code principles. Removes redundant, obvious noise, and bad comments while preserving meaningful documentation, warnings, and legal comments.

## Usage

This command analyzes comments in your codebase and removes those that violate clean code principles while preserving valuable ones. If no file pattern is specified, it will analyze the entire codebase automatically.

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

1. **Scan Files**
   - Find all files matching the pattern (or entire codebase if no pattern specified)
   - Identify different types of comments
   - Categorize by clean code rules

2. **Clean Bad Comments**
   - Remove redundant comments that repeat code
   - Remove obvious noise comments
   - Remove closing brace comments
   - Remove commented-out code blocks

3. **Preserve Good Comments**
   - Keep intent explanations and clarifications
   - Keep consequence warnings
   - Keep legal/copyright notices
   - Keep TODO comments

4. **Suggest Code Improvements**
   - Identify where comments can be replaced with better naming
   - Suggest function extractions for complex logic

## Examples

```bash
# Clean comments in entire codebase
/clean-comments

# Clean comments in all JavaScript files
/clean-comments "**/*.js"

# Dry run to see what would be cleaned in entire codebase
/clean-comments --dry-run

# Dry run for specific files
/clean-comments "src/**/*.py" --dry-run

# Clean specific file
/clean-comments "app.js"
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
