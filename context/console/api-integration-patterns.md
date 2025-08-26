# API Integration Patterns

## Overview

The Midaz Console implements a sophisticated multi-layered API integration architecture that handles communication with multiple backend services including the core Midaz API, Identity service, and plugin system.

## API Client Architecture

### 1. Client Layer Structure

```
src/client/                  # Frontend API clients
├── accounts.ts
├── applications.ts
├── assets.ts
├── ledgers.ts
├── organizations.ts
├── transactions.ts
└── users.ts

src/app/api/                # Next.js API routes (BFF pattern)
├── midaz/
├── identity/
├── auth/
└── plugin/
```

### 2. Backend for Frontend (BFF) Pattern

The application uses Next.js API routes as a BFF layer:

```typescript
// API Route (src/app/api/organizations/[id]/ledgers/route.ts)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const controller = container.get<LedgerController>(TYPES.LedgerController)
  return controller.fetchAll(request, params)
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const controller = container.get<LedgerController>(TYPES.LedgerController)
  return controller.create(request, params)
}
```

## HTTP Service Pattern

### 1. Base HTTP Service

```typescript
// Infrastructure HTTP Service (src/core/infrastructure/midaz/services/midaz-http-service.ts)
export class MidazHttpService {
  private client: AxiosInstance
  private organizationId: string | null = null

  constructor() {
    this.client = axios.create({
      baseURL: process.env.MIDAZ_API_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        if (this.organizationId) {
          config.headers['X-Organization-Id'] = this.organizationId
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error) => this.handleError(error)
    )
  }

  private handleError(error: AxiosError): never {
    if (error.response) {
      const { status, data } = error.response
      throw new MidazException(
        data.message || 'API Error',
        status,
        data.details
      )
    }
    throw new NetworkException('Network error occurred')
  }

  async get<T>(path: string, params?: any): Promise<T> {
    return this.client.get(path, { params })
  }

  async post<T>(path: string, data?: any): Promise<T> {
    return this.client.post(path, data)
  }

  async put<T>(path: string, data?: any): Promise<T> {
    return this.client.put(path, data)
  }

  async delete<T>(path: string): Promise<T> {
    return this.client.delete(path)
  }
}
```

### 2. Frontend Fetcher Utilities

```typescript
// Frontend fetcher utilities (src/lib/fetcher/index.ts)
const createFetcher = (method: HttpMethod) => {
  return async <T = any>(
    url: string,
    options?: FetcherOptions
  ): Promise<T> => {
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      params: options?.params,
      data: options?.body
    }

    try {
      const response = await axios(config)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new ApiException(
          error.response?.data?.message || 'Request failed',
          error.response?.status || 500
        )
      }
      throw error
    }
  }
}

export const getFetcher = createFetcher('GET')
export const postFetcher = createFetcher('POST')
export const putFetcher = createFetcher('PUT')
export const deleteFetcher = createFetcher('DELETE')
export const patchFetcher = createFetcher('PATCH')
```

## Repository Pattern Implementation

### 1. Repository Interface

```typescript
// Domain repository interface
export interface AccountRepository {
  create(account: AccountEntity): Promise<AccountEntity>
  findById(id: string): Promise<AccountEntity>
  findAll(pagination?: PaginationEntity): Promise<{
    data: AccountEntity[]
    pagination: PaginationEntity
  }>
  update(id: string, account: AccountEntity): Promise<AccountEntity>
  delete(id: string): Promise<void>
}
```

### 2. HTTP Repository Implementation

```typescript
// Infrastructure repository implementation
export class MidazAccountRepository implements AccountRepository {
  constructor(
    private httpService: MidazHttpService,
    private organizationId: string
  ) {}

  async create(account: AccountEntity): Promise<AccountEntity> {
    const dto = MidazAccountMapper.toDTO(account)
    const response = await this.httpService.post<MidazAccountDTO>(
      `/organizations/${this.organizationId}/ledgers/${account.ledgerId}/accounts`,
      dto
    )
    return MidazAccountMapper.fromDTO(response)
  }

  async findById(id: string): Promise<AccountEntity> {
    const response = await this.httpService.get<MidazAccountDTO>(
      `/organizations/${this.organizationId}/accounts/${id}`
    )
    return MidazAccountMapper.fromDTO(response)
  }

  async findAll(pagination?: PaginationEntity): Promise<{
    data: AccountEntity[]
    pagination: PaginationEntity
  }> {
    const params = pagination ? 
      MidazPaginationMapper.toQueryParams(pagination) : {}
    
    const response = await this.httpService.get<{
      items: MidazAccountDTO[]
      pagination: MidazPaginationDTO
    }>(`/organizations/${this.organizationId}/accounts`, params)

    return {
      data: response.items.map(MidazAccountMapper.fromDTO),
      pagination: MidazPaginationMapper.fromDTO(response.pagination)
    }
  }
}
```

## React Query Integration

### 1. Query Configuration

```typescript
// Query client configuration (src/providers/query-provider.tsx)
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false
      },
      mutations: {
        retry: 1,
        onError: (error) => {
          toast.error(error.message || 'An error occurred')
        }
      }
    }
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

### 2. Query Hooks Pattern

```typescript
// Custom query hooks (src/client/accounts.ts)
export const accountsClient = {
  // Fetch all accounts
  fetchAll: (params?: AccountsParams) => {
    return getFetcher<AccountsResponse>(
      `/api/organizations/${params?.organizationId}/ledgers/${params?.ledgerId}/accounts`,
      { params: params?.pagination }
    )
  },

  // Fetch single account
  fetchById: (id: string, organizationId: string) => {
    return getFetcher<Account>(
      `/api/organizations/${organizationId}/accounts/${id}`
    )
  },

  // Create account
  create: (data: CreateAccountDTO) => {
    return postFetcher<Account>(
      `/api/organizations/${data.organizationId}/ledgers/${data.ledgerId}/accounts`,
      { body: data }
    )
  },

  // Update account
  update: (id: string, data: UpdateAccountDTO) => {
    return patchFetcher<Account>(
      `/api/organizations/${data.organizationId}/accounts/${id}`,
      { body: data }
    )
  },

  // Delete account
  delete: (id: string, organizationId: string) => {
    return deleteFetcher<void>(
      `/api/organizations/${organizationId}/accounts/${id}`
    )
  }
}

// Usage in components
export function useAccounts(params?: AccountsParams) {
  return useQuery({
    queryKey: ['accounts', params],
    queryFn: () => accountsClient.fetchAll(params),
    enabled: !!params?.organizationId && !!params?.ledgerId
  })
}

export function useCreateAccount() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: accountsClient.create,
    onSuccess: (data, variables) => {
      // Invalidate and refetch accounts list
      queryClient.invalidateQueries({
        queryKey: ['accounts', { 
          organizationId: variables.organizationId,
          ledgerId: variables.ledgerId 
        }]
      })
      
      // Add new account to cache
      queryClient.setQueryData(
        ['account', data.id],
        data
      )
      
      toast.success('Account created successfully')
    }
  })
}
```

## Error Handling

### 1. Custom Exception Classes

```typescript
// API exception classes
export class ApiException extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiException'
  }
}

export class ValidationException extends ApiException {
  constructor(message: string, errors: Record<string, string[]>) {
    super(message, 400, errors)
    this.name = 'ValidationException'
  }
}

export class UnauthorizedException extends ApiException {
  constructor(message = 'Unauthorized') {
    super(message, 401)
    this.name = 'UnauthorizedException'
  }
}

export class NotFoundException extends ApiException {
  constructor(message = 'Resource not found') {
    super(message, 404)
    this.name = 'NotFoundException'
  }
}
```

### 2. Error Interceptor Pattern

```typescript
// Global error interceptor
export class ErrorInterceptor {
  static handle(error: AxiosError): never {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          throw new ValidationException(
            data.message || 'Validation failed',
            data.errors
          )
        case 401:
          // Redirect to login
          window.location.href = '/signin'
          throw new UnauthorizedException()
        case 404:
          throw new NotFoundException(data.message)
        case 500:
          throw new ApiException(
            'Internal server error',
            500,
            data
          )
        default:
          throw new ApiException(
            data.message || 'Request failed',
            status,
            data
          )
      }
    }
    
    if (error.request) {
      throw new NetworkException('Network error occurred')
    }
    
    throw error
  }
}
```

## Pagination Pattern

### 1. Pagination DTOs

```typescript
// Pagination DTOs
export interface PaginationDTO {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationDTO
}
```

### 2. Pagination Mapper

```typescript
// Pagination mapper
export class PaginationMapper {
  static toQueryParams(pagination: PaginationEntity): Record<string, any> {
    return {
      page: pagination.page,
      limit: pagination.pageSize,
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder
    }
  }

  static fromDTO(dto: PaginationDTO): PaginationEntity {
    return new PaginationEntity({
      page: dto.page,
      pageSize: dto.pageSize,
      totalItems: dto.totalItems,
      totalPages: dto.totalPages,
      hasNext: dto.hasNext,
      hasPrevious: dto.hasPrevious
    })
  }
}
```

### 3. Pagination Hook

```typescript
// usePagination hook
export function usePagination(initialPage = 1, initialPageSize = 10) {
  const [pagination, setPagination] = useState({
    page: initialPage,
    pageSize: initialPageSize
  })

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }))
  }, [])

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }))
  }, [])

  const nextPage = useCallback(() => {
    setPagination(prev => ({ ...prev, page: prev.page + 1 }))
  }, [])

  const previousPage = useCallback(() => {
    setPagination(prev => ({ 
      ...prev, 
      page: Math.max(1, prev.page - 1) 
    }))
  }, [])

  return {
    ...pagination,
    setPage,
    setPageSize,
    nextPage,
    previousPage
  }
}
```

## Optimistic Updates

```typescript
// Optimistic update pattern
export function useUpdateAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAccountDTO }) =>
      accountsClient.update(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: ['account', id] })

      // Snapshot previous value
      const previousAccount = queryClient.getQueryData(['account', id])

      // Optimistically update
      queryClient.setQueryData(['account', id], (old: Account) => ({
        ...old,
        ...data
      }))

      return { previousAccount }
    },

    // Rollback on error
    onError: (err, { id }, context) => {
      if (context?.previousAccount) {
        queryClient.setQueryData(['account', id], context.previousAccount)
      }
      toast.error('Failed to update account')
    },

    // Refetch on success
    onSettled: (data, error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['account', id] })
    }
  })
}
```

## Middleware Pattern

### 1. Request Middleware

```typescript
// Logger middleware
export const loggerMiddleware: AxiosRequestInterceptor = (config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`)
  config.metadata = { startTime: Date.now() }
  return config
}

// Auth middleware
export const authMiddleware: AxiosRequestInterceptor = async (config) => {
  const session = await getSession()
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`
  }
  return config
}
```

### 2. Response Middleware

```typescript
// Performance middleware
export const performanceMiddleware: AxiosResponseInterceptor = (response) => {
  const duration = Date.now() - response.config.metadata?.startTime
  console.log(`[API Response] ${response.config.url} - ${duration}ms`)
  return response
}

// Transform middleware
export const transformMiddleware: AxiosResponseInterceptor = (response) => {
  // Transform snake_case to camelCase
  response.data = transformKeys(response.data, camelCase)
  return response
}
```

## Caching Strategies

### 1. Query Cache Configuration

```typescript
// Cache configuration per resource
export const cacheConfig = {
  accounts: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  },
  transactions: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000 // 5 minutes
  },
  organizations: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000 // 1 hour
  }
}
```

### 2. Cache Invalidation

```typescript
// Intelligent cache invalidation
export function useInvalidateRelatedQueries() {
  const queryClient = useQueryClient()

  return {
    invalidateAccount: (accountId: string) => {
      queryClient.invalidateQueries({ queryKey: ['account', accountId] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['balances', accountId] })
    },

    invalidateLedger: (ledgerId: string) => {
      queryClient.invalidateQueries({ queryKey: ['ledger', ledgerId] })
      queryClient.invalidateQueries({ queryKey: ['ledgers'] })
      queryClient.invalidateQueries({ 
        queryKey: ['accounts'],
        predicate: (query) => 
          query.queryKey[1]?.ledgerId === ledgerId
      })
    }
  }
}
```

## WebSocket Integration

```typescript
// WebSocket for real-time updates
export function useRealtimeUpdates(organizationId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_WS_URL}/organizations/${organizationId}`
    )

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      
      switch (message.type) {
        case 'ACCOUNT_UPDATED':
          queryClient.setQueryData(
            ['account', message.data.id],
            message.data
          )
          break
        
        case 'TRANSACTION_CREATED':
          queryClient.invalidateQueries({ 
            queryKey: ['transactions'] 
          })
          break
      }
    }

    return () => ws.close()
  }, [organizationId, queryClient])
}
```