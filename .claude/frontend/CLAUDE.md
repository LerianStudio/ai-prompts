# CLAUDE.md - Frontend Configuration

This file provides frontend-specific guidance for React applications and UI development.

## Frontend Development Guidelines

### API Integration Standards

Follow the established patterns defined in `@protocol-assets/frontend/content/docs/console/api-integration-patterns.md`:

- React Query integration with custom hooks for each resource
- Standardized fetcher utilities with authentication and error handling
- Consistent query key patterns for cache management
- Resource-specific client patterns with proper TypeScript typing
- Environment-based service configuration

### Architecture Patterns

Adhere to the architecture defined in `@protocol-assets/frontend/content/docs/console/architecture-patterns.md`:

- Clean Architecture with proper layer separation and dependency injection
- API client layer with React Query hooks
- Service integration through environment configuration
- Data mapping patterns between external APIs and internal DTOs
- HTTP service patterns with logging, authentication, and observability

### Coding Conventions

Follow the coding standards outlined in `@protocol-assets/shared/content/docs/console/coding-conventions.md`:

- File naming conventions (kebab-case for components, resource naming for API clients)
- TypeScript conventions with descriptive interfaces and types
- Variable and function naming patterns
- Import/export organization and component structure
- Testing and Storybook conventions

### Component Architecture

Implement components following patterns in `@protocol-assets/frontend/content/docs/console/component-patterns.md`:

- UI primitives with comprehensive Storybook documentation
- Form components integrated with React Hook Form and shadcn/ui
- Compound component patterns for complex UI elements
- Business component patterns for reusable functionality
- Loading and error handling patterns

### Form Handling Standards

Use form patterns defined in `@protocol-assets/frontend/content/docs/console/form-handling-patterns.md`:

- React Hook Form with shadcn/ui Form components and Zod validation
- Dynamic field arrays for complex forms
- Modular Zod schema design with custom validation rules
- Specialized form components (metadata, country, currency fields)
- Async form submission with proper error handling

### React Best Practices

- Use functional components with hooks
- Implement proper state management with useState/useReducer or external state libraries
- Optimize performance with useMemo, useCallback, and React.memo when appropriate
- Follow React Query patterns for server state management
- Implement proper error boundaries and loading states
- Use TypeScript strictly for better type safety
- Follow accessibility (a11y) standards
- Implement responsive design patterns

### UI/UX Guidelines

- Follow design system principles and component library standards
- Maintain consistent spacing, typography, and color schemes
- Implement proper loading states and error messaging
- Ensure mobile-first responsive design
- Test components in multiple viewport sizes
- Use semantic HTML elements
- Implement proper focus management and keyboard navigation