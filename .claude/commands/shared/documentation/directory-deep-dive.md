---
allowed-tools: Read(*), Write(*), Grep(*), LS(*), Task(*)
description: Analyze directory structure and create comprehensive CLAUDE.md documentation
argument-hint: [--directory-path=<path>]
---

# /shared:documentation:directory-deep-dive

<instructions>
Analyze directory structure, architecture patterns, and create comprehensive CLAUDE.md documentation.

## Usage

```bash
/shared:documentation:directory-deep-dive                              # Analyze current directory
/shared:documentation:directory-deep-dive --directory-path=src/       # Analyze src directory
/shared:documentation:directory-deep-dive --directory-path=src/components  # Analyze components directory
```

## Target Directory

- Focus on the specified directory `$ARGUMENTS` or the current working directory

## Task Objectives

1. Investigate the implementation principles and architecture of the code in the target directory and subdirectories
2. Analyze design patterns, dependencies, abstractions, and code organization
3. Create or update CLAUDE.md documentation capturing discovered knowledge
4. Ensure proper placement of documentation in the analyzed directory
   </instructions>

<process>
## Investigation Process

### 1. Architecture Analysis

Look for and document:

- **Design patterns** being used throughout the codebase
- **Dependencies** and their purposes in the system
- **Key abstractions** and interfaces that define the architecture
- **Naming conventions** and code organization principles
- **Common implementation patterns** and architectural decisions

### 2. Code Structure Assessment

- Scan project structure to understand organization
- Identify main modules, packages, and entry points
- Map data flow and component relationships
- Locate configuration and environment files
- Analyze testing strategies and coverage

### 3. Documentation Generation

Create or update CLAUDE.md file including:

- **Purpose and responsibility** of the analyzed module
- **Key architectural decisions** and their rationale
- **Important implementation details** and patterns
- **Common patterns** used throughout the code
- **Gotchas** or non-obvious behaviors developers should know

### 4. Knowledge Capture

- Place the CLAUDE.md file in the directory being analyzed
- Ensure context is loaded when working in that specific area
- Include practical guidance for future development work
  </process>

<formatting>
## CLAUDE.md Template

```markdown
# Directory: [Directory Name]

## Purpose

[Brief description of this directory's responsibility]

## Architecture Overview

[High-level architectural patterns and decisions]

## Key Components

### [Component/File Name]

- **Purpose**: [What it does]
- **Dependencies**: [What it depends on]
- **Used By**: [What depends on it]
- **Key Patterns**: [Design patterns used]

## Design Patterns

- [Pattern 1]: [How it's implemented here]
- [Pattern 2]: [How it's implemented here]

## Dependencies

### Internal

- [Dependency 1]: [Why it's needed]
- [Dependency 2]: [Why it's needed]

### External

- [Library 1]: [Purpose and version]
- [Library 2]: [Purpose and version]

## Data Flow

1. [Step 1 in typical data flow]
2. [Step 2 in typical data flow]
3. [Step 3 in typical data flow]

## Configuration

- [Config file 1]: [What it configures]
- [Environment variables]: [Required vars and purpose]

## Testing Strategy

- **Unit Tests**: [Location and approach]
- **Integration Tests**: [Location and approach]
- **Test Coverage**: [Current coverage %]

## Common Tasks

### Adding a New [Component Type]

1. [Step 1]
2. [Step 2]
3. [Step 3]

### Modifying [Existing Pattern]

1. [Consideration 1]
2. [Consideration 2]

## Gotchas and Tips

- ⚠️ [Common pitfall 1]
- ⚠️ [Common pitfall 2]
- 💡 [Helpful tip 1]
- 💡 [Helpful tip 2]

## Performance Considerations

- [Performance aspect 1]
- [Performance aspect 2]

## Security Considerations

- [Security aspect 1]
- [Security aspect 2]

## Future Improvements

- [ ] [Planned improvement 1]
- [ ] [Planned improvement 2]

## Related Documentation

- [Link to related docs]
- [Link to ADRs]
```

</formatting>

<example>
## Example Output

```markdown
# Directory: src/components

## Purpose

Contains all React components organized by feature domain, following atomic design principles.

## Architecture Overview

Components follow a hierarchical structure:

- **atoms/**: Basic building blocks (buttons, inputs)
- **molecules/**: Simple component groups
- **organisms/**: Complex component sections
- **templates/**: Page-level layouts

## Key Components

### Button (atoms/Button.tsx)

- **Purpose**: Reusable button component with variants
- **Dependencies**: styled-components, theme
- **Used By**: All form components
- **Key Patterns**: Compound components, forwarded refs

### UserCard (molecules/UserCard.tsx)

- **Purpose**: Display user information card
- **Dependencies**: Button, Avatar, Typography
- **Used By**: UserList, ProfilePage
- **Key Patterns**: Composition, prop spreading

## Design Patterns

- **Compound Components**: Used in Form, Modal, and Dropdown
- **Render Props**: DataTable uses for custom cell rendering
- **Custom Hooks**: Each component has accompanying hooks
- **CSS-in-JS**: styled-components for all styling

## Testing Strategy

- **Unit Tests**: Each component has .test.tsx file
- **Storybook**: Visual testing and documentation
- **Coverage**: Currently at 87%

## Gotchas and Tips

- ⚠️ Always use theme variables, never hardcode colors
- ⚠️ Components must be wrapped in ThemeProvider
- 💡 Use the component generator: npm run generate:component
- 💡 Check Storybook for usage examples
```

</example>

<context>
## Implementation Notes
- This command helps create contextual documentation that gets loaded automatically when working in specific directories
- Focus on practical, actionable information that helps developers understand and work with the code
- Include both high-level architectural concepts and specific implementation details
- Document not just what the code does, but why it's structured the way it is

## Credit

This command is based on the work of Thomas Landgraf: https://thomaslandgraf.substack.com/p/claude-codes-memory-working-with
</context>
