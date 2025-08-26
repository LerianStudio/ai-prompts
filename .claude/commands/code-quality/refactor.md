---
allowed-tools: Read(*), Glob(*), Grep(*), Bash(*), Edit(*), MultiEdit(*), Task(*)
description: Analyze code for refactoring opportunities, identify code smells, and suggest improvements with language-specific patterns
argument-hint: [file-or-directory-path]
---

# /refactor

Analyze code for refactoring opportunities, identify code smells and anti-patterns, then suggest and implement improvements.

## Usage

```bash
/refactor [path]
```

**Arguments:**

- `path`: File or directory path to analyze for refactoring (required)

## Instructions

Follow these steps to analyze and refactor code:

1. Read and understand the code structure in the specified file/directory
2. Identify code smells and anti-patterns:

   **Frontend React/TS Smells:**
   - Large React components (>200 lines)
   - Multiple useState hooks (use useReducer instead)
   - Inline event handlers in JSX
   - Missing dependency array in useEffect
   - Prop drilling beyond 2-3 levels
   - Direct DOM manipulation in React
   - Non-memoized expensive calculations
   - Duplicate code across components

   **TypeScript-specific:**
   - Using 'any' type extensively
   - Missing interface definitions
   - Primitive obsession (using strings for IDs)
   - Optional chaining abuse (?.)
   - Union types instead of enums
   - Missing generic type parameters

3. Suggest specific refactoring techniques:

   **React Component Patterns:**
   - Extract custom hooks for reusable logic
   - Split large components into smaller ones
   - Use compound components for complex UI
   - Implement render props for flexible components
   - Move to composition over prop drilling
   - Create higher-order components (HOCs) for cross-cutting concerns

   **TypeScript Patterns:**
   - Replace magic strings with enums/const assertions
   - Extract interfaces for component props
   - Use generic types for reusable components
   - Implement discriminated unions for state management
   - Create branded types for type safety
   - Use utility types (Pick, Omit, Partial)

4. Verify existing test coverage before refactoring:
   - **React**: Check coverage with Jest and React Testing Library
   - **TypeScript**: Use `jest --coverage` or `vitest --coverage`
   - **E2E**: Verify critical user flows with Cypress/Playwright
   - Ensure components have proper unit tests
   - Add integration tests if coverage is insufficient

5. Apply refactoring incrementally:
   - Make one change at a time
   - Run tests after each change:
     - **Frontend**: `npm test` or `yarn test`
     - **TypeScript**: `npm run type-check` or `tsc --noEmit`
     - **Linting**: `npm run lint` or `eslint src/`
   - Use IDE refactoring tools (VS Code extensions)
   - Commit working states with clear messages

6. Document the refactoring rationale in commit messages

Prioritize refactorings by:

- Impact on component reusability and maintainability
- Performance improvements (React DevTools Profiler)
- Bundle size reduction opportunities
- Type safety improvements
- User experience enhancements
- Developer experience improvements

Deliverables:

- Refactored code with improved structure
- Updated tests maintaining coverage
- Performance benchmarks (if applicable)
- Documentation of changes and rationale
