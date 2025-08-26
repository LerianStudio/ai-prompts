# Midaz Console - Core Patterns Documentation

## Overview

This documentation provides a comprehensive analysis of the architectural patterns, conventions, and best practices used in the Midaz Console application. The codebase demonstrates a sophisticated implementation of Clean Architecture principles with modern React/Next.js patterns.

## Documentation Structure

### 📁 [Architecture Patterns](./architecture-patterns.md)
Deep dive into the Clean Architecture implementation with three distinct layers:
- **Domain Layer**: Business logic and entities
- **Application Layer**: Use cases, controllers, DTOs, and mappers
- **Infrastructure Layer**: External integrations and framework-specific code
- Dependency injection with InversifyJS
- Error handling and observability patterns

### 📁 [Component Patterns](./component-patterns.md)
Comprehensive guide to UI component architecture:
- Compound component pattern for flexibility
- Radix UI primitives for accessibility
- Tailwind CSS with Class Variance Authority (CVA)
- Storybook documentation patterns
- Performance optimization techniques
- Testing strategies for components

### 📁 [API Integration Patterns](./api-integration-patterns.md)
Detailed exploration of API communication:
- Backend for Frontend (BFF) pattern
- HTTP service layer with interceptors
- Repository pattern implementation
- React Query integration for server state
- Pagination and real-time updates
- Caching strategies and optimistic updates

### 📁 [Form Handling Patterns](./form-handling-patterns.md)
Advanced form management techniques:
- React Hook Form with Zod validation
- Custom form field components
- Multi-step forms with validation
- Dynamic and conditional fields
- Form state persistence
- Complex validation patterns

## Technology Stack

### Core Framework
- **Next.js 15+**: App Router architecture
- **React 19+**: Latest React features
- **TypeScript**: Strict type safety

### State Management
- **React Query (TanStack Query)**: Server state management
- **React Hook Form**: Form state handling
- **Context API**: Application state sharing

### UI & Styling
- **Tailwind CSS v4+**: Utility-first CSS
- **Radix UI**: Accessible component primitives
- **Class Variance Authority (CVA)**: Component variants
- **Framer Motion**: Animations

### Validation & Schema
- **Zod**: Runtime schema validation
- **TypeScript**: Compile-time type checking

### Infrastructure
- **InversifyJS**: Dependency injection
- **OpenTelemetry**: Distributed tracing
- **Axios**: HTTP client
- **MongoDB**: Document storage

### Development Tools
- **Storybook**: Component documentation
- **Jest**: Unit testing
- **React Testing Library**: Component testing
- **Playwright**: E2E testing
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Key Architectural Principles

### 1. Clean Architecture
- Clear separation of concerns across layers
- Dependency inversion principle
- Business logic isolated from frameworks
- Testable and maintainable code structure

### 2. Domain-Driven Design
- Rich domain models
- Ubiquitous language
- Bounded contexts
- Aggregate roots

### 3. SOLID Principles
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 4. Design Patterns
- Repository Pattern
- Factory Pattern
- Observer Pattern
- Strategy Pattern
- Decorator Pattern
- Provider Pattern

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── (auth-routes)/       # Authentication pages
│   ├── (routes)/            # Main application routes
│   └── api/                 # API routes (BFF layer)
│
├── core/                    # Clean Architecture core
│   ├── domain/              # Business logic
│   │   ├── entities/        # Domain models
│   │   └── repositories/    # Repository interfaces
│   ├── application/         # Application layer
│   │   ├── use-cases/       # Business operations
│   │   ├── controllers/     # Request handlers
│   │   ├── dto/             # Data transfer objects
│   │   └── mappers/         # DTO-Entity mappers
│   └── infrastructure/      # External concerns
│       ├── midaz/           # Midaz API integration
│       ├── midaz-plugins/   # Plugin system
│       ├── mongo/           # MongoDB repositories
│       └── container-registry/ # DI configuration
│
├── components/              # React components
│   ├── ui/                  # Primitive components
│   └── [feature]/           # Feature components
│
├── client/                  # Frontend API clients
├── hooks/                   # Custom React hooks
├── lib/                     # Utility libraries
├── providers/               # React providers
├── schema/                  # Zod schemas
├── types/                   # TypeScript types
└── utils/                   # Helper functions
```

## Development Workflow

### 1. Feature Development
1. Define domain entities and business rules
2. Create repository interfaces
3. Implement use cases for business operations
4. Create DTOs and mappers
5. Implement repository with external services
6. Build UI components with proper patterns
7. Add form validation with Zod schemas
8. Write tests at appropriate levels

### 2. Component Development
1. Create component with compound pattern
2. Use Radix UI primitives for accessibility
3. Style with Tailwind CSS and CVA
4. Create Storybook stories
5. Write MDX documentation
6. Add component tests

### 3. API Integration
1. Define DTO interfaces
2. Create mapper functions
3. Implement repository pattern
4. Add React Query hooks
5. Handle errors consistently
6. Implement caching strategy

## Best Practices

### Code Organization
- One component per file
- Barrel exports for clean imports
- Consistent file naming (kebab-case)
- Colocate related code
- Clear module boundaries

### Type Safety
- Use TypeScript strict mode
- Define explicit types for all data
- Leverage type inference where appropriate
- Use discriminated unions for variants
- Avoid `any` type

### Performance
- Implement code splitting
- Use React.memo for expensive components
- Optimize bundle size
- Implement virtual scrolling for large lists
- Use proper caching strategies

### Testing
- Unit tests for business logic
- Integration tests for API layer
- Component tests for UI
- E2E tests for critical paths
- Maintain >80% coverage

### Security
- Validate all inputs
- Sanitize user data
- Use environment variables for secrets
- Implement proper authentication
- Follow OWASP guidelines

## Common Patterns Examples

### Creating a New Feature

1. **Define the Entity**
```typescript
// src/core/domain/entities/feature-entity.ts
export class FeatureEntity {
  constructor(
    public id: string,
    public name: string,
    public metadata: MetadataEntity
  ) {}
}
```

2. **Create Repository Interface**
```typescript
// src/core/domain/repositories/feature-repository.ts
export interface FeatureRepository {
  create(feature: FeatureEntity): Promise<FeatureEntity>
  findById(id: string): Promise<FeatureEntity>
}
```

3. **Implement Use Case**
```typescript
// src/core/application/use-cases/features/create-feature-use-case.ts
export class CreateFeatureUseCase {
  constructor(private repository: FeatureRepository) {}
  
  async execute(dto: CreateFeatureDTO): Promise<FeatureEntity> {
    const entity = FeatureMapper.fromDTO(dto)
    return this.repository.create(entity)
  }
}
```

4. **Create UI Component**
```typescript
// src/components/features/feature-form.tsx
export function FeatureForm() {
  const form = useForm({
    resolver: zodResolver(featureSchema)
  })
  
  const createFeature = useCreateFeature()
  
  const onSubmit = form.handleSubmit(async (data) => {
    await createFeature.mutateAsync(data)
  })
  
  return (
    <Form {...form}>
      {/* Form fields */}
    </Form>
  )
}
```

## Migration Guide

### From Class Components to Functional Components
- Use hooks for state management
- Replace lifecycle methods with useEffect
- Use React.memo for optimization

### From Redux to React Query
- Move server state to React Query
- Use mutations for data updates
- Implement optimistic updates
- Leverage built-in caching

### From CSS Modules to Tailwind
- Replace CSS classes with utility classes
- Use CVA for component variants
- Implement responsive design with breakpoints
- Use CSS variables for theming

## Performance Metrics

The architecture is optimized for:
- **First Contentful Paint (FCP)**: < 1.2s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **First Input Delay (FID)**: < 100ms

## Monitoring & Observability

### OpenTelemetry Integration
- Distributed tracing across services
- Performance metrics collection
- Error tracking and reporting
- Custom span attributes

### Logging Strategy
- Structured logging with context
- Log levels (error, warn, info, debug)
- Correlation IDs for request tracking
- Sensitive data masking

## Security Considerations

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Session management
- Multi-tenant isolation

### Data Protection
- Input validation at all layers
- SQL injection prevention
- XSS protection
- CSRF tokens
- Secure headers

## Contributing

When contributing to this codebase:
1. Follow established patterns
2. Maintain Clean Architecture principles
3. Write comprehensive tests
4. Document new patterns
5. Update relevant documentation
6. Ensure code quality standards

## Resources

### Internal Documentation
- [Architecture Patterns](./architecture-patterns.md)
- [Component Patterns](./component-patterns.md)
- [API Integration Patterns](./api-integration-patterns.md)
- [Form Handling Patterns](./form-handling-patterns.md)

### External Resources
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [React Patterns](https://reactpatterns.com/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [Radix UI](https://www.radix-ui.com/)
- [React Query](https://tanstack.com/query/latest)

## Conclusion

The Midaz Console demonstrates a mature, well-architected application that balances:
- **Maintainability** through Clean Architecture
- **Developer Experience** with modern tooling
- **Performance** through optimization techniques
- **Accessibility** with Radix UI primitives
- **Type Safety** with TypeScript and Zod
- **Testability** through dependency injection

This architecture provides a solid foundation for building scalable, maintainable financial applications while ensuring code quality and developer productivity.