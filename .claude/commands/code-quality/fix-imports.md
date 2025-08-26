---
allowed-tools:
  [
    'Grep',
    'Glob',
    'Read',
    'Edit',
    'MultiEdit',
    'Write',
    'Bash',
    'LS',
    'TodoWrite'
  ]
description: 'Systematically fix import statements broken by file moves or renames'
argument-hint: "[paths/patterns] - specific paths or import patterns to fix, or 'resume', 'status', 'new'"
---

# Fix Broken Imports

I'll systematically fix import statements broken by file moves or renames.

Arguments: `$ARGUMENTS` - specific paths or import patterns to fix

## Import Analysis

I'll systematically analyze and fix import issues in your codebase by:

- Detecting broken import statements
- Resolving moved or renamed files
- Updating import paths consistently

## Phase 1: Import Analysis

**Analysis Process:**

1. Scan for broken imports across the codebase
2. Identify moved or renamed files
3. Create comprehensive fix plan
4. Apply fixes systematically
5. Verify imports work correctly

I'll detect broken imports:

**Import Patterns:**

- File not found errors
- Module resolution failures
- Moved or renamed files
- Deleted dependencies
- Circular references

**Smart Detection:**

- Language-agnostic scanning
- Path alias understanding
- Barrel export recognition
- External vs internal imports

## Phase 2: Resolution Planning

Based on analysis, I'll create resolution plan:

**Resolution Strategy:**

1. Exact filename matches
2. Similar name suggestions
3. Export symbol search
4. Path recalculation
5. Import removal if needed

I'll write this plan to `fix-imports/plan.md` with:

- Each broken import location
- Possible resolutions
- Confidence level
- Fix approach

## Phase 3: Intelligent Fixing

I'll fix imports matching your patterns:

**Resolution Patterns:**

- Update relative paths correctly
- Maintain path alias usage
- Preserve import grouping
- Follow sorting conventions

**Ambiguity Handling:**

- Show multiple matches
- Provide context for choice
- Never guess when uncertain
- Track decisions for consistency

## Phase 4: Incremental Fixing

I'll fix imports systematically:

**Execution Process:**

1. Create git checkpoint
2. Fix import with verification
3. Check for new breaks
4. Update plan progress
5. Move to next import

**Progress Tracking:**

- Mark each fix in plan
- Record resolution choices
- Create meaningful commits

## Phase 5: Verification

After fixing imports:

- Syntax validation
- No new broken imports
- Circular dependency check
- Build verification if possible

## Context Continuity

**Session Resume:**
When you return and run `/fix-imports` or `/fix-imports resume`:

- Load broken imports list
- Show fixing statistics
- Continue from last import
- Apply same resolution patterns

**Progress Example:**

```
RESUMING IMPORT FIXES
├── Total Broken: 34
├── Fixed: 21 (62%)
├── Current: src/utils/helpers.js
└── Next: src/components/Header.tsx

Continuing fixes...
```

## Practical Examples

**Start Fixing:**

```
/fix-imports                  # Fix all broken imports
/fix-imports src/            # Focus on directory
/fix-imports "components"    # Fix component imports
```

**Analysis Options:**

```
/fix-imports status    # Check current state
/fix-imports scan      # Full analysis
/fix-imports verify    # Check fixes
```

## Safety Guarantees

**Protection Measures:**

- Git checkpoint before fixes
- Incremental changes
- Verification after each fix
- Clear decision audit

**Important:** I will NEVER:

- Guess ambiguous imports
- Break working imports
- Add AI attribution
- Create circular dependencies

## What I'll Actually Do

1. **Scan completely** - Find all broken imports
2. **Analyze smartly** - Understand move patterns
3. **Fix accurately** - Correct paths precisely
4. **Verify completely** - Ensure all imports work
5. **Document changes** - Track all modifications

I'll apply consistent patterns and thorough verification throughout the import fixing process.
