---
allowed-tools: Grep(*), Glob(*), Read(*), Edit(*), MultiEdit(*), Write(*), Bash(*), LS(*), TodoWrite(*)
description: Systematically fix import statements broken by file moves or renames
argument-hint: [--paths=<paths-or-patterns>] [--git-scope=<scope>]
---

# /shared:code-quality:fix-imports

<context>
This command systematically fixes import statements broken by file moves or renames. It can focus on git changes for faster, more relevant fixing, or analyze the entire codebase using traditional path-based approaches.
</context>

<instructions>
Systematically fix import statements broken by file moves or renames.

## Usage Patterns

```bash
# Git-focused import fixing (recommended for active development)
/shared:code-quality:fix-imports --git-scope=all-changes             # Fix imports in changed files
/shared:code-quality:fix-imports --git-scope=staged                 # Fix imports in staged files
/shared:code-quality:fix-imports --git-scope=branch                 # Fix imports in branch changes
/shared:code-quality:fix-imports --git-scope=last-commit            # Fix imports in last commit

# Traditional path-based fixing
/shared:code-quality:fix-imports --paths=src/                       # Fix imports in specific directory
/shared:code-quality:fix-imports --paths="**/*.ts,**/*.js"           # Fix imports in specific file patterns
/shared:code-quality:fix-imports                                    # Fix imports across entire codebase
```

**Arguments:**

- `--paths`: Specific file paths or patterns to analyze for import issues
- `--git-scope`: Git scope for focusing on specific changes - staged|unstaged|all-changes|branch|last-commit|commit-range=<range>

## Initial Setup

### Git Scope Analysis (when --git-scope used)

If `--git-scope` is specified:

```bash
# Source git utilities
if ! source .claude/utils/git-utilities.sh; then
    echo "Error: Could not load git utilities. Please ensure git-utilities.sh exists." >&2
    exit 1
fi

# Process git scope (this function handles validation, stats, and file listing)
target_files=$(process_git_scope "$git_scope")
```

**Git-Scope Import Benefits:**

- **Targeted Fixing**: Focus on import issues in files you're actively modifying
- **Performance**: Faster analysis on large codebases by focusing on changed files
- **Workflow Integration**: Fix imports as part of feature development or refactoring
- **Risk Reduction**: Lower chance of introducing unrelated import changes

</instructions>

<examples>
```bash
# Git-focused import fixing (recommended for active development)
/shared:code-quality:fix-imports --git-scope=all-changes             # Fix imports in changed files
/shared:code-quality:fix-imports --git-scope=staged                 # Fix imports in staged files
/shared:code-quality:fix-imports --git-scope=branch                 # Fix imports in branch changes
/shared:code-quality:fix-imports --git-scope=last-commit            # Fix imports in last commit

# Traditional path-based fixing

/shared:code-quality:fix-imports --paths=src/ # Fix imports in specific directory
/shared:code-quality:fix-imports --paths="**/\*.ts,**/\*.js" # Fix imports in specific file patterns
/shared:code-quality:fix-imports # Fix imports across entire codebase

```
</examples>

<process>
## Import Analysis

Systematically analyze and fix import issues in your codebase by:

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
When you return and run `/shared:code-quality:fix-imports` or `/shared:code-quality:fix-imports resume`:

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

/shared:code-quality:fix-imports # Fix all broken imports
/shared:code-quality:fix-imports src/ # Focus on directory
/shared:code-quality:fix-imports "components" # Fix component imports

```

**Analysis Options:**

```

/shared:code-quality:fix-imports status # Check current state
/shared:code-quality:fix-imports scan # Full analysis
/shared:code-quality:fix-imports verify # Check fixes

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

Apply consistent patterns and thorough verification throughout the import fixing process.
</process>
```
