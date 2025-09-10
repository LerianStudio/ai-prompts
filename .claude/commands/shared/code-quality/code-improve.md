---
allowed-tools: Read(*), Glob(*), Grep(*), Edit(*), MultiEdit(*), Bash(*), Task(*), TodoWrite(*)
description: Unified code improvement with multiple modes for refactor, standardize, simplify, and beautify
argument-hint: [--mode=refactor|standardize|simplify|beautify] [--target=<path>] [--git-scope=<scope>] [--apply-fixes]
---

# /code-quality:code-improve

<instructions>
Unified code improvement command supporting multiple enhancement modes for comprehensive code quality improvements with both automated fixes and manual recommendations.

<purpose>
- Apply automated code improvements with multiple enhancement strategies
- Support refactor, standardize, simplify, and beautify modes
- Git-focused improvements for active development workflows
- Safe automated fixes with manual review options
</purpose>

<scope>
Covers comprehensive code enhancement including architectural refactoring, style standardization, complexity reduction, and readability improvements across the entire codebase or targeted areas.
</scope>
</instructions>

<context>
This command provides mode-based code improvement functionality, allowing developers to apply specific types of enhancements based on their current needs while maintaining code safety and functionality.
</context>

<usage_examples>

## Mode-Based Examples

```bash
# Refactor Mode - Architectural improvements
/code-quality:code-improve --mode=refactor --target=src/components/   # Refactor components
/code-quality:code-improve --mode=refactor --git-scope=branch         # Refactor branch changes

# Standardize Mode - Consistency improvements
/code-quality:code-improve --mode=standardize --target=src/           # Standardize directory
/code-quality:code-improve --mode=standardize --git-scope=staged      # Standardize staged files

# Simplify Mode - Complexity reduction
/code-quality:code-improve --mode=simplify --target=src/utils/        # Simplify utilities
/code-quality:code-improve --mode=simplify --git-scope=all-changes    # Simplify all changes

# Beautify Mode - Readability improvements
/code-quality:code-improve --mode=beautify --target=src/hooks/        # Beautify hooks
/code-quality:code-improve --mode=beautify --apply-fixes              # Auto-apply safe fixes
```

</usage_examples>

<process>
<mode_selection>
  <action>Determine improvement mode and validate parameters</action>
  <modes>
    - **refactor**: Architectural improvements and design pattern application
    - **standardize**: Consistency and coding standards enforcement
    - **simplify**: Complexity reduction and readability enhancement
    - **beautify**: Visual structure and naming improvements
  </modes>
</mode_selection>

<git_scope_analysis>
<action>Process git scope when specified</action>
<scopes> - **staged**: Focus on staged files only - **all-changes**: All uncommitted changes - **branch**: Feature branch changes vs main/master - **last-commit**: Most recent commit changes
</scopes>
</git_scope_analysis>

<improvement_execution>
<action>Apply mode-specific improvements based on selection</action>
<safety> - Preserve all functionality and business logic - Run tests if available to validate changes - Create git checkpoints for significant modifications - Apply improvements incrementally with validation
</safety>
</improvement_execution>
</process>

<improvement_modes>
<refactor_mode>
<purpose>Analyze code for refactoring opportunities and apply architectural improvements</purpose>
<focus> - Extract large components into smaller, focused components - Apply SOLID principles and design patterns - Identify and eliminate code smells - Improve component composition and reusability
</focus>
<techniques> - Extract custom hooks from complex components - Split large functions into smaller, focused functions - Apply dependency injection patterns - Implement proper separation of concerns
</techniques>
</refactor_mode>

<standardize_mode>
<purpose>Apply consistent coding standards and naming conventions</purpose>
<focus> - Consistent naming conventions across codebase - Standardized file and directory organization - Uniform code formatting and style - Consistent error handling patterns
</focus>
<techniques> - Apply consistent camelCase/PascalCase naming - Standardize import organization and structure - Enforce consistent API response formats - Unify configuration and constant management
</techniques>
</standardize_mode>

<simplify_mode>
<purpose>Reduce complexity and improve code readability</purpose>
<focus> - Simplify complex conditionals and nested structures - Replace imperative patterns with functional approaches - Extract and name complex expressions - Reduce cognitive load through clarity
</focus>
<techniques> - Use early returns instead of nested conditions - Replace loops with array methods (map, filter, reduce) - Extract boolean expressions into named variables - Simplify JSX conditional rendering
</techniques>
</simplify_mode>

<beautify_mode>
<purpose>Improve visual structure and code aesthetics</purpose>
<focus> - Clear, descriptive variable and function names - Logical code organization and spacing - Improved type annotations and documentation - Enhanced readability through structure
</focus>
<techniques> - Apply descriptive naming for variables and functions - Organize code sections with clear logical flow - Add missing type annotations and interfaces - Remove unused code and optimize imports
</techniques>
</beautify_mode>
</improvement_modes>

<safety_requirements>
<functionality_preservation>

- All business logic must remain identical
- Test suites must continue to pass
- No breaking changes to public APIs
- Preserve performance characteristics
  </functionality_preservation>

<validation_process>

- Apply changes incrementally with validation
- Run available test suites after modifications
- Check TypeScript compilation if applicable
- Validate linting and formatting standards
  </validation_process>

<rollback_capability>

- Create git checkpoints before major changes
- Provide clear before/after comparisons
- Document all modifications made
- Support easy rollback of changes
  </rollback_capability>
  </safety_requirements>

<automated_fixes>
<safe_improvements>

- Remove unused imports and variables
- Fix consistent indentation and spacing
- Add missing semicolons and trailing commas
- Convert var to const/let where appropriate
- Extract magic numbers into named constants
  </safe_improvements>

<manual_review_required>

- Complex architectural refactoring
- Performance optimization changes
- Security-related modifications
- Logic flow alterations
  </manual_review_required>
  </automated_fixes>

<deliverables>
- Mode-specific code improvements applied
- Detailed report of changes made
- Before/after code examples for key improvements
- List of manual review items requiring attention
- Recommendations for follow-up improvements
- Documentation of any breaking changes (if unavoidable)
</deliverables>
