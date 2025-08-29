# Component Patterns

This document outlines the component architecture and patterns used in the Lerian Console application, based on the actual implementation.

## Component Architecture

### 1. Component Hierarchy

The application follows a clear component hierarchy:

```
src/components/
├── ui/                    # Primitive UI components (Radix-based)
│   ├── alert/
│   ├── autocomplete/
│   ├── autosize-textarea/
│   ├── avatar/
│   ├── badge/
│   ├── breadcrumb/
│   ├── button/
│   ├── card/
│   ├── checkbox/
│   ├── collapsible/
│   ├── combobox/
│   ├── command/
│   ├── dialog/
│   ├── dropdown-menu/
│   ├── input/
│   ├── input-with-icon/
│   ├── label/
│   ├── loading-button/
│   ├── multiple-select/
│   ├── paper/
│   ├── popover/
│   ├── progress/
│   ├── select/
│   ├── separator/
│   ├── sheet/
│   ├── skeleton/
│   ├── stepper/
│   ├── switch/
│   ├── table/
│   ├── tabs/
│   ├── textarea/
│   ├── toast/
│   └── tooltip/
├── form/                  # Form-specific components
│   ├── combo-box-field/
│   ├── country-field/
│   ├── currency-field/
│   ├── input-field/
│   ├── metadata-field/
│   ├── pagination-limit-field/
│   ├── select-field/
│   ├── state-field/
│   ├── switch-field/
│   ├── copyable-input-field/
│   └── password-field/
├── entity-data-table/     # Compound component pattern
├── entity-box/            # Entity display component
├── empty-resource/        # Empty state component
├── confirmation-dialog/   # Dialog component
├── table/                 # Table utilities
│   ├── copyable-table-cell/
│   ├── id-table-cell/
│   ├── locked-table-actions/
│   ├── metadata-table-cell/
│   └── name-table-cell/
├── transactions/          # Transaction-specific components
│   ├── primitives/
│   ├── fee-breakdown-card/
│   ├── raw-transaction-data/
│   └── transaction-flow-display/
├── breadcrumb/
├── card/
├── header/
├── not-found-content/
├── organization-switcher/
├── page/
├── page-footer/
├── page-header/
├── pagination/
└── sheet/
```

### 2. UI Primitives with Storybook Documentation

Base UI components built on Radix UI primitives with comprehensive Storybook documentation:

**Console Pattern**: Every UI component must include:
- Component implementation (`index.tsx`)
- Storybook stories (`.stories.tsx`) 
- Documentation (`.mdx`)

**Required Component Structure**:
```
src/components/ui/button/
├── index.tsx           # Component implementation
├── button.stories.tsx  # Storybook stories
└── button.mdx         # Component documentation
```

```typescript
// src/components/ui/button/index.tsx
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
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
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
```

**Storybook Stories Pattern**:
```typescript
// src/components/ui/button/button.stories.tsx - Console Storybook pattern
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './index'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon']
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Button',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Button',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Button',
  },
}
```

### 3. Form Components with Storybook Integration

Form components integrate with shadcn/ui Form components and React Hook Form, with comprehensive Storybook documentation:

```typescript
// src/components/form/select-field/index.tsx
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormTooltip
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectEmpty,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  MultipleSelect,
  MultipleSelectContent,
  MultipleSelectTrigger,
  MultipleSelectValue
} from '@/components/ui/multiple-select'
import { Control } from 'react-hook-form'
import React, { PropsWithChildren, ReactNode } from 'react'

export type SelectFieldProps = PropsWithChildren & {
  className?: string
  name: string
  label?: ReactNode
  tooltip?: string
  labelExtra?: React.ReactNode
  description?: ReactNode
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  control: Control<any>
  multi?: boolean
  required?: boolean
  onChange?: (value: string | string[]) => void
}

export const SelectField = ({
  className,
  name,
  label,
  tooltip,
  labelExtra,
  required,
  placeholder,
  description,
  disabled,
  readOnly,
  multi,
  control,
  children,
  onChange,
  ...others
}: SelectFieldProps) => {
  const intl = useIntl()

  return (
    <FormField
      name={name}
      control={control}
      {...others}
      render={({ field }) => (
        <FormItem required={required}>
          {label && (
            <FormLabel
              extra={tooltip ? <FormTooltip>{tooltip}</FormTooltip> : labelExtra}
            >
              {label}
            </FormLabel>
          )}

          {multi ? (
            <MultipleSelect
              onValueChange={(value) => {
                field.onChange(value)
                onChange?.(value)
              }}
              disabled={disabled}
              {...field}
            >
              <MultipleSelectTrigger readOnly={readOnly}>
                <MultipleSelectValue placeholder={placeholder} />
              </MultipleSelectTrigger>
              <MultipleSelectContent>{children}</MultipleSelectContent>
            </MultipleSelect>
          ) : (
            <Select
              onValueChange={(value) => {
                field.onChange(value)
                onChange?.(value)
              }}
              value={field.value}
              disabled={disabled}
              open={readOnly ? false : undefined}
              onOpenChange={readOnly ? () => {} : undefined}
            >
              <FormControl>
                <SelectTrigger
                  className={cn(disabled && 'bg-shadcn-100', className)}
                  readOnly={readOnly}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectEmpty>
                  {intl.formatMessage({
                    id: 'common.noOptions',
                    defaultMessage: 'No options found.'
                  })}
                </SelectEmpty>
                {children}
              </SelectContent>
            </Select>
          )}

          <FormMessage />
          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  )
}
```

### 4. Compound Component Pattern - EntityDataTable

The console uses the EntityDataTable compound component pattern for flexible data table composition:

```typescript
// src/components/entity-data-table/index.tsx
import { cn } from '@/lib/utils'
import React, { ReactNode } from 'react'
import { Paper } from '../ui/paper'

function EntityDataTableRoot({
  className,
  ...props
}: React.ComponentProps<typeof Paper>) {
  return <Paper className={className} {...props} />
}

function EntityDataTableFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="data-table-footer"
      className={cn(
        'flex flex-row items-center justify-between px-6 py-3',
        className
      )}
      {...props}
    />
  )
}

function EntityDataTableFooterText({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="data-table-footer-text"
      className={cn('text-shadcn-400 text-sm leading-8 italic', className)}
      {...props}
    />
  )
}

export type EntityDataTableFooterLabelProps = React.PropsWithChildren & {
  label: ReactNode
  empty?: boolean
  emptyLabel?: ReactNode
}

export const EntityDataTable = {
  Root: EntityDataTableRoot,
  Footer: EntityDataTableFooter,
  FooterText: EntityDataTableFooterText
}

// Usage example from actual console codebase
/*
<EntityDataTable.Root>
  <TableContainer>
    <Table>
      // Table content with accounts data
    </Table>
  </TableContainer>
  <EntityDataTable.Footer className="rounded-b-lg border-t border-[#E5E7EB] bg-white px-6 py-3">
    <EntityDataTable.FooterText className="text-sm leading-8 font-medium text-[#A1A1AA] italic">
      {intl.formatMessage({ id: 'accounts.showing', defaultMessage: 'Showing {count} accounts' })}
    </EntityDataTable.FooterText>
  </EntityDataTable.Footer>
</EntityDataTable.Root>
*/
```

**EntityDataTable Storybook Stories**:
```typescript
// src/components/entity-data-table/entity-data-table.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { EntityDataTable } from './index'

const meta: Meta<typeof EntityDataTable.Root> = {
  title: 'Business/EntityDataTable',
  component: EntityDataTable.Root,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const WithData: Story = {
  render: () => (
    <EntityDataTable.Root>
      <div className="p-4">Sample table content</div>
      <EntityDataTable.Footer>
        <EntityDataTable.FooterText>
          Showing 25 accounts
        </EntityDataTable.FooterText>
      </EntityDataTable.Footer>
    </EntityDataTable.Root>
  ),
}
```

## Business Component Patterns

### 1. Confirmation Dialog Pattern

Reusable confirmation dialog component:

```typescript
// src/components/confirmation-dialog/index.tsx
import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface ConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  variant?: 'default' | 'destructive'
  loading?: boolean
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm()
    if (!loading) {
      onOpenChange(false)
    }
  }

  const handleCancel = () => {
    onCancel?.()
    onOpenChange(false)
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={loading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={loading}
            className={variant === 'destructive' ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            {loading ? 'Loading...' : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Usage hook
export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [config, setConfig] = React.useState<Omit<ConfirmationDialogProps, 'open' | 'onOpenChange'>>({
    title: '',
    description: '',
    onConfirm: () => {}
  })

  const confirm = (options: Omit<ConfirmationDialogProps, 'open' | 'onOpenChange'>) => {
    setConfig(options)
    setIsOpen(true)
  }

  const ConfirmDialog = () => (
    <ConfirmationDialog
      {...config}
      open={isOpen}
      onOpenChange={setIsOpen}
    />
  )

  return { confirm, ConfirmDialog }
}
```

### 2. Empty Resource Pattern

Consistent empty state handling:

```typescript
// src/components/empty-resource/index.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface EmptyResourceProps {
  message: string
  description?: string
  buttonText?: string
  onButtonClick?: () => void
  icon?: React.ReactNode
}

export const EmptyResource: React.FC<EmptyResourceProps> = ({
  message,
  description,
  buttonText,
  onButtonClick,
  icon
}) => {
  return (
    <Card className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
      
      <h3 className="text-lg font-medium text-muted-foreground mb-2">
        {message}
      </h3>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          {description}
        </p>
      )}
      
      {buttonText && onButtonClick && (
        <Button onClick={onButtonClick} variant="outline">
          {buttonText}
        </Button>
      )}
    </Card>
  )
}
```

### 3. Entity Box Pattern

Display entity information consistently:

```typescript
// src/components/entity-box/index.tsx
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface EntityBoxProps {
  title: string
  subtitle?: string
  status?: {
    label: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  metadata?: Record<string, string | number>
  actions?: React.ReactNode
  className?: string
  onClick?: () => void
}

export const EntityBox: React.FC<EntityBoxProps> = ({
  title,
  subtitle,
  status,
  metadata,
  actions,
  className,
  onClick
}) => {
  return (
    <Card 
      className={cn(
        'transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/50',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {status && (
              <Badge variant={status.variant || 'default'}>
                {status.label}
              </Badge>
            )}
            {actions}
          </div>
        </div>
      </CardHeader>
      
      {metadata && Object.keys(metadata).length > 0 && (
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className="text-muted-foreground">{key}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
```

## Form Patterns

### 1. Sheet-based Form Pattern

Side panel forms for creating/editing:

```typescript
// src/components/sheet/use-create-update-sheet.tsx
import React from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

interface UseCreateUpdateSheetProps<T> {
  title: {
    create: string
    update: string
  }
  description: {
    create: string
    update: string
  }
}

export const useCreateUpdateSheet = <T extends { id?: string }>({
  title,
  description
}: UseCreateUpdateSheetProps<T>) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [editData, setEditData] = React.useState<T | null>(null)

  const openCreate = () => {
    setEditData(null)
    setIsOpen(true)
  }

  const openUpdate = (data: T) => {
    setEditData(data)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setEditData(null)
  }

  const isUpdateMode = Boolean(editData?.id)

  const Sheet = ({ children }: { children: React.ReactNode }) => (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {isUpdateMode ? title.update : title.create}
          </SheetTitle>
          <SheetDescription>
            {isUpdateMode ? description.update : description.create}
          </SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )

  return {
    isOpen,
    isUpdateMode,
    editData,
    openCreate,
    openUpdate,
    close,
    Sheet
  }
}
```

### 2. Metadata Field Pattern

Dynamic key-value pair input:

```typescript
// src/components/form/metadata-field/index.tsx
import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus } from 'lucide-react'

interface MetadataFieldProps {
  name: string
  label?: string
}

export const MetadataField: React.FC<MetadataFieldProps> = ({
  name,
  label = 'Metadata'
}) => {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({
    control,
    name
  })

  const addField = () => {
    append({ key: '', value: '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addField}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <MetadataInput
            key={field.id}
            index={index}
            name={name}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No metadata fields added yet.
        </p>
      )}
    </div>
  )
}

interface MetadataInputProps {
  index: number
  name: string
  onRemove: () => void
}

const MetadataInput: React.FC<MetadataInputProps> = ({
  index,
  name,
  onRemove
}) => {
  const { register } = useFormContext()

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <Input
          placeholder="Key"
          {...register(`${name}.${index}.key`)}
        />
      </div>
      <div className="flex-1">
        <Input
          placeholder="Value"
          {...register(`${name}.${index}.value`)}
        />
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

## Loading and Error Patterns

### 1. Skeleton Loading Pattern

Consistent loading states:

```typescript
// Page-level skeleton
export const AccountsSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

### 2. Error Boundary Pattern

Global error handling:

```typescript
// src/components/error-boundary.tsx
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-8 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button 
            onClick={() => this.setState({ hasError: false })}
            variant="outline"
          >
            Try again
          </Button>
        </Card>
      )
    }

    return this.props.children
  }
}
```

## Storybook Integration

### 1. Story Structure

Consistent story organization:

```typescript
// src/components/ui/button/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './index'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A customizable button component built on Radix UI.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon']
    },
    asChild: {
      control: { type: 'boolean' }
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

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-2 flex-wrap">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-2 items-center">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
    </div>
  )
}
```

This component architecture provides a solid foundation for building consistent, reusable, and maintainable UI components across the application.
</file>
