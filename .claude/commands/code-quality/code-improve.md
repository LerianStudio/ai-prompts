---
allowed-tools: Read(*), Glob(*), Grep(*), Bash(*), Edit(*), MultiEdit(*), Task(*), TodoWrite(*)
description: Unified code improvement with multiple modes for refactor, standardize, simplify, and beautify
argument-hint: [mode:refactor|standardize|simplify|beautify] [target-path] [--dry-run]
---

# /code-improve

Unified code improvement command supporting multiple enhancement modes for comprehensive code quality improvements.

<context>
## Background Information

Code improvement encompasses multiple aspects: refactoring for better architecture, standardizing for consistency, simplifying for readability, and beautifying for maintainability. This unified command provides mode-based access to all code enhancement strategies while maintaining focused, specialized functionality.

## Usage Patterns

```bash
/code-improve refactor src/                    # Refactor code patterns and architecture
/code-improve standardize --dry-run            # Preview standardization changes
/code-improve simplify src/components/         # Reduce complexity
/code-improve beautify "*.ts"                  # Improve visual structure
/code-improve refactor src/api/users.ts        # Refactor specific file
```

**Arguments:**

- `mode`: Enhancement mode - refactor|standardize|simplify|beautify (required)
- `target-path`: File or directory path to improve (optional, defaults to context-based analysis)
- `--dry-run`: Preview changes without applying them (optional)
  </context>

<instructions>
## Mode-Based Processing

### Refactor Mode

**Purpose**: Analyze code for refactoring opportunities, identify code smells and anti-patterns
**Focus**: Architectural improvements, design patterns, SOLID principles
**Process**:

1. Read and understand code structure in specified path
2. Identify code smells and anti-patterns based on technology stack
3. Suggest specific refactoring techniques with clear rationale
4. Verify existing test coverage before making changes
5. Apply refactoring incrementally with validation at each step

**Technology-Specific Guidelines**:

- Large React components (>200 lines) → Extract components/hooks
- Multiple useState hooks → Use useReducer pattern
- Prop drilling → Implement composition patterns
- Duplicate code → Extract reusable utilities
- Complex conditionals → Extract business logic functions

### Standardize Mode

**Purpose**: Apply consistent coding standards, naming conventions, and architectural patterns
**Focus**: Consistency across codebase, naming conventions, code organization
**Process**:

1. Analyze codebase for inconsistencies in naming, formatting, patterns
2. Apply code style standards and consistent naming conventions
3. Organize project structure following best practices
4. Standardize code patterns for error handling, API responses
5. Update documentation to match standards

**Standardization Areas**:

- File and variable naming conventions
- Import organization and structure
- Error handling patterns
- API response formats
- Configuration management
- Testing structure consistency

### Simplify Mode

**Purpose**: Refactor complex code to be more readable and maintainable
**Focus**: Reducing complexity, improving readability, extracting methods
**Process**:

1. Analyze complexity hotspots and nested structures
2. Extract components and simplify logic
3. Replace complex conditionals with early returns
4. Use functional patterns over imperative loops
5. Improve naming with descriptive, domain-specific terms

**Simplification Strategies**:

- Extract custom hooks from complex components
- Simplify conditionals in JSX rendering
- Replace loops with array methods (map, filter, reduce)
- Use early returns instead of nested conditions
- Extract constants and configuration

### Beautify Mode

**Purpose**: Improve code readability and maintainability while preserving functionality
**Focus**: Visual structure, naming clarity, type safety enhancement
**Process**:

1. Identify readability issues and unclear naming
2. Apply naming conventions and descriptive identifiers
3. Extract functions for complex logic grouping
4. Improve type safety and add missing annotations
5. Restructure code for better logical flow

**Beautification Priorities**:

1. Clear naming (variables, functions, components)
2. Structure & complexity (extract functions, reduce nesting)
3. Clean code (remove unused code, apply DRY principles)
4. Type safety (fix loose types, add annotations)
   </instructions>

<examples>
## Mode Examples

### Refactor Mode Example

```bash
/code-improve refactor src/components/UserProfile.tsx
```

**Before (Code Smells)**:

```tsx
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [posts, setPosts] = useState([])
  const [followers, setFollowers] = useState([])
  // 200+ lines of mixed concerns
}
```

**After (Refactored)**:

```tsx
const UserProfile = ({ userId }) => {
  const { user, loading, error } = useUser(userId)
  const { posts } = useUserPosts(userId)
  const { followers } = useUserFollowers(userId)

  if (loading) return <ProfileSkeleton />
  if (error) return <ErrorBoundary error={error} />

  return <ProfileDisplay user={user} posts={posts} followers={followers} />
}
```

### Standardize Mode Example

```bash
/code-improve standardize src/ --dry-run
```

**Before (Inconsistent)**:

```tsx
// Mixed naming conventions
const get_user_data = (userId) => { ... }
const getUserProfile = (id) => { ... }
const fetchUser = (user_id) => { ... }
```

**After (Standardized)**:

```tsx
// Consistent camelCase with descriptive names
const getUserData = (userId: string): Promise<UserData> => { ... }
const getUserProfile = (userId: string): Promise<UserProfile> => { ... }
const getUserDetails = (userId: string): Promise<UserDetails> => { ... }
```

### Simplify Mode Example

```bash
/code-improve simplify src/utils/validation.ts
```

**Before (Complex)**:

```tsx
const validateUser = (user) => {
  if (
    user &&
    user.age &&
    user.age >= 18 &&
    user.age <= 65 &&
    user.status === 'active' &&
    !user.suspended &&
    (user.balance > 0 || user.creditLimit > 0)
  ) {
    return true
  }
  return false
}
```

**After (Simplified)**:

```tsx
const validateUser = (user: User): boolean => {
  if (!user) return false

  const isValidAge = user.age >= 18 && user.age <= 65
  const isActiveStatus = user.status === 'active' && !user.suspended
  const hasFunding = user.balance > 0 || user.creditLimit > 0

  return isValidAge && isActiveStatus && hasFunding
}
```

### Beautify Mode Example

```bash
/code-improve beautify src/hooks/
```

**Before (Hard to read)**:

```tsx
const useData = (id, opts) => {
  const [d, setD] = useState()
  const [l, setL] = useState(false)
  const [e, setE] = useState()
  // Unclear variable names and structure
}
```

**After (Beautiful)**:

```tsx
const useUserData = (
  userId: string,
  options: FetchOptions = {}
): UserDataResult => {
  const [userData, setUserData] = useState<UserData>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error>()

  // Clear, typed, descriptive implementation
}
```

</examples>

<requirements>
## Quality Standards

### Safety Requirements

- All functionality must remain identical after improvements
- Tests must continue to pass (run test suites if available)
- No behavior changes in business logic
- Git checkpoints before significant changes

### Implementation Standards

- Apply improvements incrementally with validation
- Follow project's existing coding standards and conventions
- Maintain or improve performance characteristics
- Ensure changes are idiomatic to the language/framework
- Update related documentation and comments

### Mode-Specific Requirements

**Refactor Mode**:

- Verify test coverage before making architectural changes
- Extract methods incrementally with validation
- Maintain component interfaces and public APIs
- Document refactoring rationale for complex changes

**Standardize Mode**:

- Create comprehensive before/after comparison
- Apply standards consistently across entire scope
- Update configuration files (linters, formatters) if needed
- Generate standardization report with changes made

**Simplify Mode**:

- Preserve all edge cases and error handling
- Maintain performance characteristics
- Document complexity reductions achieved
- Ensure simplified code is still comprehensive

**Beautify Mode**:

- Never change functionality or business logic
- Focus purely on readability and structure improvements
- Preserve exact behavior while improving clarity
- Create clear commit messages for cosmetic changes
  </requirements>

## Process

### Execution Flow

1. **Mode Detection**: Parse mode parameter and validate target path
2. **Context Analysis**: Understand codebase structure and conventions
3. **Mode-Specific Processing**: Execute improvement strategy based on selected mode
4. **Validation**: Ensure changes preserve functionality and pass quality checks
5. **Documentation**: Report improvements made and any follow-up recommendations

### Output Format

```markdown
# Code Improvement Report: [Mode] Mode

## Summary

- **Files Processed**: X files
- **Improvements Applied**: Y changes
- **Mode**: [Refactor/Standardize/Simplify/Beautify]

## Changes Made

### [Improvement Category]

- ✅ [Specific change with file:line reference]
- ✅ [Performance improvement achieved]
- ✅ [Pattern standardized across N files]

## Before/After Examples

[Key improvement examples with code snippets]

## Recommendations

- [ ] Follow-up improvements identified
- [ ] Additional modes that could benefit this code
- [ ] Configuration updates suggested
```

**Migration Note**: This command consolidates functionality from the former `/refactor`, `/standardize`, `/simplify`, and `/make-it-pretty` commands into a unified mode-based interface.
</file>
