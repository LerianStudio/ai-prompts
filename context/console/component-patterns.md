# Component Patterns and Conventions

## Component Architecture

The codebase follows a structured component organization with clear separation between UI primitives and business components.

## Directory Structure

```
src/
├── components/           # Business/feature components
│   ├── breadcrumb/
│   ├── card/
│   ├── entity-data-table/
│   ├── form/
│   ├── header/
│   ├── page/
│   ├── sheet/
│   └── transactions/
└── components/ui/        # Primitive/base components
    ├── alert/
    ├── button/
    ├── dialog/
    ├── input/
    └── select/
```

## Component Patterns

### 1. Compound Component Pattern

Components are built using the compound pattern for flexibility and composability:

```typescript
// Card component structure
src/components/card/
├── card-root.tsx       # Root component
├── card-header.tsx     # Header component
├── index.tsx           # Barrel export
└── card.stories.tsx    # Storybook stories

// Usage
<Card.Root>
  <Card.Header>
    <Card.Title>Account Details</Card.Title>
    <Card.Description>Manage your account settings</Card.Description>
  </Card.Header>
  <Card.Content>
    {/* Content */}
  </Card.Content>
</Card.Root>
```

### 2. Radix UI Foundation

UI primitives are built on top of Radix UI for accessibility:

```typescript
// Dialog component using Radix
import * as DialogPrimitive from '@radix-ui/react-dialog'

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg",
        "translate-x-[-50%] translate-y-[-50%]",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
))
```

### 3. Barrel Exports Pattern

All components use index.tsx for clean imports:

```typescript
// components/card/index.tsx
export { CardRoot as Root } from './card-root'
export { CardHeader as Header } from './card-header'
export { CardContent as Content } from './card-content'

// Creates namespace import
export * as Card from './index'

// Usage in consuming files
import { Card } from '@/components/card'
```

### 4. Form Component Pattern

Form components integrate React Hook Form with custom field wrappers:

```typescript
// Form field component pattern
interface InputFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  control: Control<any>
  disabled?: boolean
}

export function InputField({
  name,
  label,
  placeholder,
  required,
  control,
  disabled
}: InputFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel required={required}>{label}</FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

### 5. Data Table Pattern

Complex data tables with sorting, filtering, and pagination:

```typescript
// Entity data table pattern
interface EntityDataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  pagination?: PaginationState
  onPaginationChange?: (pagination: PaginationState) => void
  onRowClick?: (row: T) => void
}

export function EntityDataTable<T>({
  data,
  columns,
  loading,
  pagination,
  onPaginationChange,
  onRowClick
}: EntityDataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel()
  })

  if (loading) {
    return <TableSkeleton />
  }

  return (
    <div className="rounded-md border">
      <Table>
        {/* Table implementation */}
      </Table>
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPaginationChange}
        />
      )}
    </div>
  )
}
```

## Styling Patterns

### 1. Tailwind CSS with CVA

Class Variance Authority (CVA) for component variants:

```typescript
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
```

### 2. CN Utility Function

Consistent class name merging:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn(
  "base-classes",
  conditional && "conditional-classes",
  className // Allow override
)} />
```

## Component Documentation

### 1. Storybook Stories

Each component includes Storybook documentation:

```typescript
// button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './index'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered'
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon']
    }
  }
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button'
  }
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
    </div>
  )
}
```

### 2. MDX Documentation

Component documentation in MDX format:

```mdx
# Button Component

The Button component is a versatile UI element that supports multiple variants and sizes.

## Usage

\`\`\`tsx
import { Button } from '@/components/ui/button'

export function MyComponent() {
  return (
    <Button variant="primary" size="lg">
      Click me
    </Button>
  )
}
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'destructive' \| 'outline' | 'default' | Visual style variant |
| size | 'default' \| 'sm' \| 'lg' \| 'icon' | 'default' | Size of the button |
| asChild | boolean | false | Render as child component |
```

## Component State Management

### 1. React Query for Server State

```typescript
// Using React Query for data fetching
export function AccountsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsClient.fetchAll()
  })

  if (isLoading) return <AccountsSkeleton />
  if (error) return <ErrorMessage error={error} />
  
  return <AccountsDataTable data={data} />
}
```

### 2. Custom Hooks Pattern

```typescript
// Custom hook for component logic
export function useAccountSheet() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  const openCreate = useCallback(() => {
    setMode('create')
    setSelectedAccount(null)
    setOpen(true)
  }, [])

  const openEdit = useCallback((account: Account) => {
    setMode('edit')
    setSelectedAccount(account)
    setOpen(true)
  }, [])

  return {
    open,
    mode,
    selectedAccount,
    openCreate,
    openEdit,
    onClose: () => setOpen(false)
  }
}
```

## Accessibility Patterns

### 1. ARIA Labels and Roles

```typescript
<Button
  aria-label="Delete account"
  aria-describedby="delete-warning"
  role="button"
  onClick={handleDelete}
>
  <TrashIcon className="h-4 w-4" />
</Button>
```

### 2. Keyboard Navigation

```typescript
// Keyboard event handling
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()
    handleClick()
  }
  if (event.key === 'Escape') {
    handleClose()
  }
}
```

### 3. Focus Management

```typescript
// Focus trap in modals
export function Modal({ children, open, onClose }) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && modalRef.current) {
      modalRef.current.focus()
    }
  }, [open])

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  )
}
```

## Performance Patterns

### 1. Code Splitting

```typescript
// Lazy loading components
const TransactionDetails = lazy(() => import('./transaction-details'))

function TransactionView() {
  return (
    <Suspense fallback={<TransactionSkeleton />}>
      <TransactionDetails />
    </Suspense>
  )
}
```

### 2. Memoization

```typescript
// Memoizing expensive computations
const MemoizedDataTable = memo(
  DataTable,
  (prevProps, nextProps) => {
    return (
      prevProps.data === nextProps.data &&
      prevProps.columns === nextProps.columns
    )
  }
)
```

### 3. Virtual Scrolling

```typescript
// Virtual scrolling for large lists
import { useVirtualizer } from '@tanstack/react-virtual'

export function VirtualList({ items }) {
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,
    overscan: 5
  })

  return (
    <div ref={parentRef} className="h-[400px] overflow-auto">
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            {items[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  )
}
```

## Testing Patterns

### 1. Component Testing

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByText('Delete')
    expect(button).toHaveClass('bg-destructive')
  })
})
```

### 2. Hook Testing

```typescript
// Hook test example
import { renderHook, act } from '@testing-library/react'
import { usePagination } from './use-pagination'

describe('usePagination', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => usePagination())
    
    expect(result.current.page).toBe(1)
    expect(result.current.pageSize).toBe(10)
  })

  it('updates page', () => {
    const { result } = renderHook(() => usePagination())
    
    act(() => {
      result.current.setPage(2)
    })
    
    expect(result.current.page).toBe(2)
  })
})
```