---
allowed-tools: Read(*), Write(*), Grep(*), LS(*), Task(*)
description: Analyze directory structure and create comprehensive CLAUDE.md documentation
argument-hint: [directory-path]
---

# Directory Deep Dive

Analyze directory structure, architecture patterns, and create comprehensive CLAUDE.md documentation

## Usage

```bash
/directory-deep-dive                  # Analyze current directory
/directory-deep-dive src/             # Analyze src directory
/directory-deep-dive src/components   # Analyze components directory
```

## Instructions

1. **Target Directory**
   - Focus on the specified directory `$ARGUMENTS` or the current working directory

2. **Investigate Architecture**
   - Analyze the implementation principles and architecture of the code in this directory and its subdirectories
   - Look for:
     - Design patterns being used
     - Dependencies and their purposes
     - Key abstractions and interfaces
     - Naming conventions and code organization

3. **Create or Update Documentation**
   - Create a CLAUDE.md file capturing this knowledge
   - If one already exists, update it with newly discovered information
   - Include:
     - Purpose and responsibility of this module
     - Key architectural decisions
     - Important implementation details
     - Common patterns used throughout the code
     - Any gotchas or non-obvious behaviors

4. **Ensure Proper Placement**
   - Place the CLAUDE.md file in the directory being analyzed
   - This ensures the context is loaded when working in that specific area

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

## Credit

This command is based on the work of Thomas Landgraf: https://thomaslandgraf.substack.com/p/claude-codes-memory-working-with
