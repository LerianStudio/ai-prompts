---
allowed-tools:
  [
    'Read',
    'Write',
    'Edit',
    'MultiEdit',
    'Glob',
    'Grep',
    'LS',
    'Bash',
    'TodoWrite'
  ]
description: 'Create complete feature structures based on project patterns'
argument-hint: 'feature-name or component-name'
---

# Intelligent Scaffolding

I'll create complete feature structures based on your project patterns.

Arguments: `$ARGUMENTS` - feature name or component to scaffold

## Pattern-Based Scaffolding

I'll analyze your existing codebase patterns to create consistent, well-structured features:

- Analyze existing file structures and naming conventions
- Generate components following project patterns
- Create associated tests, styles, and documentation

## Phase 1: Pattern Discovery

**Scaffolding Process:**

1. Analyze existing project structure and patterns
2. Identify naming conventions and file organization
3. Create comprehensive scaffolding plan
4. Generate all necessary files with consistent patterns
5. Verify structure follows project conventions

I'll discover your project patterns:

**Pattern Analysis:**

- File organization structure
- Naming conventions
- Testing patterns
- Import/export styles
- Documentation standards

**Smart Detection:**

- Find similar features already implemented
- Identify architectural patterns
- Detect testing frameworks
- Understand build configuration

## Phase 2: Scaffolding Planning

Based on patterns, I'll create a scaffolding plan:

**Component Structure:**

- Main feature files
- Test files
- Documentation
- Configuration updates
- Integration points

I'll write this plan to `scaffold/plan.md` with:

- Each file to create
- Template patterns to follow
- Integration requirements
- Creation order

## Phase 3: Intelligent Generation

I'll generate files matching your patterns:

**Pattern Matching:**

- Use your file naming style
- Follow your directory structure
- Match your code conventions
- Apply your testing patterns

**Content Generation:**

- Boilerplate from existing code
- Imports matching your style
- Test structure from your patterns
- Documentation in your format

## Phase 4: Incremental Creation

I'll create files systematically:

**Execution Process:**

1. Create directory structure
2. Generate each component file
3. Add appropriate tests
4. Update integration points
5. Track each creation in state

**Progress Tracking:**

- Mark each file created in plan
- Update state with file paths
- Create meaningful commits

## Phase 5: Integration

After scaffolding:

- Update route configurations
- Add to module exports
- Update build configuration
- Verify everything connects

## Context Continuity

**Session Resume:**
When you return and run `/scaffold` or `/scaffold resume`:

- Load existing plan and progress
- Show what was already created
- Continue from last component
- Maintain pattern consistency

**Progress Example:**

```
RESUMING SCAFFOLDING
├── Feature: UserDashboard
├── Created: 5 of 8 files
├── Last: components/UserStats.tsx
└── Next: tests/UserStats.test.tsx

Continuing scaffolding...
```

## Practical Examples

**Start Scaffolding:**

```
/scaffold UserProfile          # Create user profile feature
/scaffold "auth module"        # Create authentication module
/scaffold PaymentService       # Create payment service
```

**Scaffolding Options:**

```
/scaffold status    # Check progress
/scaffold preview   # Show planned structure
/scaffold verify    # Validate patterns
```

## Safety Guarantees

**Protection Measures:**

- Preview before creation
- Incremental file generation
- Pattern validation
- Integration verification

**Important:** I will NEVER:

- Overwrite existing files
- Break existing imports
- Add AI attribution
- Create without following patterns

## What I'll Actually Do

1. **Analyze deeply** - Understand your patterns
2. **Plan completely** - Map all components
3. **Generate intelligently** - Match your style
4. **Validate thoroughly** - Ensure quality
5. **Integrate seamlessly** - Connect everything

I'll ensure consistent patterns and seamless integration throughout the scaffolding process.
