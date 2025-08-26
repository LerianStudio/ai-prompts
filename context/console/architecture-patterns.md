# Midaz Console Architecture Patterns

## Overview
Midaz Console implements a Clean Architecture pattern with clear separation of concerns across three distinct layers. This document outlines the core architectural patterns and principles used throughout the codebase.

## Clean Architecture Layers

### 1. Domain Layer (`src/core/domain/`)
The innermost layer containing business logic and entities.

**Key Components:**
- **Entities** (`entities/`): Core business objects representing domain concepts
  - `account-entity.ts`, `ledger-entity.ts`, `transaction-entity.ts`
  - Pure TypeScript classes with business rules
  - No framework dependencies

- **Repository Interfaces** (`repositories/`): Contracts for data access
  - Abstract interfaces defining data operations
  - Enables dependency inversion principle
  - Examples: `account-repository.ts`, `organization-repository.ts`

**Patterns:**
```typescript
// Entity Pattern
export class AccountEntity {
  id: string
  name: string
  balance: BalanceEntity
  metadata: MetadataEntity
  // Business logic methods
}

// Repository Interface Pattern
export interface AccountRepository {
  create(account: AccountEntity): Promise<AccountEntity>
  findById(id: string): Promise<AccountEntity>
  update(id: string, account: AccountEntity): Promise<AccountEntity>
  delete(id: string): Promise<void>
}
```

### 2. Application Layer (`src/core/application/`)
Contains application-specific business rules and orchestrates data flow.

**Key Components:**
- **Use Cases** (`use-cases/`): Single-responsibility business operations
  - One use case per business action
  - Naming convention: `{action}-{entity}-use-case.ts`
  - Examples: `create-account-use-case.ts`, `fetch-all-ledgers-use-case.ts`

- **Controllers** (`controllers/`): HTTP request handlers
  - Bridge between infrastructure and application layers
  - Handle request/response transformation
  - Examples: `account-controller.ts`, `ledger-controller.ts`

- **DTOs** (`dto/`): Data Transfer Objects
  - Shape data for external communication
  - Validation and serialization
  - Examples: `account-dto.ts`, `transaction-dto.ts`

- **Mappers** (`mappers/`): Transform between layers
  - Convert DTOs ↔ Entities
  - Maintain layer independence
  - Examples: `account-mapper.ts`, `transaction-mapper.ts`

**Patterns:**
```typescript
// Use Case Pattern
export class CreateAccountUseCase {
  constructor(
    private accountRepository: AccountRepository,
    private ledgerRepository: LedgerRepository
  ) {}

  async execute(dto: CreateAccountDTO): Promise<AccountEntity> {
    const entity = AccountMapper.fromDTO(dto)
    const created = await this.accountRepository.create(entity)
    return created
  }
}

// Controller Pattern with Decorators
@Controller('/accounts')
export class AccountController {
  constructor(private createAccountUseCase: CreateAccountUseCase) {}

  @Post('/')
  async create(@Body() dto: CreateAccountDTO) {
    const account = await this.createAccountUseCase.execute(dto)
    return AccountMapper.toDTO(account)
  }
}
```

### 3. Infrastructure Layer (`src/core/infrastructure/`)
Contains all external concerns and framework-specific implementations.

**Key Components:**
- **Repository Implementations** (`midaz/repositories/`, `mongo/repositories/`)
  - Concrete implementations of domain repository interfaces
  - HTTP clients, database adapters
  - Examples: `midaz-account-repository.ts`, `mongo-organization-avatar-repository.ts`

- **Dependency Injection** (`container-registry/`)
  - InversifyJS container configuration
  - Module-based organization
  - Examples: `account-module.ts`, `ledger-module.ts`

- **External Services** (`midaz-plugins/`, `fee/`)
  - Third-party integrations
  - Plugin system implementations
  - Fee calculation services

**Patterns:**
```typescript
// Repository Implementation
export class MidazAccountRepository implements AccountRepository {
  constructor(private httpService: MidazHttpService) {}

  async create(account: AccountEntity): Promise<AccountEntity> {
    const dto = MidazAccountMapper.toDTO(account)
    const response = await this.httpService.post('/accounts', dto)
    return MidazAccountMapper.fromDTO(response)
  }
}

// Dependency Injection Module
export const AccountModule = new ContainerModule((bind) => {
  bind<AccountRepository>(TYPES.AccountRepository)
    .to(MidazAccountRepository)
    .inSingletonScope()
  
  bind<CreateAccountUseCase>(TYPES.CreateAccountUseCase)
    .to(CreateAccountUseCase)
    .inSingletonScope()
})
```

## Dependency Injection Pattern

The application uses InversifyJS for IoC (Inversion of Control) container management:

```typescript
// Type definitions (src/core/infrastructure/container-registry/types.ts)
const TYPES = {
  AccountRepository: Symbol.for('AccountRepository'),
  CreateAccountUseCase: Symbol.for('CreateAccountUseCase'),
  AccountController: Symbol.for('AccountController')
}

// Container configuration
const container = new Container()
container.load(AccountModule)
container.load(LedgerModule)
container.load(TransactionModule)
```

## API Integration Pattern

The codebase uses a structured approach for API integration:

1. **HTTP Service Layer**: Centralized HTTP client with interceptors
2. **Repository Pattern**: Abstract data access behind interfaces
3. **DTO/Mapper Pattern**: Transform data between external and internal representations
4. **Error Handling**: Consistent exception handling across layers

```typescript
// HTTP Service with interceptors
export class MidazHttpService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.MIDAZ_API_URL,
      timeout: 30000
    })
    
    this.client.interceptors.request.use(this.requestInterceptor)
    this.client.interceptors.response.use(
      this.responseInterceptor,
      this.errorInterceptor
    )
  }
}
```

## Error Handling Pattern

Structured exception handling with custom exception classes:

```typescript
// Custom exceptions
export class MidazException extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message)
  }
}

// Exception handling in use cases
try {
  const result = await this.repository.create(entity)
  return result
} catch (error) {
  if (error instanceof MidazException) {
    throw new ApplicationException(error.message, error.statusCode)
  }
  throw new InternalServerException('Unexpected error occurred')
}
```

## Observability Pattern

OpenTelemetry integration for distributed tracing:

```typescript
// Tracer configuration
export class OtelTracerProvider {
  private tracer: Tracer

  constructor() {
    const provider = new NodeTracerProvider({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'midaz-console'
      })
    })
    
    provider.addSpanProcessor(
      new BatchSpanProcessor(new OTLPTraceExporter())
    )
    
    provider.register()
    this.tracer = provider.getTracer('midaz-console')
  }
}

// Usage in use cases
@LogOperation('CreateAccount')
async execute(dto: CreateAccountDTO): Promise<AccountEntity> {
  const span = this.tracer.startSpan('create-account')
  try {
    // Business logic
    span.setStatus({ code: SpanStatusCode.OK })
  } catch (error) {
    span.recordException(error)
    span.setStatus({ code: SpanStatusCode.ERROR })
    throw error
  } finally {
    span.end()
  }
}
```

## Best Practices

1. **Single Responsibility**: Each class/module has one reason to change
2. **Dependency Inversion**: Depend on abstractions, not concretions
3. **Interface Segregation**: Small, focused interfaces
4. **Open/Closed Principle**: Open for extension, closed for modification
5. **Don't Repeat Yourself (DRY)**: Reusable utilities and shared components
6. **Composition over Inheritance**: Favor composition patterns
7. **Fail Fast**: Early validation and error detection
8. **Immutability**: Prefer immutable data structures
9. **Type Safety**: Leverage TypeScript's type system fully
10. **Testing**: Unit tests for use cases, integration tests for repositories