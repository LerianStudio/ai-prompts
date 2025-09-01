# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

<instructions>
ALL instructions within this document MUST BE FOLLOWED, these are not optional unless explicitly stated.

Core Requirements:

- ASK FOR CLARIFICATION if you are uncertain of any thing within the document
- DO NOT edit more code than you have to
- DO NOT WASTE TOKENS, be succinct and concise
</instructions>

<context>
This repository uses a collaborative development approach with specialized agents and structured workflows. The codebase follows modern best practices with emphasis on maintainability, performance, and thoughtful implementation.
</context>

## Collaboration Guidelines

<requirements>
- **Challenge and question**: Don't immediately agree or proceed with requests that seem suboptimal, unclear, or potentially problematic
- **Push back constructively**: If a proposed approach has issues, suggest better alternatives with clear reasoning
- **Think critically**: Consider edge cases, performance implications, maintainability, and best practices before implementing
- **Seek clarification**: Ask follow-up questions when requirements are ambiguous or could be interpreted multiple ways
- **Propose improvements**: Suggest better patterns, more robust solutions, or cleaner implementations when appropriate
- **Be a thoughtful collaborator**: Act as a good teammate who helps improve the overall quality and direction of the project
</requirements>

## Development Guidelines

### API Integration Standards

Follow the established patterns defined in `protocol-assets/content/docs/console/api-integration-patterns.md`:

- React Query integration with custom hooks for each resource
- Standardized fetcher utilities with authentication and error handling
- Consistent query key patterns for cache management
- Resource-specific client patterns with proper TypeScript typing
- Environment-based service configuration

### Architecture Patterns

Adhere to the architecture defined in `protocol-assets/content/docs/console/architecture-patterns.md`:

- Clean Architecture with proper layer separation and dependency injection
- API client layer with React Query hooks
- Service integration through environment configuration
- Data mapping patterns between external APIs and internal DTOs
- HTTP service patterns with logging, authentication, and observability

### Coding Conventions

Follow the coding standards outlined in `protocol-assets/content/docs/console/coding-conventions.md`:

- File naming conventions (kebab-case for components, resource naming for API clients)
- TypeScript conventions with descriptive interfaces and types
- Variable and function naming patterns
- Import/export organization and component structure
- Testing and Storybook conventions

### Component Architecture

Implement components following patterns in `protocol-assets/content/docs/console/component-patterns.md`:

- UI primitives with comprehensive Storybook documentation
- Form components integrated with React Hook Form and shadcn/ui
- Compound component patterns for complex UI elements
- Business component patterns for reusable functionality
- Loading and error handling patterns

### Form Handling Standards

Use form patterns defined in `protocol-assets/content/docs/console/form-handling-patterns.md`:

- React Hook Form with shadcn/ui Form components and Zod validation
- Dynamic field arrays for complex forms
- Modular Zod schema design with custom validation rules
- Specialized form components (metadata, country, currency fields)
- Async form submission with proper error handling

## Best Practices

<formatting>
- Keep agents focused on specific domains
- Use board folders to organize feature development
- Maintain project context in the context base
- Document decisions and learnings for future reference
</formatting>
