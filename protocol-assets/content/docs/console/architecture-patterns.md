# Architecture Patterns

This document outlines the architectural patterns implemented in the Lerian Console application, based on the actual codebase structure and implementation.

## Console Implementation Architecture

The Lerian Console follows a **Clean Architecture pattern with Dependency Injection**, providing a robust and scalable structure:

### 1. Complete Clean Architecture Implementation

The application implements full Clean Architecture with proper layer separation and dependency injection:

```
src/
├── app/                     # Next.js App Router
│   ├── (auth-routes)/      # Authentication routes
│   │   ├── signin/         # Sign in page
│   │   └── signout/        # Sign out page
│   ├── (routes)/           # Main application routes
│   │   ├── accounts/       # Account management
│   │   ├── assets/         # Asset management
│   │   ├── ledgers/        # Ledger management
│   │   ├── portfolios/     # Portfolio management
│   │   ├── segments/       # Segment management
│   │   ├── settings/       # Settings pages
│   │   ├── transactions/   # Transaction management
│   │   └── onboarding/     # Organization onboarding
│   └── api/                # Next.js API routes
├── components/             # Reusable UI components
│   ├── ui/                # Primitive components (shadcn/ui)
│   ├── entity-data-table/ # Compound table component
│   ├── entity-box/        # Entity display component
│   ├── form/              # Form field components
│   ├── table/             # Table utilities
│   └── pagination/        # Pagination component
├── client/                # API client layer (React Query hooks)
│   ├── accounts.ts
│   ├── assets.ts
│   ├── ledgers.ts
│   ├── portfolios.ts
│   ├── segments.ts
│   ├── transactions.ts
│   └── users.ts
├── core/                  # Clean Architecture layers
│   ├── application/       # Application layer
│   │   ├── controllers/   # Application controllers
│   │   ├── dto/          # Data transfer objects
│   │   ├── mappers/      # Domain-DTO mapping
│   │   └── use-cases/    # Business use cases
│   ├── domain/           # Domain layer
│   │   ├── entities/     # Domain entities
│   │   └── repositories/ # Repository interfaces
│   └── infrastructure/   # Infrastructure layer
│       ├── container-registry/ # DI container
│       ├── logger/           # Logging infrastructure
│       ├── observability/    # OpenTelemetry integration
│       ├── midaz/           # Midaz service integration
│       ├── midaz-plugins/   # Plugin service integration
│       └── mongo/           # MongoDB infrastructure
├── schema/               # Zod validation schemas
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   └── fetcher/         # API fetcher utilities
├── providers/           # React providers
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### 2. API Client Layer (`src/client/`)

Provides React Query hooks for API integration:

```typescript
// client/accounts.ts - Console API client with React Query integration
export const useListAccounts = ({
  organizationId,
  ledgerId,
  query,
  enabled = true,
  ...options
}: UseListAccountsProps = {}) => {
  return useQuery<PaginationDto<AccountDto>>({
    queryKey: ['accounts', { organizationId, ledgerId, query }],
    queryFn: getPaginatedFetcher(
      `/api/organizations/${organizationId}/ledgers/${ledgerId}/accounts`,
      query
    ),
    enabled: enabled && !!organizationId && !!ledgerId,
    ...options
  })
}

export const useCreateAccount = ({
  organizationId,
  ledgerId,
  onSuccess,
  ...options
}: UseCreateAccountProps) => {
  const queryClient = useQueryClient()

  return useMutation<AccountDto, Error, CreateAccountDto>({
    mutationKey: ['accounts'],
    mutationFn: postFetcher(`/api/organizations/${organizationId}/ledgers/${ledgerId}/accounts`),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] })
      onSuccess?.(...args)
    },
    ...options
  })
}
```

### 3. Data Transfer Objects (`src/core/application/dto/`)

Defines the shape of data flowing through the application:

```typescript
// core/application/dto/account-dto.ts
export interface AccountDto {
  id: string
  name: string
  alias?: string
  assetCode: string
  organizationId: string
  ledgerId: string
  portfolioId?: string
  status: StatusDto
  allowSending: boolean
  allowReceiving: boolean
  balance?: BalanceDto
  type: string
  createdAt: string
  updatedAt: string
  deletedAt?: string
  metadata?: MetadataDto
}

export interface CreateAccountDto {
  name: string
  alias?: string
  assetCode: string
  portfolioId?: string
  entityId?: string
  type: string
  metadata?: Record<string, unknown>
}

// core/application/dto/pagination-dto.ts
export interface PaginationDto<T> {
  items: T[]
  limit: number
  page: number
  totalItems?: number
  totalPages?: number
}
```

## Service Integration Architecture

### 1. Direct Environment Configuration

The console uses direct environment variable access for service integration:

```typescript
// Console service configuration pattern
const midazBaseUrl = process.env.MIDAZ_BASE_PATH
const identityBaseUrl = process.env.PLUGIN_IDENTITY_BASE_PATH
const feesServiceUrl = process.env.PLUGIN_FEES_PATH

// Feature flags
const authEnabled = process.env.NEXT_PUBLIC_MIDAZ_AUTH_ENABLED === 'true'
const feesEnabled = process.env.NEXT_PUBLIC_PLUGIN_FEES_ENABLED === 'true'

// Usage in service repositories
const endpoint = `/api/organizations/${organizationId}/ledgers/${ledgerId}/accounts`
```

### 2. Organization Context Integration

The console manages organization context through custom hooks:

```typescript
// Console organization context pattern
import { useOrganization } from '@lerianstudio/console-layout'

export function AccountsDataTable() {
  const { currentOrganization, currentLedger } = useOrganization()
  
  // Use organization and ledger context in API calls
  const { data: accounts } = useListAccounts({
    organizationId: currentOrganization?.id!,
    ledgerId: currentLedger?.id!,
    enabled: !!currentOrganization && !!currentLedger
  })
}
```

### 2. Dependency Injection Container System

The application uses a sophisticated dependency injection system with module registration:

```typescript
// core/infrastructure/container-registry/controllers/controllers-module.ts - Console implementation
export class ControllersModule implements ContainerModule {
  register(container: ContainerRegistry): void {
    // Register all application controllers
    container.register('AccountController', AccountController)
    container.register('AccountTypesController', AccountTypesController)
    container.register('LedgerController', LedgerController)
    container.register('OrganizationController', OrganizationController)
    container.register('TransactionController', TransactionController)
    container.register('PortfolioController', PortfolioController)
    container.register('SegmentController', SegmentController)
  }
}

// core/infrastructure/container-registry/use-cases/use-cases-module.ts
export class UseCasesModule implements ContainerModule {
  register(container: ContainerRegistry): void {
    // Account use cases
    container.register('CreateAccountUseCase', CreateAccountUseCase)
    container.register('FetchAllAccountsUseCase', FetchAllAccountsUseCase)
    container.register('UpdateAccountUseCase', UpdateAccountUseCase)
    container.register('DeleteAccountUseCase', DeleteAccountUseCase)
    
    // Organization use cases
    container.register('CreateOrganizationUseCase', CreateOrganizationUseCase)
    container.register('FetchAllOrganizationsUseCase', FetchAllOrganizationsUseCase)
    container.register('UpdateOrganizationUseCase', UpdateOrganizationUseCase)
    
    // Transaction use cases
    container.register('CreateTransactionUseCase', CreateTransactionUseCase)
    container.register('FetchAllTransactionsUseCase', FetchAllTransactionsUseCase)
    container.register('UpdateTransactionUseCase', UpdateTransactionUseCase)
  }
}

// core/infrastructure/container-registry/midaz/midaz-module.ts
export class MidazModule implements ContainerModule {
  register(container: ContainerRegistry): void {
    // Register Midaz services and repositories
    container.register('MidazHttpService', MidazHttpService)
    container.register('MidazAccountRepository', MidazAccountRepository)
    container.register('MidazLedgerRepository', MidazLedgerRepository)
    container.register('MidazOrganizationRepository', MidazOrganizationRepository)
    container.register('MidazTransactionRepository', MidazTransactionRepository)
  }
}
```

## Data Mapping Patterns

### 1. Midaz Service Integration - External API Mapping

The console uses mappers for transforming data between the external Midaz API and internal DTOs:

```typescript
// core/infrastructure/midaz/mappers/midaz-account-mapper.ts
export class MidazAccountMapper {
  public static toCreateDto(account: AccountEntity): MidazCreateAccountDto {
    return {
      name: account.name,
      alias: account.alias,
      type: account.type,
      assetCode: account.assetCode,
      portfolioId: account.portfolioId,
      entityId: account.entityId,
      metadata: account.metadata
    }
  }

  public static toDomain(midazAccount: MidazAccountDto): AccountEntity {
    return {
      id: midazAccount.id,
      name: midazAccount.name,
      alias: midazAccount.alias,
      type: midazAccount.type,
      assetCode: midazAccount.assetCode,
      organizationId: midazAccount.organizationId,
      ledgerId: midazAccount.ledgerId,
      portfolioId: midazAccount.portfolioId,
      status: midazAccount.status,
      allowSending: midazAccount.allowSending,
      allowReceiving: midazAccount.allowReceiving,
      createdAt: midazAccount.createdAt,
      updatedAt: midazAccount.updatedAt,
      deletedAt: midazAccount.deletedAt,
      metadata: midazAccount.metadata
    }
  }
}

// core/infrastructure/midaz/mappers/midaz-organization-mapper.ts
export class MidazOrganizationMapper {
  public static toCreateDto(organization: OrganizationEntity): MidazCreateOrganizationDto {
    return {
      legalName: organization.legalName,
      doingBusinessAs: organization.doingBusinessAs,
      legalDocument: organization.legalDocument,
      address: organization.address,
      metadata: organization.metadata,
      status: organization.status
    }
  }

  public static toDomain(midazOrg: MidazOrganizationDto): OrganizationEntity {
    return {
      id: midazOrg.id,
      legalName: midazOrg.legalName,
      doingBusinessAs: midazOrg.doingBusinessAs,
      legalDocument: midazOrg.legalDocument,
      address: midazOrg.address,
      parentOrganizationId: midazOrg.parentOrganizationId,
      status: midazOrg.status,
      createdAt: midazOrg.createdAt,
      updatedAt: midazOrg.updatedAt,
      deletedAt: midazOrg.deletedAt,
      metadata: midazOrg.metadata
    }
  }
}
```

### 2. Application Layer Mappers

Standard mappers between domain entities and application DTOs:

```typescript
// core/application/mappers/account-mapper.ts
export class AccountMapper {
  public static toDto(account: AccountEntity & Partial<BalanceEntity>): AccountDto {
    return {
      id: account.id,
      name: account.name,
      alias: account.alias,
      assetCode: account.assetCode,
      organizationId: account.organizationId,
      ledgerId: account.ledgerId,
      portfolioId: account.portfolioId,
      status: account.status,
      allowSending: account.allowSending,
      allowReceiving: account.allowReceiving,
      balance: account.available ? {
        current: account.current,
        available: account.available,
        onHold: account.onHold,
        scale: account.scale
      } : undefined,
      type: account.type,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
      deletedAt: account.deletedAt,
      metadata: account.metadata
    }
  }

  public static toDomain(dto: CreateAccountDto): AccountEntity {
    return {
      name: dto.name,
      alias: dto.alias,
      assetCode: dto.assetCode,
      portfolioId: dto.portfolioId,
      entityId: dto.entityId,
      type: dto.type,
      metadata: dto.metadata
    }
  }
}

// core/application/mappers/organization-mapper.ts
export class OrganizationMapper {
  public static toDomain(dto: CreateOrganizationDto): OrganizationEntity {
    return {
      legalName: dto.legalName,
      doingBusinessAs: dto.doingBusinessAs,
      legalDocument: dto.legalDocument,
      address: dto.address,
      parentOrganizationId: dto.parentOrganizationId,
      metadata: dto.metadata,
      status: dto.status || {
        code: 'ACTIVE',
        description: 'Active organization'
      }
    }
  }

  public static toDto(entity: OrganizationEntity): OrganizationDto {
    return {
      id: entity.id,
      legalName: entity.legalName,
      doingBusinessAs: entity.doingBusinessAs,
      legalDocument: entity.legalDocument,
      address: entity.address,
      parentOrganizationId: entity.parentOrganizationId,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      deletedAt: entity.deletedAt,
      metadata: entity.metadata
    }
  }
}
```

## Controller Pattern

### 1. Base Controller Implementation

The console uses a consistent controller pattern with dependency injection:

```typescript
// core/application/controllers/account-controller.ts - Console implementation
export class AccountController extends BaseController {
  constructor(
    @inject(FetchAllAccountsUseCase)
    private readonly fetchAllAccountsUseCase: FetchAllAccountsUseCase,
    @inject(CreateAccountUseCase) 
    private readonly createAccountUseCase: CreateAccountUseCase,
    @inject(UpdateAccountUseCase)
    private readonly updateAccountUseCase: UpdateAccountUseCase,
    @inject(DeleteAccountUseCase)
    private readonly deleteAccountUseCase: DeleteAccountUseCase,
    @inject(FetchAccountByIdUseCase)
    private readonly fetchAccountByIdUseCase: FetchAccountByIdUseCase
  ) {
    super()
  }

  async fetchAll(request: NextRequest): Promise<Response> {
    const { organizationId, ledgerId } = await this.getPathParams(request)
    const query = await this.getQueryParams<AccountSearchParamDto>(request)
    
    const result = await this.fetchAllAccountsUseCase.execute({
      organizationId,
      ledgerId,
      query
    })
    
    return Response.json(result)
  }

  async create(request: NextRequest): Promise<Response> {
    const { organizationId, ledgerId } = await this.getPathParams(request)
    const body = await this.getBody<CreateAccountDto>(request)
    
    const result = await this.createAccountUseCase.execute({
      ...body,
      organizationId,
      ledgerId
    })
    
    return Response.json(result, { status: 201 })
  }

  async update(request: NextRequest): Promise<Response> {
    const { organizationId, ledgerId, accountId } = await this.getPathParams(request)
    const body = await this.getBody<UpdateAccountDto>(request)
    
    const result = await this.updateAccountUseCase.execute({
      ...body,
      id: accountId,
      organizationId,
      ledgerId
    })
    
    return Response.json(result)
  }

  async delete(request: NextRequest): Promise<Response> {
    const { organizationId, ledgerId, accountId } = await this.getPathParams(request)
    
    await this.deleteAccountUseCase.execute({
      id: accountId,
      organizationId,
      ledgerId
    })
    
    return new Response(null, { status: 204 })
  }
}
```

### 2. Organization Controller Example

Complex controller with nested resources:

```typescript
// core/application/controllers/organization-controller.ts
export class OrganizationController extends BaseController {
  constructor(
    @inject(FetchAllOrganizationsUseCase)
    private readonly fetchAllOrganizationsUseCase: FetchAllOrganizationsUseCase,
    @inject(CreateOrganizationUseCase)
    private readonly createOrganizationUseCase: CreateOrganizationUseCase,
    @inject(UpdateOrganizationUseCase) 
    private readonly updateOrganizationUseCase: UpdateOrganizationUseCase,
    @inject(DeleteOrganizationUseCase)
    private readonly deleteOrganizationUseCase: DeleteOrganizationUseCase,
    @inject(FetchParentOrganizationsUseCase)
    private readonly fetchParentOrganizationsUseCase: FetchParentOrganizationsUseCase
  ) {
    super()
  }

  async fetchAll(request: NextRequest): Promise<Response> {
    const query = await this.getQueryParams<OrganizationSearchParamDto>(request)
    
    const result = await this.fetchAllOrganizationsUseCase.execute(query)
    return Response.json(result)
  }

  async fetchParentOrganizations(request: NextRequest): Promise<Response> {
    const result = await this.fetchParentOrganizationsUseCase.execute()
    return Response.json(result)
  }
}
```

## HTTP Service Pattern

### 1. Midaz HTTP Service with Advanced Features

The console implementation uses sophisticated HTTP services with logging, authentication, and observability:

```typescript
// core/infrastructure/smart-templates/services/smart-templates-http-service.ts
import { Injectable, Inject } from '@lerianstudio/sindarian-server'
import { HttpService } from '@lerianstudio/sindarian-server'
import { LoggerAggregator } from '@lerianstudio/lib-logs'
import { getServerSession } from 'next-auth'

@Injectable()
export class SmartTemplatesHttpService extends HttpService {
  constructor(
    @Inject(LoggerAggregator)
    private readonly logger: LoggerAggregator,
    @Inject(OtelTracerProvider)
    private readonly otelTracerProvider: OtelTracerProvider
  ) {
    super()
  }

  protected async createDefaults() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-Id': this.requestIdRepository.get()!
    }

    // Add authentication if enabled
    if (process.env.PLUGIN_AUTH_ENABLED === 'true') {
      const session = await getServerSession(nextAuthOptions)
      if (session?.user?.access_token) {
        headers.Authorization = `Bearer ${session.user.access_token}`
      }
    }

    return {
      headers,
      baseUrl: process.env.PLUGIN_SMART_TEMPLATES_BASE_PATH
    }
  }

  protected onBeforeFetch(request: Request): void {
    this.logger.info('[INFO] - SmartTemplatesHttpService', {
      url: request.url,
      method: request.method,
      headers: {
        'X-Request-Id': request.headers.get('X-Request-Id'),
        'X-Organization-Id': request.headers.get('X-Organization-Id'),
        'Content-Type': request.headers.get('Content-Type')
      }
    })

    this.otelTracerProvider.startCustomSpan('smart-templates-api-request')
  }

  protected onAfterFetch(request: Request, response: Response): void {
    this.logger.info('[INFO] - SmartTemplatesHttpService - Response', {
      url: request.url,
      method: request.method,
      status: response.status,
      statusText: response.statusText
    })

    this.otelTracerProvider.endCustomSpan({
      attributes: {
        'http.url': request.url,
        'http.method': request.method,
        'http.status_code': response.status,
        'smart-templates.service': 'smart-templates',
        'organization.id': request.headers.get('X-Organization-Id') || 'unknown'
      },
      status: {
        code: response.ok ? SpanStatusCode.OK : SpanStatusCode.ERROR
      }
    })
  }

  protected async catch(request: Request, response: Response, error: any) {
    this.logger.error('[ERROR] - SmartTemplatesHttpService', {
      url: request.url,
      method: request.method,
      status: response.status,
      response: error,
      headers: {
        'X-Request-Id': request.headers.get('X-Request-Id'),
        'X-Organization-Id': request.headers.get('X-Organization-Id')
      }
    })

    const intl = await getIntl()

    // Handle Smart Templates API specific errors
    if (error?.code) {
      const message = smartTemplatesApiMessages[
        error.code as keyof typeof smartTemplatesApiMessages
      ]

      if (!message) {
        throw new SmartTemplatesApiException(
          intl.formatMessage({
            id: 'error.smartTemplates.unknownError',
            defaultMessage: 'Unknown error occurred in Smart Templates service.'
          }),
          error.code,
          response.status
        )
      }

      throw new SmartTemplatesApiException(
        intl.formatMessage(message),
        error.code,
        response.status
      )
    }

    // Handle generic errors
    throw new SmartTemplatesApiException(
      intl.formatMessage({
        id: 'error.smartTemplates.unknownError',
        defaultMessage: 'Unknown error occurred in Smart Templates service.'
      }),
      'SMART_TEMPLATES_UNKNOWN_ERROR',
      response.status || 500
    )
  }

  // Special methods for file operations
  async getFileStream(url: URL | string, options: RequestInit = {}): Promise<Response> {
    const defaults = await this.createDefaults()
    
    // Remove Content-Type header for binary downloads
    const headers = { ...defaults.headers }
    delete headers['Content-Type']

    const request = new Request(new URL(url, defaults.baseUrl), {
      ...defaults,
      ...options,
      method: 'GET',
      headers: { ...headers, ...options.headers }
    })

    this.onBeforeFetch(request)
    const response = await fetch(request)
    this.onAfterFetch(request, response)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Download failed' }))
      await this.catch(request, response, error)
    }

    return response
  }

  async getText(url: URL | string, options: RequestInit = {}): Promise<string> {
    const defaults = await this.createDefaults()
    const request = new Request(new URL(url, defaults.baseUrl), {
      ...defaults,
      ...options,
      method: 'GET',
      headers: { ...defaults.headers, ...options.headers }
    })

    this.onBeforeFetch(request)
    const response = await fetch(request)
    this.onAfterFetch(request, response)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Download failed' }))
      await this.catch(request, response, error)
    }

    return await response.text()
  }
}
```

## Error Handling Architecture

### 1. Exception Layer

Custom exceptions for different error scenarios:

```typescript
// core/infrastructure/midaz/exceptions/midaz-exceptions.ts
export class MidazException extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public originalError?: Error
  ) {
    super(message)
    this.name = 'MidazException'
  }
}

export class MidazValidationException extends MidazException {
  constructor(
    message: string,
    public validationErrors: Record<string, string[]>
  ) {
    super(400, message)
    this.name = 'MidazValidationException'
  }
}

export class MidazNotFoundException extends MidazException {
  constructor(resource: string, id: string) {
    super(404, `${resource} with id ${id} not found`)
    this.name = 'MidazNotFoundException'
  }
}
```

### 2. Database Exception Handling

Database-specific error handling:

```typescript
// core/infrastructure/mongo/exceptions/database-exception.ts
export class DatabaseException extends Error {
  constructor(
    public operation: string,
    public collection: string,
    public originalError: Error
  ) {
    super(`Database error in ${operation} on ${collection}: ${originalError.message}`)
    this.name = 'DatabaseException'
  }
}

export class DatabaseConnectionException extends DatabaseException {
  constructor(connectionString: string, originalError: Error) {
    super('connection', 'database', originalError)
    this.message = `Failed to connect to database at ${connectionString}`
    this.name = 'DatabaseConnectionException'
  }
}
```

## Observability Patterns

### 1. OpenTelemetry Integration

Basic observability setup:

```typescript
// core/infrastructure/observability/otel-tracer-provider.ts
export class OtelTracerProvider {
  private tracer: Tracer

  constructor() {
    this.tracer = trace.getTracer('midaz-console', '1.0.0')
  }

  startSpan(name: string, attributes?: Record<string, string | number | boolean>): Span {
    return this.tracer.startSpan(name, {
      attributes: {
        'service.name': 'midaz-console',
        'service.version': '1.0.0',
        ...attributes
      }
    })
  }

  async traceAsyncOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    attributes?: Record<string, string | number | boolean>
  ): Promise<T> {
    const span = this.startSpan(operationName, attributes)
    
    try {
      const result = await operation()
      span.setStatus({ code: SpanStatusCode.OK })
      return result
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message })
      throw error
    } finally {
      span.end()
    }
  }
}
```

### 2. Instrumentation Configuration

Instrumentation setup for monitoring:

```typescript
// core/infrastructure/observability/instrumentation-config.ts
export const instrumentationConfig = {
  serviceName: 'midaz-console',
  serviceVersion: '1.0.0',
  environment: process.env.NODE_ENV || 'development',
  
  tracing: {
    enabled: process.env.OTEL_TRACING_ENABLED === 'true',
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    sampleRate: parseFloat(process.env.OTEL_TRACE_SAMPLE_RATE || '1.0')
  },

  metrics: {
    enabled: process.env.OTEL_METRICS_ENABLED === 'true',
    interval: parseInt(process.env.OTEL_METRICS_INTERVAL || '30000')
  }
}

// src/instrumentation.ts
import { instrumentationConfig } from '@/core/infrastructure/observability/instrumentation-config'

export function register() {
  if (instrumentationConfig.tracing.enabled) {
    // Initialize OpenTelemetry instrumentation
  }
}
```

## Configuration Management

### 1. Runtime Configuration

Environment-based configuration handling:

```typescript
// core/infrastructure/midaz/config/config.ts
export interface MidazConfig {
  baseURL: string
  apiKey?: string
  timeout: number
  retryAttempts: number
}

export const getMidazConfig = (): MidazConfig => {
  return {
    baseURL: process.env.MIDAZ_API_URL || 'http://localhost:3000',
    apiKey: process.env.MIDAZ_API_KEY,
    timeout: parseInt(process.env.MIDAZ_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.MIDAZ_RETRY_ATTEMPTS || '3')
  }
}
```

### 2. Service Configuration

Service-specific configuration patterns:

```typescript
// services/configs/application-config.ts
export interface ApplicationConfig {
  api: {
    baseURL: string
    timeout: number
  }
  auth: {
    enabled: boolean
    provider: string
  }
  features: {
    enableTracing: boolean
    enableMetrics: boolean
  }
}

export const getApplicationConfig = (): ApplicationConfig => {
  return {
    api: {
      baseURL: process.env.NEXT_PUBLIC_API_URL || '',
      timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000')
    },
    auth: {
      enabled: process.env.NEXT_PUBLIC_AUTH_ENABLED === 'true',
      provider: process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'nextauth'
    },
    features: {
      enableTracing: process.env.NEXT_PUBLIC_ENABLE_TRACING === 'true',
      enableMetrics: process.env.NEXT_PUBLIC_ENABLE_METRICS === 'true'
    }
  }
}
```

This architecture provides a solid foundation for scalable, maintainable, and testable frontend applications with clear separation of concerns and proper dependency management.
</file>
