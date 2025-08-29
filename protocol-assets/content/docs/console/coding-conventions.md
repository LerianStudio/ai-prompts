# Coding Conventions

This document outlines the coding conventions used in the Lerian Console application, based on the actual codebase implementation patterns.

## File Naming Conventions

### 1. Component Files

Components use kebab-case naming with index.tsx pattern:

```
// UI Components (primitives)
src/components/ui/button/index.tsx
src/components/ui/paper/index.tsx
src/components/ui/loading-button/index.tsx
src/components/ui/multiple-select/index.tsx

// Business Components
src/components/entity-data-table/index.tsx
src/components/table/name-table-cell.tsx
src/components/pagination/index.tsx

// Form Components
src/components/form/select-field/index.tsx
```

### 2. Page and Route Files

Next.js pages and routes follow framework conventions:

```
// App Router pages with route groups - Console pattern
src/app/(auth-routes)/signin/page.tsx
src/app/(routes)/layout.tsx
src/app/(routes)/page.tsx
src/app/(routes)/accounts/accounts-data-table.tsx
src/app/(routes)/ledgers/ledgers-data-table.tsx
src/app/(routes)/transactions/transactions-data-table.tsx

// Route-specific components follow feature naming
src/app/(routes)/accounts/accounts-sheet.tsx
src/app/(routes)/assets/assets-sheet.tsx
src/app/(routes)/settings/organizations/organizations-form.tsx
```

### 3. Client API Files

Client API hooks follow resource naming pattern:

```
src/client/accounts.ts
src/client/assets.ts  
src/client/ledgers.ts
src/client/organizations.ts
src/client/portfolios.ts
src/client/segments.ts
src/client/transactions.ts
src/client/users.ts
```

### 4. Hook Files

Custom hooks use camelCase with "use" prefix:

```
src/hooks/use-click-away.tsx
src/hooks/use-debounce.ts
src/hooks/use-fee-calculations.ts
src/hooks/use-pagination.ts
src/hooks/use-query-params.tsx
src/hooks/use-stepper.ts
src/hooks/use-time.ts
src/hooks/use-toast.ts
```

### 5. Schema and DTO Files

Schema files use singular noun naming:

```
src/schema/account.ts
src/schema/assets.ts
src/schema/auth.ts
src/schema/ledger.ts
src/schema/organization.ts
src/schema/portfolio.ts
src/schema/transactions.ts
src/schema/user.ts

// DTOs in core architecture - Console pattern
src/core/application/dto/account-dto.ts
src/core/application/dto/asset-dto.ts
src/core/application/dto/ledger-dto.ts
src/core/application/dto/organization-dto.ts
src/core/application/dto/pagination-dto.ts
src/core/application/dto/transaction-dto.ts
```

### 6. Utility and Library Files

Utility files use kebab-case:

```
src/lib/fetcher/index.ts
src/lib/utils.ts (standard shadcn/ui utils)
```

## TypeScript Conventions

### 1. Interface and Type Definitions

Use descriptive names with proper suffixes and actual patterns from the codebase:

```typescript
// DTOs with descriptive properties - Console pattern
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

// Component Props interfaces - Console pattern (standardize on interface)
interface AccountsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

interface CreateUserFormProps {
  onSuccess?: () => void
  onOpenChange?: (open: boolean) => void
  isReadOnly?: boolean
}

// API Hook Props with pagination - Console pattern (keep as type for API hooks)
type UseListAccountsProps = {
  organizationId: string
  ledgerId: string
  query?: AccountSearchParamDto
  enabled?: boolean
} & Omit<UseQueryOptions<PaginationDto<AccountDto>>, 'queryKey' | 'queryFn'>

type PaginationRequest = {
  limit?: number
  page?: number
}

// Form data types inferred from Zod schemas - Console pattern
export type DetailFormData = z.infer<typeof detailFormSchema>
export type AddressFormData = z.infer<typeof addressFormSchema>
export type ThemeFormData = z.infer<typeof themeFormSchema>
```

### 2. Generic Type Usage

Consistent generic naming and usage:

```typescript
// Pagination response
export interface PaginationDto<T> {
  items: T[]
  limit: number
  page: number
  totalItems?: number
  totalPages?: number
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  data: T
  message?: string
  statusCode: number
}

// React Query hook types
export const useListAccounts = <TData = PaginationDto<AccountDto>>({
  organizationId,
  ledgerId,
  query,
  enabled = true,
  ...options
}: UseListAccountsProps & UseQueryOptions<PaginationDto<AccountDto>, Error, TData>)
```

### 3. Enum Conventions

The console uses string literal types rather than enums:

```typescript
// Console pattern - String literal types instead of enums
export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'

export type AssetType = 'currency' | 'crypto' | 'commodity' | 'others'

export type AccountType = 'deposit' | 'savings' | 'creditCard' | 'loans' | 'marketplace' | 'external'

// Used in schema definitions
const accountTypes = ['deposit', 'savings', 'creditCard', 'loans', 'marketplace', 'external'] as const
```

## Variable and Function Naming

### 1. Boolean Variables

Use descriptive prefixes for boolean variables:

```typescript
// Good
const isLoading = true
const hasPermission = false
const canEdit = true
const shouldValidate = false
const isEnabled = true

// Component props - Console pattern
interface LoadingButtonProps {
  loading?: boolean
  disabled?: boolean
}

interface CopyableInputFieldProps {
  readOnly?: boolean
}
```

### 2. Function Naming

Use descriptive verbs for functions:

```typescript
// Event handlers - Console pattern
const handleSubmit = () => {}
const handleFormSubmit = (values: FormData) => {}
const handleCancel = () => {}
const handleConfirm = () => {}

// Utility functions - Console pattern
const formatCurrency = (amount: number) => {}
const validateEmail = (email: string) => {}
const transformData = (data: unknown) => {}

// Zod schema composition - Console uses modular schemas
export const detailFormSchema = z.object({
  legalName: organization.legalName,
  doingBusinessAs: organization.doingBusinessAs,
  legalDocument: organization.legalDocument
})

// API functions use "use" prefix for hooks
const useListAccounts = () => {}
const useCreateAccount = () => {}
const useUpdateAccount = () => {}
const useDeleteAccount = () => {}
```

### 3. Constant Naming

Use UPPER_SNAKE_CASE for constants:

```typescript
// Constants - Console pattern
export const API_TIMEOUT = 30000
export const MAX_RETRY_ATTEMPTS = 3
export const DEFAULT_PAGE_SIZE = 20

// Environment constants
const MIDAZ_BASE_PATH = process.env.MIDAZ_BASE_PATH
const PLUGIN_IDENTITY_BASE_PATH = process.env.PLUGIN_IDENTITY_BASE_PATH

// Feature flags
const AUTH_ENABLED = process.env.NEXT_PUBLIC_MIDAZ_AUTH_ENABLED === 'true'
const FEES_ENABLED = process.env.NEXT_PUBLIC_PLUGIN_FEES_ENABLED === 'true'
```

## Component Structure Conventions

### 1. Component Organization

Components follow a consistent structure:

```typescript
// Component with props interface - Console pattern
interface CreateUserFormProps {
  onSuccess?: () => void
  onOpenChange?: (open: boolean) => void
  isReadOnly?: boolean
}

export function CreateUserForm({
  onSuccess,
  onOpenChange,
  isReadOnly = false
}: CreateUserFormProps) {
  // React Query hooks first
  const createUserMutation = useCreateUser({
    onSuccess: () => {
      onSuccess?.()
      onOpenChange?.(false)
    }
  })

  // Form setup
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues
  })

  // Event handlers
  const handleSubmit = async (values: CreateUserFormData) => {
    await createUserMutation.mutateAsync(values)
  }

  // Render
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Form content */}
      </form>
    </Form>
  )
}
```

### 2. Barrel Exports

Use index.tsx files for clean imports:

```typescript
// src/components/form/index.tsx - Console pattern uses export *
export * from './input-field'
export * from './select-field'
export * from './combo-box-field'
export * from './metadata-field'
export * from './state-field'
export * from './country-field'
export * from './currency-field'
export * from './copyable-input-field'

// Usage
import { InputField, SelectField } from '@/components/form'
```

## Import and Export Conventions

### 1. Import Organization

Organize imports in a specific order:

```typescript
// External libraries first
import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

// Internal imports with absolute paths
import { AccountDto, CreateAccountDto } from '@/core/application/dto/account-dto'
import { useListAccounts } from '@/client/accounts'
import { Button } from '@/components/ui/button'
import { InputField } from '@/components/form/input-field'

// Relative imports last (if any)
import { AccountFormSchema } from './schemas'
```

### 2. Export Patterns

Use consistent export patterns:

```typescript
// Named exports for utilities
export const formatCurrency = () => {}
export const validateInput = () => {}

// Default exports for components
export default function AccountPage() {
  return <div>Account Page</div>
}

// Mixed exports when needed
export const AccountForm = () => {}
export const AccountList = () => {}
export default AccountPage
```

## Code Organization Patterns

### 1. Directory Structure

Follow domain-driven directory organization:

```
src/
├── app/                          # Next.js app router
├── client/                       # API client hooks
├── components/                   # React components
│   ├── ui/                      # UI primitives
│   ├── form/                    # Form components
│   └── [domain-components]/     # Business components
├── core/                        # Clean architecture core
│   ├── domain/                  # Domain layer
│   ├── application/             # Application layer
│   └── infrastructure/          # Infrastructure layer
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries
├── providers/                   # React providers
├── schema/                      # Validation schemas
├── types/                       # TypeScript type definitions
└── utils/                       # Utility functions
```

### 2. Feature Organization

Organize features by domain:

```
src/app/(routes)/
├── accounts/
│   ├── accounts-data-table.tsx
│   ├── accounts-sheet.tsx
│   ├── accounts-skeleton.tsx
│   ├── layout.tsx
│   └── page.tsx
├── assets/
│   ├── assets-data-table.tsx
│   ├── assets-sheet.tsx
│   └── page.tsx
└── ledgers/
    ├── ledgers-data-table.tsx
    ├── ledgers-sheet.tsx
    └── page.tsx
```

## Configuration and Environment

### 1. Environment Variables

Use descriptive environment variable names:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_TIMEOUT=30000

# Feature Flags
NEXT_PUBLIC_ENABLE_TRACING=true
NEXT_PUBLIC_ENABLE_METRICS=false

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

### 2. Configuration Files

Keep configuration files simple and typed:

```typescript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['sharp']
  },
  images: {
    domains: ['localhost']
  }
}

export default nextConfig

// tsconfig.json paths
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"]
    }
  }
}
```

## Testing Conventions

### 1. Test File Naming

Test files use the same name as the source file with .test or .spec suffix:

```
src/hooks/use-debounce.test.ts
src/lib/form/get-initial-values.test.ts
src/core/application/mappers/pagination-mapper.test.ts
```

### 2. Test Structure

Follow consistent test structure:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should debounce the value', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    rerender({ value: 'updated', delay: 500 })
    expect(result.current).toBe('initial')

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })
})
```

## Storybook Conventions

### 1. Story File Naming

Story files follow component naming with .stories suffix:

```
src/components/ui/button/button.stories.tsx
src/components/form/input-field/input-field.stories.tsx
src/components/entity-data-table/entity-data-table.stories.tsx
```

### 2. Story Structure

Follow consistent story structure:

```typescript
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './index'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
    }
  }
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button'
  }
}

export const Primary: Story = {
  args: {
    variant: 'default',
    children: 'Primary Button'
  }
}
```

## Documentation Conventions

### 1. Component Documentation

Use MDX files for component documentation:

```mdx
# Button Component

The Button component is a fundamental UI element used throughout the application.

## Usage

```tsx
import { Button } from '@/components/ui/button'

export default function Example() {
  return (
    <Button variant="default" onClick={() => console.log('clicked')}>
      Click me
    </Button>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'default' | Button style variant |
| size | string | 'default' | Button size |
| disabled | boolean | false | Whether button is disabled |
```

These conventions ensure consistency across the codebase and make it easier for developers to understand and contribute to the project.
</file>
