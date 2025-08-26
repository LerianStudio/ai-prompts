# Coding Conventions and Standards

## Overview

This document outlines the coding conventions, naming standards, and best practices observed throughout the Midaz Console codebase. Following these conventions ensures consistency, maintainability, and readability across the entire application.

## Naming Conventions

### File Naming

#### Components
- **Format**: `kebab-case.tsx`
- **Examples**: 
  - `account-data-table.tsx`
  - `transaction-form-provider.tsx`
  - `metadata-field.tsx`

#### Use Cases
- **Format**: `{action}-{entity}-use-case.ts`
- **Examples**:
  - `create-account-use-case.ts`
  - `fetch-all-ledgers-use-case.ts`
  - `update-transaction-use-case.ts`

#### DTOs
- **Format**: `{entity}-dto.ts`
- **Examples**:
  - `account-dto.ts`
  - `transaction-dto.ts`
  - `pagination-dto.ts`

#### Mappers
- **Format**: `{entity}-mapper.ts`
- **Examples**:
  - `account-mapper.ts`
  - `midaz-transaction-mapper.ts`

#### Repositories
- **Format**: `{prefix}-{entity}-repository.ts`
- **Examples**:
  - `account-repository.ts` (interface)
  - `midaz-account-repository.ts` (implementation)
  - `mongo-organization-avatar-repository.ts`

### Class and Interface Naming

#### Entities
```typescript
// Always suffix with 'Entity'
export class AccountEntity { }
export class TransactionEntity { }
export class LedgerEntity { }
```

#### DTOs
```typescript
// Suffix with 'DTO'
export interface CreateAccountDTO { }
export interface UpdateTransactionDTO { }
export interface MidazLedgerDTO { }
```

#### Use Cases
```typescript
// Format: {Action}{Entity}UseCase
export class CreateAccountUseCase { }
export class FetchAllLedgersUseCase { }
export class DeleteTransactionUseCase { }
```

#### Repositories
```typescript
// Interface: {Entity}Repository
export interface AccountRepository { }

// Implementation: {Provider}{Entity}Repository
export class MidazAccountRepository implements AccountRepository { }
export class MongoOrganizationAvatarRepository { }
```

#### Mappers
```typescript
// Format: {Entity}Mapper or {Provider}{Entity}Mapper
export class AccountMapper { }
export class MidazTransactionMapper { }
```

### Variable and Function Naming

#### Variables
```typescript
// camelCase for variables
const accountBalance = 1000
const isLoading = false
const hasPermission = true

// UPPER_SNAKE_CASE for constants
const MAX_RETRIES = 3
const DEFAULT_PAGE_SIZE = 10
const API_TIMEOUT = 30000
```

#### Functions
```typescript
// camelCase for functions
function calculateBalance() { }
function validateTransaction() { }
async function fetchAccountData() { }

// Prefix boolean functions with 'is', 'has', 'can', 'should'
function isValidAccount() { }
function hasPermission() { }
function canEditTransaction() { }
function shouldRefetch() { }
```

#### React Components
```typescript
// PascalCase for components
export function AccountDataTable() { }
export function TransactionForm() { }
export const MetadataField = () => { }
```

#### Custom Hooks
```typescript
// Prefix with 'use'
export function useAccounts() { }
export function usePagination() { }
export function useTransactionForm() { }
```

## TypeScript Conventions

### Type Definitions

#### Interface vs Type
```typescript
// Use interface for object shapes
interface Account {
  id: string
  name: string
  balance: number
}

// Use type for unions, intersections, and primitives
type Status = 'active' | 'inactive' | 'pending'
type ID = string | number
type AccountWithMetadata = Account & { metadata: Record<string, any> }
```

#### Props Interfaces
```typescript
// Always define props with 'Props' suffix
interface AccountFormProps {
  account?: Account
  onSubmit: (data: CreateAccountDTO) => void
  disabled?: boolean
}

// For components with children
interface LayoutProps {
  children: React.ReactNode
  className?: string
}
```

#### Generics
```typescript
// Use descriptive generic names
interface Repository<TEntity, TCreateDTO, TUpdateDTO> {
  create(dto: TCreateDTO): Promise<TEntity>
  update(id: string, dto: TUpdateDTO): Promise<TEntity>
}

// Common generic conventions
// T - Type
// K - Key
// V - Value
// E - Element
// P - Props
```

### Type Assertions and Guards

```typescript
// Type guards
function isAccount(value: unknown): value is Account {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  )
}

// Avoid type assertions, prefer type guards
// Bad
const account = data as Account

// Good
if (isAccount(data)) {
  // data is now typed as Account
}
```

## React Patterns

### Component Structure

```typescript
// Standard component structure
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

// Types/Interfaces
interface ComponentProps {
  // props
}

// Component
export function Component({ prop1, prop2 }: ComponentProps) {
  // Hooks first
  const [state, setState] = useState()
  const { data, isLoading } = useQuery()
  
  // Effects
  useEffect(() => {
    // effect logic
  }, [])
  
  // Handlers
  const handleClick = () => {
    // handler logic
  }
  
  // Early returns
  if (isLoading) return <Skeleton />
  if (!data) return null
  
  // Main render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### Hooks Organization

```typescript
// Custom hook structure
export function useCustomHook(initialValue: number) {
  // State
  const [value, setValue] = useState(initialValue)
  
  // Derived state
  const doubledValue = useMemo(() => value * 2, [value])
  
  // Callbacks
  const increment = useCallback(() => {
    setValue(v => v + 1)
  }, [])
  
  // Effects
  useEffect(() => {
    // effect logic
  }, [value])
  
  // Return object with consistent naming
  return {
    value,
    doubledValue,
    increment,
    setValue
  }
}
```

## Import Organization

### Import Order

```typescript
// 1. React imports
import React, { useState, useEffect, useMemo } from 'react'

// 2. Next.js imports
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// 3. Third-party libraries
import { useQuery, useMutation } from '@tanstack/react-query'
import { z } from 'zod'
import { format } from 'date-fns'

// 4. Internal absolute imports
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

// 5. Internal relative imports
import { AccountForm } from './account-form'
import { accountSchema } from './schemas'

// 6. Types/interfaces
import type { Account, CreateAccountDTO } from '@/types'

// 7. Styles (if any)
import styles from './styles.module.css'
```

### Path Aliases

```typescript
// Use @ alias for src directory
import { Button } from '@/components/ui/button'
import { AccountRepository } from '@/core/domain/repositories'
import { useAccounts } from '@/hooks/use-accounts'

// Avoid relative imports for deeply nested files
// Bad
import { Button } from '../../../components/ui/button'

// Good
import { Button } from '@/components/ui/button'
```

## Error Handling

### Try-Catch Patterns

```typescript
// Async functions
async function fetchData() {
  try {
    const response = await api.get('/data')
    return response.data
  } catch (error) {
    // Specific error handling
    if (error instanceof ApiException) {
      console.error('API Error:', error.message)
      throw error
    }
    
    // Generic error handling
    console.error('Unexpected error:', error)
    throw new Error('Failed to fetch data')
  }
}

// In React components
const handleSubmit = async (data: FormData) => {
  try {
    await createAccount(data)
    toast.success('Account created successfully')
    router.push('/accounts')
  } catch (error) {
    // Let React Query handle the error
    // or show specific error message
    toast.error(error.message || 'Failed to create account')
  }
}
```

### Custom Error Classes

```typescript
// Define custom error classes
export class BusinessLogicError extends Error {
  constructor(message: string, public code: string) {
    super(message)
    this.name = 'BusinessLogicError'
  }
}

// Use specific errors
throw new BusinessLogicError(
  'Insufficient balance for transaction',
  'INSUFFICIENT_BALANCE'
)
```

## Comments and Documentation

### JSDoc Comments

```typescript
/**
 * Creates a new account in the specified ledger
 * @param dto - The account creation data
 * @returns The created account entity
 * @throws {ValidationException} If the input data is invalid
 * @throws {ConflictException} If an account with the same name exists
 */
export async function createAccount(dto: CreateAccountDTO): Promise<AccountEntity> {
  // implementation
}
```

### Inline Comments

```typescript
// Use comments to explain 'why', not 'what'

// Bad: Explains what the code does
// Increment counter by 1
counter++

// Good: Explains why
// Increment retry counter to track failed attempts for circuit breaker
retryCount++

// Good: Explains business logic
// Apply 15% discount for premium customers on orders over $100
if (customer.isPremium && order.total > 100) {
  order.discount = order.total * 0.15
}
```

### TODO Comments

```typescript
// Format: TODO(username): description
// TODO(john): Implement pagination for large datasets
// TODO(jane): Add caching to improve performance
// FIXME(bob): Handle edge case when balance is negative
```

## Testing Conventions

### Test File Naming

```typescript
// Component tests
'account-form.test.tsx'
'use-pagination.test.ts'

// Unit tests
'account-mapper.test.ts'
'validation-utils.test.ts'

// Integration tests
'account-api.integration.test.ts'

// E2E tests
'account-flow.e2e.test.ts'
```

### Test Structure

```typescript
// Describe-it pattern
describe('AccountMapper', () => {
  describe('fromDTO', () => {
    it('should map DTO to entity correctly', () => {
      // Arrange
      const dto: AccountDTO = {
        id: '123',
        name: 'Test Account'
      }
      
      // Act
      const entity = AccountMapper.fromDTO(dto)
      
      // Assert
      expect(entity.id).toBe('123')
      expect(entity.name).toBe('Test Account')
    })
    
    it('should handle null values', () => {
      // test implementation
    })
  })
})
```

## Git Conventions

### Branch Naming

```bash
# Feature branches
feature/add-account-validation
feature/implement-transaction-history

# Bug fixes
fix/account-balance-calculation
fix/transaction-validation-error

# Refactoring
refactor/update-account-repository
refactor/simplify-transaction-flow

# Documentation
docs/update-api-documentation
docs/add-setup-guide
```

### Commit Messages

```bash
# Format: type(scope): description

# Features
feat(accounts): add account validation
feat(transactions): implement bulk operations

# Bug fixes
fix(auth): resolve token refresh issue
fix(ui): correct button alignment

# Refactoring
refactor(api): simplify error handling
refactor(components): extract common logic

# Documentation
docs(readme): update installation steps
docs(api): add endpoint documentation

# Tests
test(accounts): add unit tests for mapper
test(e2e): add transaction flow tests

# Chores
chore(deps): update dependencies
chore(config): update eslint rules
```

## Code Quality

### ESLint Rules

```javascript
// Key ESLint rules enforced
{
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": "error",
    "prefer-const": "error",
    "no-var": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

### Prettier Configuration

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "none",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

## Performance Guidelines

### Memoization

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(({ data }: Props) => {
  return <div>{/* render */}</div>
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.data.id === nextProps.data.id
})

// Use useMemo for expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// Use useCallback for stable function references
const handleClick = useCallback((id: string) => {
  // handler logic
}, [dependency])
```

### Lazy Loading

```typescript
// Lazy load components
const HeavyComponent = lazy(() => import('./heavy-component'))

// Use with Suspense
<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

## Security Guidelines

### Input Validation

```typescript
// Always validate user input
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  age: z.number().min(0).max(150)
})

// Sanitize HTML content
import DOMPurify from 'dompurify'
const sanitized = DOMPurify.sanitize(userInput)
```

### Sensitive Data

```typescript
// Never log sensitive data
// Bad
console.log('User password:', password)

// Good
console.log('User authenticated:', !!password)

// Use environment variables
const apiKey = process.env.API_KEY
// Never hardcode secrets
// Bad
const apiKey = 'sk-1234567890'
```

## Accessibility Standards

### ARIA Attributes

```typescript
// Provide proper ARIA labels
<button
  aria-label="Delete account"
  aria-describedby="delete-warning"
  onClick={handleDelete}
>
  <TrashIcon />
</button>

// Use semantic HTML
// Bad
<div onClick={handleClick}>Click me</div>

// Good
<button onClick={handleClick}>Click me</button>
```

### Keyboard Navigation

```typescript
// Support keyboard navigation
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
  onClick={handleClick}
>
  Interactive element
</div>
```

## Internationalization

### Message Definition

```typescript
// Define messages with defineMessages
import { defineMessages } from 'react-intl'

const messages = defineMessages({
  title: {
    id: 'account.form.title',
    defaultMessage: 'Create Account'
  },
  submit: {
    id: 'account.form.submit',
    defaultMessage: 'Submit'
  }
})

// Use in components
const intl = useIntl()
const title = intl.formatMessage(messages.title)
```

## Summary

These conventions ensure:
- **Consistency**: Uniform code style across the codebase
- **Readability**: Easy to understand code structure
- **Maintainability**: Simple to modify and extend
- **Quality**: High standards for production code
- **Team Efficiency**: Clear guidelines for all developers

Following these conventions is essential for maintaining the high quality and professional standards of the Midaz Console codebase.