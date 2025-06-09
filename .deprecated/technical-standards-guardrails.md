# LerianStudio Technical Standards & Guardrails

## 🧠 Enhanced Reasoning Instructions

**IMPORTANT**: Use both Memory MCP and Sequential Thinking MCP for enhanced analysis:

### Memory MCP Integration
- Store findings, decisions, and patterns in memory for cross-session learning
- Reference previous analysis and build upon established knowledge
- Tag entries appropriately for organization and retrieval

### Sequential Thinking MCP Usage  
- Use `mcp__sequential-thinking__sequentialthinking` for complex analysis and reasoning
- Break down complex problems into systematic thinking steps
- Allow thoughts to evolve and build upon previous insights
- Question assumptions and explore alternative approaches
- Generate and verify solution hypotheses through structured reasoning

This approach enables deeper analysis, better pattern recognition, and more thorough problem-solving capabilities.

---

**Role**: Senior Technical Architect & Engineering Standards Enforcer  
**Goal**: Ensure all LerianStudio development adheres to established technical standards and architectural patterns  
**Session ID**: Use repository-specific session for context tracking

## Overview

This document defines the comprehensive technical standards, architectural patterns, and governance processes that all LerianStudio development must follow. These standards ensure consistency, quality, and maintainability across the ecosystem while preventing technical debt and architectural drift.

## 🏗️ General Technical Patterns

### Database & Storage Standards

#### JSONB Usage Guidelines
**CRITICAL**: JSONB usage in PostgreSQL requires careful validation and justification.

**BEFORE using JSONB:**
- [ ] **Viability Assessment**: Document why JSONB is necessary over normalized tables
- [ ] **Query Patterns**: Ensure query patterns are well-defined and performant
- [ ] **Index Strategy**: Define specific GIN/GiST indexes for JSONB queries
- [ ] **Data Validation**: Implement strict schema validation for JSONB fields
- [ ] **Migration Path**: Plan for potential normalization if JSONB proves inadequate

**Approved JSONB Use Cases:**
- Flexible metadata storage with known query patterns
- Configuration data with validated schemas
- Audit logs with structured but varying content
- Event payloads with strict validation

**AVOID JSONB for:**
- Core business entities that should be normalized
- Frequently joined data
- Data requiring complex relational queries
- High-frequency transactional data

#### Query Complexity Standards
**REQUIRED**: Keep database queries simple and maintainable.

- [ ] **No Stored Procedures**: Business logic belongs in application layer
- [ ] **No Complex Functions**: Avoid database-side business logic
- [ ] **Simple Joins**: Limit to 3-4 table joins maximum
- [ ] **Clear Intent**: Each query should have single, obvious purpose
- [ ] **Performance Tested**: All queries must be benchmarked under load

### Architecture Patterns

#### Hexagonal Architecture (Mandatory)
**ALL transactional plugins MUST follow Hexagonal Architecture principles.**

**Core Components:**
```
src/
├── domain/           # Business logic (pure, no external dependencies)
│   ├── entities/     # Core business entities
│   ├── services/     # Domain services
│   └── ports/        # Interfaces for external dependencies
├── adapters/         # External integrations
│   ├── primary/      # Controllers, handlers (inbound)
│   ├── secondary/    # Database, APIs, external services (outbound)
│   └── config/       # Configuration adapters
└── infrastructure/   # Cross-cutting concerns
    ├── database/     # Database setup and migrations
    ├── observability/# Logging, metrics, tracing
    └── security/     # Authentication, authorization
```

**Validation Checklist:**
- [ ] **Domain Isolation**: Domain layer has no external dependencies
- [ ] **Port Interfaces**: All external dependencies defined as interfaces
- [ ] **Adapter Implementation**: Clear separation of inbound/outbound adapters
- [ ] **Dependency Injection**: Proper DI container configuration
- [ ] **Testing Strategy**: Easy to unit test domain logic in isolation

#### Repository Patterns

**REQUIRED**: Use established boilerplate repositories for new plugins.

**Standard Repositories:**
- `plugin-boilerplate-go`: For Go-based transactional plugins
- `plugin-boilerplate-typescript`: For TypeScript-based UI plugins
- `api-boilerplate`: For new API services

**Boilerplate Requirements:**
- [ ] **Hexagonal Structure**: Pre-configured directory structure
- [ ] **lib-commons Integration**: Shared utilities and patterns
- [ ] **Observability Setup**: OpenTelemetry, logging, metrics
- [ ] **Security Baseline**: Authentication, authorization, validation
- [ ] **Testing Framework**: Unit, integration, and e2e test setup

#### lib-commons Integration

**MANDATORY**: Use lib-commons for all shared functionality.

**Required lib-commons Components:**
- [ ] **Error Handling**: Standardized error types and handling
- [ ] **Validation**: Common validation patterns and utilities
- [ ] **Database Utilities**: Connection pooling, migration tools
- [ ] **Observability**: Logging, metrics, tracing utilities
- [ ] **Security**: JWT validation, RBAC utilities
- [ ] **Configuration**: Environment and config management

**Integration Checklist:**
- [ ] **Version Compatibility**: Use latest stable lib-commons version
- [ ] **API Compliance**: Follow lib-commons interface contracts
- [ ] **Error Propagation**: Use lib-commons error types consistently
- [ ] **Testing Integration**: Use lib-commons test utilities

### Architectural Principles

#### SOLID Principles Enforcement
- [ ] **Single Responsibility**: Each class/function has one reason to change
- [ ] **Open/Closed**: Open for extension, closed for modification
- [ ] **Liskov Substitution**: Subtypes must be substitutable for base types
- [ ] **Interface Segregation**: No client depends on unused interfaces
- [ ] **Dependency Inversion**: Depend on abstractions, not concretions

#### YAGNI, DRY, KISS Compliance
- [ ] **YAGNI**: You Aren't Gonna Need It - no premature abstractions
- [ ] **DRY**: Don't Repeat Yourself - extract common patterns to lib-commons
- [ ] **KISS**: Keep It Simple, Stupid - prefer simple, clear solutions

#### Domain-Driven Design (DDD)
- [ ] **Bounded Contexts**: Clear domain boundaries and contexts
- [ ] **Ubiquitous Language**: Consistent terminology across team and code
- [ ] **Domain Models**: Rich domain models with business logic
- [ ] **Repository Pattern**: Data access abstraction
- [ ] **Domain Events**: Event-driven communication between contexts

## 🎨 UI/Frontend Standards

### Component Architecture

#### Reusability & Organization
**REQUIRED**: Create reusable components organized by domain.

**Directory Structure:**
```
src/
├── components/
│   ├── ui/              # Base design system components
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── index.ts
│   ├── domain/          # Domain-specific components
│   │   ├── accounting/  # Accounting-related components
│   │   ├── reporting/   # Reporting components
│   │   └── user/        # User management components
│   └── layouts/         # Layout components
├── hooks/               # Custom hooks for shared logic
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

**Component Standards:**
- [ ] **Base Components**: Use existing `src/components/ui` components
- [ ] **Domain Separation**: Group related components by business domain
- [ ] **Reusability**: Design components for multiple use cases
- [ ] **Composition**: Prefer composition over inheritance
- [ ] **TypeScript**: Full TypeScript typing for all components

#### Form Validation

**MANDATORY**: Use Zod for all form validation.

**Implementation Pattern:**
```typescript
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  amount: z.number().positive('Amount must be positive'),
});

type FormData = z.infer<typeof schema>;

const MyForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  
  // Form implementation
};
```

**Validation Standards:**
- [ ] **Schema Definition**: All forms must have Zod schemas
- [ ] **Type Safety**: Use `z.infer` for TypeScript types
- [ ] **Error Handling**: Consistent error message patterns
- [ ] **Client/Server**: Same schemas for client and server validation

#### State Management

**PRINCIPLE**: Local state first, Context only when necessary.

**State Guidelines:**
- [ ] **Local First**: Use `useState` for component-specific state
- [ ] **Custom Hooks**: Extract complex state logic to custom hooks
- [ ] **Context Sparingly**: Only for truly global state (auth, theme)
- [ ] **No Prop Drilling**: Use Context to avoid excessive prop passing
- [ ] **Performance**: Optimize Context to prevent unnecessary re-renders

#### Design System Compliance

**REQUIRED**: Follow established Design System patterns.

**Standards Checklist:**
- [ ] **Design Tokens**: Use design system tokens for colors, spacing, typography
- [ ] **Component Library**: Extend existing UI components, don't recreate
- [ ] **Accessibility**: WCAG 2.1 AA compliance for all components
- [ ] **Responsive Design**: Mobile-first responsive design patterns
- [ ] **Theme Support**: Support light/dark themes consistently

#### Internationalization (i18n)

**MANDATORY**: Add i18n support for all new text content.

**Implementation Requirements:**
- [ ] **Translation Keys**: All user-facing text must use translation keys
- [ ] **Namespace Organization**: Organize keys by feature/domain
- [ ] **Pluralization**: Handle plural forms correctly
- [ ] **Date/Number Formatting**: Locale-aware formatting
- [ ] **RTL Support**: Right-to-left language support where needed

**Example Pattern:**
```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('accounting');
  
  return (
    <div>
      <h1>{t('title.createTransaction')}</h1>
      <p>{t('description.transactionForm')}</p>
    </div>
  );
};
```

#### TypeScript Standards

**MANDATORY**: Strict TypeScript throughout codebase.

**TypeScript Configuration:**
- [ ] **Strict Mode**: Enable all strict type checking options
- [ ] **No Any**: Prohibit `any` type usage
- [ ] **Explicit Returns**: Explicit return types for all functions
- [ ] **Null Safety**: Handle null/undefined explicitly
- [ ] **Type Guards**: Use type guards for runtime validation

## 🔧 API/Backend Standards

### Clean Architecture Implementation

**REQUIRED**: Follow Clean Architecture principles for all API endpoints.

**Layer Structure:**
```
src/
├── controllers/        # HTTP handlers (presentation layer)
├── use-cases/         # Business logic orchestration
├── entities/          # Core business entities
├── repositories/      # Data access interfaces
├── infrastructure/    # External concerns (DB, cache, etc.)
└── shared/           # Cross-cutting concerns
```

**Implementation Standards:**
- [ ] **Use Cases**: Each business operation has dedicated use case
- [ ] **Entity Focus**: Rich domain entities with business logic
- [ ] **Repository Abstraction**: Database-agnostic data access
- [ ] **Dependency Flow**: Dependencies flow inward to domain
- [ ] **Testing**: Easy to test business logic in isolation

#### Use Case Patterns

**REQUIRED**: Create specific use cases for each business operation.

**Use Case Template:**
```go
type CreateTransactionUseCase struct {
    transactionRepo TransactionRepository
    accountRepo     AccountRepository
    eventPublisher  EventPublisher
    logger          Logger
}

func (uc *CreateTransactionUseCase) Execute(ctx context.Context, req CreateTransactionRequest) (*Transaction, error) {
    // 1. Validate input
    if err := req.Validate(); err != nil {
        return nil, NewValidationError(err)
    }
    
    // 2. Business logic
    transaction, err := uc.createTransaction(ctx, req)
    if err != nil {
        return nil, err
    }
    
    // 3. Persistence
    if err := uc.transactionRepo.Save(ctx, transaction); err != nil {
        return nil, NewPersistenceError(err)
    }
    
    // 4. Side effects
    uc.eventPublisher.Publish(ctx, NewTransactionCreatedEvent(transaction))
    
    return transaction, nil
}
```

**Use Case Standards:**
- [ ] **Single Purpose**: Each use case handles one business operation
- [ ] **Validation**: Input validation at use case boundary
- [ ] **Error Handling**: Consistent error types and handling
- [ ] **Side Effects**: Clear separation of primary and side effects
- [ ] **Testing**: Comprehensive unit tests for each use case

#### Data Transfer Objects (DTOs)

**REQUIRED**: Clear DTOs for input and output data.

**DTO Patterns:**
```go
// Input DTO
type CreateTransactionRequest struct {
    FromAccountID string    `json:"from_account_id" validate:"required,uuid"`
    ToAccountID   string    `json:"to_account_id" validate:"required,uuid"`
    Amount        int64     `json:"amount" validate:"required,min=1"`
    Currency      string    `json:"currency" validate:"required,len=3"`
    Description   string    `json:"description" validate:"required,max=255"`
    Metadata      MetadataDTO `json:"metadata,omitempty"`
}

// Output DTO
type TransactionResponse struct {
    ID          string      `json:"id"`
    Status      string      `json:"status"`
    Amount      int64       `json:"amount"`
    Currency    string      `json:"currency"`
    CreatedAt   time.Time   `json:"created_at"`
    UpdatedAt   time.Time   `json:"updated_at"`
}
```

**DTO Standards:**
- [ ] **Input Validation**: Struct tags for validation rules
- [ ] **JSON Tags**: Consistent JSON field naming (snake_case)
- [ ] **Output Filtering**: Only expose necessary fields in responses
- [ ] **Versioning**: Version DTOs for API evolution
- [ ] **Documentation**: Clear field documentation

#### Dependency Injection

**REQUIRED**: Use dependency injection for service registration.

**DI Container Pattern:**
```go
type Container struct {
    transactionRepo TransactionRepository
    accountRepo     AccountRepository
    createTransactionUC *CreateTransactionUseCase
}

func NewContainer(db *sql.DB, cache Cache) *Container {
    container := &Container{}
    
    // Repositories
    container.transactionRepo = NewTransactionRepository(db)
    container.accountRepo = NewAccountRepository(db)
    
    // Use Cases
    container.createTransactionUC = NewCreateTransactionUseCase(
        container.transactionRepo,
        container.accountRepo,
    )
    
    return container
}
```

**DI Standards:**
- [ ] **Interface-Based**: Depend on interfaces, not implementations
- [ ] **Lifecycle Management**: Proper singleton/transient lifecycle
- [ ] **Configuration**: Externalized configuration injection
- [ ] **Testing**: Easy mock injection for testing
- [ ] **Circular Dependencies**: Avoid circular dependency patterns

#### Error Handling

**REQUIRED**: Consistent, centralized error handling.

**Error Types:**
```go
type ErrorType string

const (
    ValidationErrorType   ErrorType = "VALIDATION_ERROR"
    NotFoundErrorType     ErrorType = "NOT_FOUND_ERROR"
    ConflictErrorType     ErrorType = "CONFLICT_ERROR"
    InternalErrorType     ErrorType = "INTERNAL_ERROR"
    UnauthorizedErrorType ErrorType = "UNAUTHORIZED_ERROR"
)

type AppError struct {
    Type    ErrorType `json:"type"`
    Message string    `json:"message"`
    Code    string    `json:"code"`
    Details any       `json:"details,omitempty"`
}
```

**Error Handling Standards:**
- [ ] **Typed Errors**: Use structured error types
- [ ] **Error Codes**: Consistent error codes for client handling
- [ ] **Context Preservation**: Maintain error context through layers
- [ ] **Logging**: Structured error logging with correlation IDs
- [ ] **User Messages**: User-friendly error messages

#### API Documentation

**REQUIRED**: Document all endpoints following established patterns.

**Documentation Standards:**
- [ ] **OpenAPI Specs**: Complete OpenAPI 3.0 specifications
- [ ] **Code Examples**: Practical curl and SDK examples
- [ ] **Error Responses**: Document all possible error responses
- [ ] **Authentication**: Clear authentication requirements
- [ ] **Rate Limiting**: Document rate limits and quotas

#### New Project Standards

**MANDATORY**: Use plugin-boilerplate for all new projects.

**Boilerplate Integration:**
- [ ] **Repository Template**: Start from plugin-boilerplate repository
- [ ] **Directory Structure**: Follow boilerplate directory organization
- [ ] **Configuration**: Use boilerplate configuration patterns
- [ ] **Testing Setup**: Leverage boilerplate testing framework
- [ ] **CI/CD Pipeline**: Use boilerplate deployment pipeline

## 🔄 Process & Governance Standards

### Architectural Decision Making

**CRITICAL**: New architectural patterns require team consensus.

**Decision Process:**
1. **RFC Creation**: Create Request for Comments document
2. **Team Review**: Engineering team review and discussion
3. **Impact Assessment**: Evaluate impact on existing systems
4. **Consensus Building**: Achieve team consensus before implementation
5. **Documentation**: Document decision rationale and patterns

**Consensus Requirements:**
- [ ] **Architecture Changes**: All major architectural decisions
- [ ] **Technology Choices**: New frameworks, libraries, or tools
- [ ] **Patterns**: New coding patterns or standards
- [ ] **Infrastructure**: Changes to deployment or infrastructure patterns

### DevOps & Infrastructure Changes

**REQUIRED**: DevOps team approval for infrastructure changes.

**DevOps Review Required:**
- [ ] **Pipeline Changes**: Modifications to CI/CD pipelines
- [ ] **Makefile Updates**: Changes to build and deployment scripts
- [ ] **Release Configuration**: Changes to `.releaserc` or release process
- [ ] **Docker Configuration**: Dockerfile or docker-compose changes
- [ ] **Infrastructure**: Kubernetes, Terraform, or cloud configuration

**Review Process:**
1. **Early Consultation**: Discuss changes with DevOps team early
2. **Impact Analysis**: Assess impact on existing deployments
3. **Testing Strategy**: Plan for testing infrastructure changes
4. **Rollback Plan**: Define rollback procedures
5. **Documentation**: Update operational documentation

### Code Review & Approval Standards

#### lib-commons Development

**CRITICAL**: Test merges to develop branch before production use.

**lib-commons Process:**
1. **Feature Development**: Develop in feature branch
2. **Testing Integration**: Test integration in consuming projects
3. **Develop Merge**: Merge to develop after successful testing
4. **Production Validation**: Validate in production-like environment
5. **Main Branch**: Merge to main only after production validation

**Validation Requirements:**
- [ ] **Breaking Changes**: Document and communicate breaking changes
- [ ] **Backward Compatibility**: Maintain backward compatibility when possible
- [ ] **Integration Testing**: Test with all consuming projects
- [ ] **Performance Impact**: Validate performance impact

#### Pull Request Standards

**REQUIRED**: All repositories require minimum 1 approval for develop branch.

**PR Requirements:**
- [ ] **Code Review**: At least one engineering team member approval
- [ ] **Automated Checks**: All CI/CD checks must pass
- [ ] **Description**: Clear description of changes and rationale
- [ ] **Testing**: Evidence of testing (unit, integration, manual)
- [ ] **Documentation**: Updated documentation for user-facing changes

#### Task Coordination

**REQUIRED**: Verify task ownership before starting work.

**Coordination Process:**
1. **Task Assignment**: Check if anyone is working on the task
2. **Communication**: Announce intention to work on task
3. **Progress Updates**: Regular progress updates for long-running tasks
4. **Handoff**: Clear handoff process if switching ownership

### Release Management

#### Continuous Deployment

**PRINCIPLE**: Small, frequent releases over large batch releases.

**Release Standards:**
- [ ] **Small Batches**: Limit changes per release
- [ ] **Feature Flags**: Use feature flags for gradual rollouts
- [ ] **Automated Testing**: Comprehensive automated test coverage
- [ ] **Rollback Ready**: Quick rollback capability for all releases
- [ ] **Monitoring**: Enhanced monitoring during releases

#### Quality Gates

**REQUIRED**: Quality validation before production deployment.

**Pre-Production Checklist:**
- [ ] **Code Quality**: Linting, formatting, complexity checks pass
- [ ] **Security Scan**: Vulnerability scanning passes
- [ ] **Performance**: Performance benchmarks meet requirements
- [ ] **Integration**: All integration tests pass
- [ ] **Documentation**: User-facing documentation updated

### Framework & Dependency Management

#### Technology Validation

**REQUIRED**: Validate frameworks before adding new dependencies.

**Evaluation Criteria:**
- [ ] **Business Need**: Clear business justification for new dependency
- [ ] **Existing Solutions**: Evaluation of existing alternatives
- [ ] **Maintenance**: Long-term maintenance and support considerations
- [ ] **Security**: Security track record and vulnerability management
- [ ] **Performance**: Performance impact assessment
- [ ] **Team Expertise**: Team familiarity and learning curve

**Approval Process:**
1. **Justification Document**: Create document outlining need and evaluation
2. **Team Review**: Engineering team review and discussion
3. **Trial Period**: Limited trial in non-critical system
4. **Full Adoption**: Team approval for full ecosystem adoption

## 🚨 Quality Enforcement

### Commit Standards

**REQUIRED**: Lean, specific commits avoiding large volumes.

**Commit Guidelines:**
- [ ] **Single Purpose**: Each commit addresses one specific change
- [ ] **Clear Message**: Descriptive commit messages following conventional commits
- [ ] **Size Limits**: Avoid commits with excessive files or lines changed
- [ ] **Atomic Changes**: Commits should be complete, working changes
- [ ] **No Secrets**: Never commit secrets, keys, or sensitive data

**Commit Message Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Repository Scope

**CRITICAL**: Midaz repository only contains ledger-related code.

**Scope Guidelines:**
- [ ] **Core Focus**: Only ledger, console, and mdz-related code
- [ ] **No Unrelated Code**: Remove code not directly related to core functionality
- [ ] **Plugin Separation**: Plugins in separate repositories
- [ ] **Clear Boundaries**: Clear boundaries between core and extensions

### Code Quality Automation

**REQUIRED**: Automated quality checks in CI/CD pipeline.

**Quality Checks:**
- [ ] **Linting**: Code style and quality linting
- [ ] **Formatting**: Automated code formatting verification
- [ ] **Type Checking**: TypeScript/Go type checking
- [ ] **Security Scanning**: Vulnerability and security scanning
- [ ] **Performance Testing**: Performance regression testing
- [ ] **Test Coverage**: Minimum test coverage thresholds

## 📊 Monitoring & Compliance

### Standards Compliance Tracking

**IMPLEMENTATION**: Track compliance with these standards across all projects.

**Compliance Metrics:**
- [ ] **Architecture Compliance**: Hexagonal architecture pattern adherence
- [ ] **Code Quality**: Quality metrics and standards compliance
- [ ] **Security Compliance**: Security standards and vulnerability management
- [ ] **Process Compliance**: Review and approval process adherence
- [ ] **Documentation Coverage**: Documentation completeness and quality

### Continuous Improvement

**PROCESS**: Regular review and improvement of standards.

**Review Schedule:**
- [ ] **Monthly**: Review compliance metrics and identify issues
- [ ] **Quarterly**: Assess standards effectiveness and update as needed
- [ ] **Annual**: Comprehensive standards review and major updates
- [ ] **Ad-hoc**: Emergency updates for critical issues or new requirements

## 🔗 Integration with Analysis Chain

These standards integrate with the existing 18-prompt analysis chain:

**Pre-Development Integration (01-03):**
- PRD generation validates business requirements against standards
- TRD generation enforces architectural patterns and technical standards
- Implementation planning incorporates governance and process requirements

**Code Review Integration (00-17):**
- Codebase overview validates repository scope and organization
- Architecture analysis checks Hexagonal pattern compliance
- Security analysis validates security standards implementation
- Quality checks enforce coding standards and best practices
- Documentation generation includes standards compliance documentation

## Memory Integration

Store all standards validation and compliance findings:

```bash
memory_tasks session_create session_id="standards-$(date +%s)" repository="github.com/org/repo"

memory_store_chunk 
  content="Standards compliance analysis: [detailed findings]"
  session_id="standards-$(date +%s)"
  repository="github.com/org/repo"
  tags=["standards", "compliance", "architecture", "quality"]

memory_store_decision
  decision="Standards violation found: [specific violation]"
  rationale="[impact and remediation plan]"
  context="[analysis context and recommendations]"
  session_id="standards-$(date +%s)"
  repository="github.com/org/repo"
```

---

*These standards ensure consistent, high-quality development across the LerianStudio ecosystem while maintaining architectural integrity and operational excellence.*