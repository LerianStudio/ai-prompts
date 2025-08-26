---
allowed-tools: Read(*), Glob(*), Grep(*), Bash(*), Edit(*), MultiEdit(*), Task(*)
description: Refactor complex code to be more readable, maintainable, and easier to understand while preserving functionality
argument-hint: [file-path-or-code-block]
---

# /simplify

Refactor complex code to be more readable, maintainable, and easier to understand while preserving functionality.

## Usage

```bash
/simplify [file path or code block]
```

**Arguments:**

- `file path or code block`: Path to file to simplify, or specific code block (required)

## Simplification Process

### 1. Complexity Analysis

```bash
# Identify complexity hotspots in React/TypeScript code
rg "if.*if.*if|for.*for|while.*while" --type ts --type tsx -A 10  # Nested structures
rg "&&.*&&|\\|\\|.*\\|\\|" --type ts --type tsx -A 5              # Complex conditionals
rg "useEffect.*useEffect|useState.*useState" --type tsx -A 10      # Multiple hooks
rg "\.test\.|\.spec\." --type ts | xargs rg -l "skip|todo"        # Untested code
```

### 2. Simplification Strategies

#### Extract Custom Hooks

**Before:**

```tsx
const UserProfile = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchUser(userId)
      .then(setUser)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  // 50 lines of JSX rendering logic
}
```

**After:**

```tsx
const UserProfile = ({ userId }: { userId: string }) => {
  const { user, loading, error } = useUser(userId)

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />
  if (!user) return <NotFound />

  return <UserDetails user={user} />
}

const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchUser(userId)
      .then(setUser)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [userId])

  return { user, loading, error }
}
```

#### Simplify Conditionals in JSX

**Before:**

```tsx
const UserCard = ({ user }: { user: User }) => {
  return (
    <div>
      {user.age >= 18 &&
      user.age <= 65 &&
      user.status === 'active' &&
      !user.suspended &&
      (user.balance > 0 || user.creditLimit > 0) ? (
        <div>
          {user.isPremium ? (
            <PremiumUserBadge />
          ) : user.isVerified ? (
            <VerifiedUserBadge />
          ) : (
            <StandardUserBadge />
          )}
        </div>
      ) : (
        <IneligibleUserMessage />
      )}
    </div>
  )
}
```

**After:**

```tsx
const UserCard = ({ user }: { user: User }) => {
  const isEligible = useUserEligibility(user)
  const badgeType = getUserBadgeType(user)

  return (
    <div>
      {isEligible ? <UserBadge type={badgeType} /> : <IneligibleUserMessage />}
    </div>
  )
}

const useUserEligibility = (user: User): boolean => {
  const isValidAge = user.age >= 18 && user.age <= 65
  const isActive = user.status === 'active' && !user.suspended
  const hasFunds = user.balance > 0 || user.creditLimit > 0

  return isValidAge && isActive && hasFunds
}

const getUserBadgeType = (user: User): 'premium' | 'verified' | 'standard' => {
  if (user.isPremium) return 'premium'
  if (user.isVerified) return 'verified'
  return 'standard'
}
```

#### Use Array Methods Instead of Loops

**Before:**

```tsx
const ProductList = ({ products }: { products: Product[] }) => {
  const validProducts = []
  const discountedProducts = []

  for (let i = 0; i < products.length; i++) {
    const product = products[i]
    if (product.isActive && product.stock > 0) {
      validProducts.push(product)
      if (product.discount > 0) {
        discountedProducts.push({
          ...product,
          finalPrice: product.price * (1 - product.discount)
        })
      }
    }
  }

  return (
    <div>
      {discountedProducts.map((product, index) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

**After:**

```tsx
const ProductList = ({ products }: { products: Product[] }) => {
  const discountedProducts = products
    .filter((product) => product.isActive && product.stock > 0)
    .filter((product) => product.discount > 0)
    .map((product) => ({
      ...product,
      finalPrice: product.price * (1 - product.discount)
    }))

  return (
    <div>
      {discountedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

#### Use Early Returns in React

**Before:**

```tsx
const OrderForm = ({ order }: { order: Order | null }) => {
  let content

  if (order) {
    if (order.status === 'draft') {
      if (order.items.length > 0) {
        content = (
          <form onSubmit={handleSubmit}>
            {order.items.map((item) => (
              <OrderItem key={item.id} item={item} />
            ))}
            <button type="submit">Submit Order</button>
          </form>
        )
      } else {
        content = <EmptyOrderMessage />
      }
    } else {
      content = <OrderStatusMessage status={order.status} />
    }
  } else {
    content = <LoadingSpinner />
  }

  return <div>{content}</div>
}
```

**After:**

```tsx
const OrderForm = ({ order }: { order: Order | null }) => {
  if (!order) {
    return <LoadingSpinner />
  }

  if (order.status !== 'draft') {
    return <OrderStatusMessage status={order.status} />
  }

  if (order.items.length === 0) {
    return <EmptyOrderMessage />
  }

  return (
    <form onSubmit={handleSubmit}>
      {order.items.map((item) => (
        <OrderItem key={item.id} item={item} />
      ))}
      <button type="submit">Submit Order</button>
    </form>
  )
}
```

#### Extract Constants and Configuration

**Before:**

```tsx
const useDebounce = <T>(value: T, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  // Component using magic numbers
  const searchQuery = useDebounce(inputValue, 500)

  if (searchQuery.length >= 3 && users.length <= 100) {
    performSearch()
  }
}
```

**After:**

```tsx
const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 500,
  MIN_SEARCH_LENGTH: 3,
  MAX_RESULTS_BEFORE_FILTER: 100
} as const

const useDebounce = <T>(
  value: T,
  delay: number = SEARCH_CONFIG.DEBOUNCE_DELAY
) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Component with clear intent
const SearchComponent = () => {
  const searchQuery = useDebounce(inputValue)

  const shouldPerformSearch =
    searchQuery.length >= SEARCH_CONFIG.MIN_SEARCH_LENGTH &&
    users.length <= SEARCH_CONFIG.MAX_RESULTS_BEFORE_FILTER

  if (shouldPerformSearch) {
    performSearch()
  }
}
```

### 3. Frontend Naming Improvements

**Component and Hook Names:**

- Use descriptive, domain-specific names
- Prefix custom hooks with `use`
- Use PascalCase for components, camelCase for hooks
- Make boolean props/state interrogative (is, has, can, should)

**Before:**

```tsx
const Comp = ({
  data,
  fn,
  isX
}: {
  data: any
  fn: () => void
  isX: boolean
}) => {
  const [val, setVal] = useState('')
  const res = useHook(data)

  return <div>{res.info}</div>
}
```

**After:**

```tsx
const UserProfileCard = ({
  userData,
  onUpdate,
  isEditable
}: {
  userData: UserData
  onUpdate: () => void
  isEditable: boolean
}) => {
  const [displayName, setDisplayName] = useState('')
  const { profile, isLoading, error } = useUserProfile(userData.id)

  return <div>{profile.fullName}</div>
}
```

### 4. React Component Structure Improvements

#### Before - Monolithic Component

```tsx
const OrderManagement = () => {
  // 300 lines of mixed state, logic, and UI
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [editMode, setEditMode] = useState(false)

  // Complex validation logic
  // API calls
  // Event handlers
  // Rendering logic all mixed together

  return <div>{/* 200 lines of JSX */}</div>
}
```

#### After - Composed Components

```tsx
const OrderManagement = () => {
  return (
    <div>
      <OrderFilters />
      <OrderList />
      <OrderDetails />
    </div>
  )
}

const OrderList = () => {
  const { orders, loading, error } = useOrders()
  const { selectedOrderId, selectOrder } = useOrderSelection()

  if (loading) return <OrderListSkeleton />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {orders.map((order) => (
        <OrderListItem
          key={order.id}
          order={order}
          isSelected={selectedOrderId === order.id}
          onSelect={selectOrder}
        />
      ))}
    </div>
  )
}
```

### 5. React Testing Simplification

**Before - Complex Test Setup:**

```tsx
describe('UserProfile', () => {
  test('should show user info', () => {
    const mockUser = { id: 1, name: 'John', email: 'john@test.com', age: 25 }
    const mockFn = jest.fn()

    render(
      <QueryClient>
        <BrowserRouter>
          <ThemeProvider theme={mockTheme}>
            <UserProfile user={mockUser} onUpdate={mockFn} />
          </ThemeProvider>
        </BrowserRouter>
      </QueryClient>
    )

    expect(screen.getByText('John')).toBeInTheDocument()
  })
})
```

**After - Simplified with Test Utils:**

```tsx
const renderWithProviders = (ui: ReactElement) => {
  return render(ui, {
    wrapper: ({ children }) => <TestProviders>{children}</TestProviders>
  })
}

describe('UserProfile', () => {
  test('displays user name when user data is provided', () => {
    const user = createMockUser({ name: 'John' })

    renderWithProviders(<UserProfile user={user} onUpdate={jest.fn()} />)

    expect(screen.getByText('John')).toBeInTheDocument()
  })
})
```

### 6. TypeScript Documentation

Use TSDoc comments and TypeScript types for self-documenting code:

```tsx
/**
 * Custom hook for managing form state with validation
 * @param initialValues - Initial form field values
 * @param validationSchema - Schema for validating form fields
 * @returns Form state, handlers, and validation results
 */
const useForm = <T extends Record<string, any>>(
  initialValues: T,
  validationSchema: ValidationSchema<T>
): {
  values: T
  errors: Partial<Record<keyof T, string>>
  isValid: boolean
  handleChange: (field: keyof T, value: T[keyof T]) => void
  handleSubmit: (onSubmit: (values: T) => void) => void
  reset: () => void
} => {
  // Implementation with clear, typed return
}
```

## Validation

After simplification, ensure:

- All tests still pass
- No functionality is lost
- Performance hasn't degraded
- Code coverage is maintained

## Output Format

```markdown
## Simplification Summary

**Complexity Reduced From:** [metrics]
**Complexity Reduced To:** [metrics]

### Changes Made:

1. Extracted X methods for better separation of concerns
2. Simplified Y conditional expressions
3. Replaced Z loops with functional constructs
4. Improved naming for N variables/functions

### Key Improvements:

- Reduced cyclomatic complexity from A to B
- Improved readability score from C to D
- Decreased file length from E to F lines

### Code Diff:

[Show key before/after examples]
```

## Guidelines

- Preserve all functionality
- Maintain or improve performance
- Keep domain logic intact
- Follow language idioms
- Consider team conventions
- Add tests for refactored code
