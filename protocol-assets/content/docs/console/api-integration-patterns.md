# API Integration Patterns

This document outlines the standardized patterns for API integration in the Lerian Console based on the actual implementation patterns found in the codebase.

## Frontend API Client Architecture

### 1. React Query Integration

The console uses React Query (@tanstack/react-query) with custom hooks for each resource. The actual implementation follows this pattern:

```typescript
// Standard client hook pattern from the console codebase
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

// Mutation pattern with cache invalidation
export const useCreateAccount = ({
  organizationId,
  ledgerId,
  onSuccess,
  ...options
}: UseCreateAccountProps) => {
  const queryClient = useQueryClient()

  return useMutation<AccountDto, Error, CreateAccountDto>({
    mutationKey: ['accounts'],
    mutationFn: postFetcher(
      `/api/organizations/${organizationId}/ledgers/${ledgerId}/accounts`
    ),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({
        queryKey: ['accounts', { organizationId, ledgerId }]
      })
      onSuccess?.(...args)
    },
    ...options
  })
}
```

### 2. Fetcher Utilities Structure

All API clients use standardized fetcher utilities from `@/lib/fetcher`. The fetchers follow a functional pattern and include authentication, error handling, and specialized download support:

```typescript
// lib/fetcher/index.ts - Actual implementation pattern
import { signOut } from 'next-auth/react'
import { createQueryString } from '../search'

export const getFetcher = (url: string) => {
  return async () => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return responseHandler(response)
  }
}

export const getPaginatedFetcher = (url: string, params?: {}) => {
  return async () => {
    const response = await fetch(url + createQueryString(params), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return responseHandler(response)
  }
}

export const postFetcher = (url: string) => {
  return async (body: any) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    return responseHandler(response)
  }
}

export const deleteFetcher = (url: string) => {
  return async ({ id }: { id: string }) => {
    const response = await fetch(`${url}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    return responseHandler(response)
  }
}

export const downloadFetcher = (url: string) => {
  return async (): Promise<void> => {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`)
    }

    // The API returns a redirect to the download URL
    // For a download endpoint, we want to trigger the browser's download
    const downloadUrl = response.url

    // Create a temporary link element to trigger download
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = '' // Let the server determine the filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Form data fetchers for file uploads
export const postFormDataFetcher = (url: string) => {
  return async (body: any) => {
    // Convert object to FormData
    const formData = new FormData()

    for (const [key, value] of Object.entries(body)) {
      if (value !== null && value !== undefined) {
        // Handle File objects specially
        if (value instanceof File) {
          formData.append(key, value)
        } else {
          // Convert other values to string
          formData.append(key, String(value))
        }
      }
    }

    const response = await fetch(url, {
      method: 'POST',
      // Don't set Content-Type header - browser will set it with proper boundary for FormData
      body: formData
    })

    return responseHandler(response)
  }
}

// Response handler with authentication and error management
const responseHandler = async (response: Response) => {
  if (!response.ok) {
    if (response.status === 401) {
      signOut({ callbackUrl: '/login' })
      return
    }

    const errorMessage = await response.json()
    throw new Error(errorMessage.message)
  }

  return await response.json()
}
```

### 3. Resource-specific Client Pattern

Each resource follows a consistent client structure. The console codebase uses direct environment variables for base paths:

```typescript
// src/client/accounts.ts - Console implementation pattern
// Direct environment variable usage (actual console pattern)
const baseUrl = process.env.MIDAZ_BASE_PATH

type UseListAccountsProps = {
  organizationId: string
  ledgerId: string
  query?: AccountSearchParamDto
  enabled?: boolean
} & Omit<UseQueryOptions<PaginationDto<AccountDto>>, 'queryKey' | 'queryFn'>

type UseCreateAccountProps = UseMutationOptions<AccountDto, Error, CreateAccountDto> & {
  organizationId: string
  ledgerId: string
  onSuccess?: (...args: any[]) => void
}

export const useListAccounts = ({
  organizationId,
  ledgerId,
  query,
  enabled = true,
  ...options
}: UseListAccountsProps) => {
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

export const useDeleteAccount = ({
  organizationId,
  ledgerId,
  accountId,
  onSuccess,
  ...options
}: UseDeleteAccountProps) => {
  const queryClient = useQueryClient()

  return useMutation<any, Error, { id: string }>({
    mutationKey: ['accounts', accountId],
    mutationFn: deleteFetcher(
      `/api/organizations/${organizationId}/ledgers/${ledgerId}/accounts`
    ),
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['accounts'] })
      onSuccess?.(...args)
    },
    ...options
  })
}
```

## Next.js API Routes Pattern

### 1. Simple Route Handlers

The actual implementation uses straightforward route handlers without complex dependency injection:

```typescript
// app/api/organizations/[id]/ledgers/[ledgerId]/accounts/route.ts
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; ledgerId: string } }
) {
  try {
    // Implementation logic
    return Response.json(result)
  } catch (error) {
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; ledgerId: string } }
) {
  try {
    const data = await request.json()
    // Implementation logic
    return Response.json(result, { status: 201 })
  } catch (error) {
    return Response.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 2. Route Parameter Extraction

Routes follow REST conventions with nested resource paths:

```typescript
// Pattern: /api/organizations/{organizationId}/ledgers/{ledgerId}/accounts
// Pattern: /api/organizations/{organizationId}/ledgers/{ledgerId}/assets/{assetId}
// Pattern: /api/organizations/{organizationId}/ledgers/{ledgerId}/transactions/{transactionId}
```

## Error Handling Patterns

### 1. Simple Error Handling

The implementation uses straightforward error handling:

```typescript
// Basic error handling in fetchers
if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`)
}

// In React Query hooks
const { data, error, isLoading } = useListAccounts({
  organizationId,
  ledgerId,
  query,
})

if (error) {
  // Handle error in component
}
```

### 2. HTTP Status Code Handling

Standard HTTP status codes are used:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Type Safety Patterns

### 1. DTO Types

All API interactions use strongly typed DTOs:

```typescript
// DTO pattern from core/application/dto/
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
```

### 2. Pagination Response Pattern

Consistent pagination response structure:

```typescript
export interface PaginationDto<T> {
  items: T[]
  limit: number
  page: number
  totalItems?: number
  totalPages?: number
}
```

## Hook Props Pattern

### 1. Consistent Hook Props Structure

All query hooks follow this pattern:

```typescript
type UseListResourceProps = {
  organizationId: string
  ledgerId: string
  query?: ResourceSearchParamDto
  enabled?: boolean
} & Omit<UseQueryOptions<PaginationDto<ResourceDto>>, 'queryKey' | 'queryFn'>
```

### 2. Query Key Pattern

Query keys follow a structured pattern using objects for better cache management:

```typescript
// Pattern: [resource, { key: value }] for better cache invalidation
queryKey: ['reports', { organizationId, limit, page, status, templateId }]

// For single resource queries
queryKey: ['reports', reportId]

// For specific operations
queryKey: ['reports', reportId, 'download']
queryKey: ['reports', reportId, 'download-info']
```

## Best Practices

### 1. Environment Configuration

The console uses direct environment variable access for API configuration:

```typescript
// Console codebase pattern - Direct environment variables
const baseUrl = process.env.MIDAZ_BASE_PATH
const transactionBaseUrl = process.env.MIDAZ_TRANSACTION_BASE_PATH
const identityBaseUrl = process.env.PLUGIN_IDENTITY_BASE_PATH
const feesBaseUrl = process.env.PLUGIN_FEES_PATH

// Feature flags
const authEnabled = process.env.NEXT_PUBLIC_MIDAZ_AUTH_ENABLED === 'true'
const feesEnabled = process.env.NEXT_PUBLIC_PLUGIN_FEES_ENABLED === 'true'

// Usage in API endpoints
const endpoint = `/api/organizations/${organizationId}/ledgers/${ledgerId}/accounts`
```

### 2. Cache Invalidation Patterns

Mutations automatically invalidate related queries for data consistency:

```typescript
onSuccess: async (...args) => {
  await queryClient.invalidateQueries({ queryKey: ['reports'] })
  onSuccess?.(...args)
}
```

### 3. Enabled Flag Usage

All query hooks support an `enabled` flag for conditional fetching:

```typescript
const { data } = useListReports({
  organizationId,
  enabled: !!organizationId
})

// For single resource with dependency check
const { data } = useGetReport({
  organizationId,
  reportId,
  enabled: enabled && !!reportId
})
```

### 2. Mutation Response Types

Mutations return the created/updated resource:

```typescript
mutationFn: ({ organizationId, ledgerId, ...data }) =>
  postFetcher<CreateAccountDto, AccountDto>(endpoint, data)
```

### 3. URL Construction

URLs are constructed using template literals with proper parameter interpolation:

```typescript
`/api/organizations/${organizationId}/ledgers/${ledgerId}/accounts/${accountId}`
```

This implementation provides a simple, consistent, and maintainable approach to API integration without unnecessary complexity.
</file>
