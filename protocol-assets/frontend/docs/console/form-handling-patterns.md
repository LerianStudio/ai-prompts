# Form Handling Patterns

This document outlines the form handling patterns used in the Lerian Console application, based on the actual implementation.

## Form Architecture

### 1. Shadcn/UI Form Integration with React Hook Form

The application uses React Hook Form with Shadcn/UI Form components and Zod validation:

```typescript
// Console form implementation pattern from the codebase
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { LoadingButton } from '@/components/ui/loading-button'
import { InputField } from '@/components/form/input-field'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import z from 'zod'

// Form schema definition - Console pattern (matches actual implementation)
const FormSchema = z.object({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email
})

export type CreateUserFormData = z.infer<typeof FormSchema>

const initialValues: CreateUserFormData = {
  firstName: '',
  lastName: '',
  email: ''
}

export function CreateUserForm({ onSuccess, onOpenChange }: CreateUserFormProps) {
  // Initialize form with Zod resolver
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues
  })

  // React Query mutation
  const createUserMutation = useCreateUser({
    onSuccess: () => {
      form.reset()
      onOpenChange?.(false)
      onSuccess?.()
    }
  })

  // Form submission handler
  const handleSubmit = async (values: CreateUserFormData) => {
    await createUserMutation.mutateAsync(values)
  }

  const isLoading = createUserMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <InputField
          name="firstName"
          label="First Name"
          control={form.control}
          disabled={isLoading}
        />
        
        <InputField
          name="lastName" 
          label="Last Name"
          control={form.control}
          disabled={isLoading}
        />
        
        <InputField
          name="email"
          label="Email"
          type="email"
          control={form.control}
          disabled={isLoading}
        />

        <LoadingButton
          type="submit"
          loading={isLoading}
        >
          Create User
        </LoadingButton>
      </form>
    </Form>
  )
}
```

### 2. React Hook Form with API Integration Pattern

The actual implementation integrates React Hook Form directly with API mutations and React Query:

```typescript
// Console pattern: Direct form integration with API mutations
export function CreateUserForm({ onSuccess, onOpenChange }: CreateUserFormProps) {
  // Form setup with initial values
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues
  })

  // API mutation with React Query
  const createUserMutation = useCreateUser({
    onSuccess: () => {
      form.reset()  // Reset form on success
      onOpenChange?.(false)
      onSuccess?.()
      toast({
        title: intl.formatMessage({
          id: 'users.create.success',
          defaultMessage: 'User created successfully'
        }),
        variant: 'success'
      })
    }
  })

  // Direct submission to API
  const handleSubmit = async (values: CreateUserFormData) => {
    const payload: CreateUserDto = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email
    }

    await createUserMutation.mutateAsync(payload)
  }

  const isLoading = createUserMutation.isPending

  return (
    <Form {...form}>
      {/* Form content */}
      <LoadingButton
        type="submit"
        loading={isLoading}
        onClick={form.handleSubmit(handleSubmit)}
      >
        Create User
      </LoadingButton>
    </Form>
  )
}
```

### 3. Dynamic Field Arrays Pattern

The application uses field arrays for dynamic form sections like filters:

```typescript
// Console pattern: Dynamic field arrays with useFieldArray for transactions
export function TransactionForm() {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: initialValues
  })

  // Initialize field array for dynamic transaction sources
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'source'
  })

  // Handle adding new source
  const handleAddSource = () => {
    append({
      accountAlias: '',
      value: '',
      description: ''
    })
  }

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Transaction Sources</h3>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={handleAddSource}
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>

        {/* Dynamic Source Sections */}
        <div className="space-y-4">
          {fields.map((field, index) => (
            <Card key={field.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-4">
                  <InputField
                    name={`source.${index}.accountAlias`}
                    label="Account"
                    control={form.control}
                    disabled={isLoading}
                  />
                  <InputField
                    name={`source.${index}.value`}
                    label="Amount"
                    type="number"
                    control={form.control}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Form>
  )
}
```

## Validation Patterns

### 1. Zod Schema with Modular Design

Form validation schemas are organized in a modular way:

```typescript
// src/schema/user.ts - Console schema pattern from codebase
import { z } from 'zod'

// Modular schema building - Console pattern
export const user = {
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format')
}

// Organization schema - Console uses modular composition
export const organization = {
  legalName: z.string().min(1, 'Legal name is required'),
  doingBusinessAs: z.string().min(1, 'Trade name is required'),
  legalDocument: z.string().min(1, 'Document is required'),
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required'),
    line2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
    country: z.string().min(1, 'Country is required')
  }),
  accentColor: z.string().optional(),
  avatar: z.string().optional()
}

// Form schema composition - Console pattern
export const detailFormSchema = z.object({
  legalName: organization.legalName,
  doingBusinessAs: organization.doingBusinessAs,
  legalDocument: organization.legalDocument
})

export type DetailFormData = z.infer<typeof detailFormSchema>

// Usage in form component
export function OrganizationForm() {
  const form = useForm<DetailFormData>({
    resolver: zodResolver(detailFormSchema),
    defaultValues: initialValues
  })

  // Form submission with data transformation
  const handleSubmit = async (values: DetailFormData) => {
    const payload: CreateOrganizationDto = {
      legalName: values.legalName,
      doingBusinessAs: values.doingBusinessAs,
      legalDocument: values.legalDocument
    }

    await createOrganizationMutation.mutateAsync(payload)
  }
}
```

### 2. Custom Validation Rules

Custom validation logic for specific business rules:

```typescript
// src/lib/form/validation-rules.ts
import { z } from 'zod'

// Custom regex patterns
export const PATTERNS = {
  ASSET_CODE: /^[A-Z]{3,10}$/,
  CURRENCY_CODE: /^[A-Z]{3}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]+$/
} as const

// Custom validation functions
export const createCustomValidation = {
  assetCode: (value: string) => {
    if (!PATTERNS.ASSET_CODE.test(value)) {
      return 'Asset code must be uppercase letters only (3-10 characters)'
    }
    return true
  },

  currencyCode: (value: string) => {
    if (!PATTERNS.CURRENCY_CODE.test(value)) {
      return 'Currency code must be exactly 3 uppercase letters'
    }
    return true
  },

  positiveNumber: (value: number) => {
    if (value <= 0) {
      return 'Value must be greater than 0'
    }
    return true
  }
}

// Enhanced schema with custom validations
export const enhancedAccountSchema = createAccountSchema.extend({
  assetCode: z
    .string()
    .min(1, 'Asset code is required')
    .refine(createCustomValidation.assetCode, {
      message: 'Asset code must be uppercase letters only (3-10 characters)'
    })
})
```

## Metadata Field Pattern

### 1. Dynamic Key-Value Pairs

Dynamic metadata input using field arrays:

```typescript
// src/components/form/metadata-field/index.tsx
import React from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'

interface MetadataFieldProps {
  name: string
  label?: string
  helperText?: string
}

export const MetadataField: React.FC<MetadataFieldProps> = ({
  name,
  label = 'Metadata',
  helperText = 'Add key-value pairs for additional information'
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
        <div>
          <Label>{label}</Label>
          {helperText && (
            <p className="text-sm text-muted-foreground">{helperText}</p>
          )}
        </div>
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
        <Card>
          <CardContent className="py-6 text-center text-muted-foreground">
            No metadata fields added yet.
          </CardContent>
        </Card>
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
  const { register, formState: { errors } } = useFormContext()
  const keyError = errors[`${name}.${index}.key`]?.message as string
  const valueError = errors[`${name}.${index}.value`]?.message as string

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3 items-start">
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Key"
              {...register(`${name}.${index}.key`)}
              className={keyError ? 'border-destructive' : ''}
            />
            {keyError && (
              <p className="text-sm text-destructive">{keyError}</p>
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <Input
              placeholder="Value"
              {...register(`${name}.${index}.value`)}
              className={valueError ? 'border-destructive' : ''}
            />
            {valueError && (
              <p className="text-sm text-destructive">{valueError}</p>
            )}
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
      </CardContent>
    </Card>
  )
}
```

## Specialized Form Components

### 1. Country Selection Field

Country selection with search functionality:

```typescript
// src/components/form/country-field/index.tsx
import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface CountryOption {
  code: string
  name: string
}

interface CountryFieldProps {
  name: string
  label?: string
  placeholder?: string
  required?: boolean
  countries: CountryOption[]
}

export const CountryField: React.FC<CountryFieldProps> = ({
  name,
  label = 'Country',
  placeholder = 'Select a country',
  required,
  countries
}) => {
  const {
    setValue,
    watch,
    formState: { errors }
  } = useFormContext()
  
  const value = watch(name)
  const error = errors[name]?.message as string | undefined

  const handleValueChange = (selectedValue: string) => {
    setValue(name, selectedValue, { shouldValidate: true })
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className={required ? 'required' : ''}>
          {label}
        </Label>
      )}
      
      <Select value={value || ''} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
```

### 2. Currency Field

Currency input with formatting:

```typescript
// src/components/form/currency-field/index.tsx
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CurrencyOption {
  code: string
  symbol: string
  name: string
}

interface CurrencyFieldProps {
  amountName: string
  currencyName: string
  label?: string
  required?: boolean
  currencies: CurrencyOption[]
}

export const CurrencyField: React.FC<CurrencyFieldProps> = ({
  amountName,
  currencyName,
  label = 'Amount',
  required,
  currencies
}) => {
  const {
    register,
    setValue,
    watch,
    formState: { errors }
  } = useFormContext()
  
  const currencyValue = watch(currencyName)
  const amountError = errors[amountName]?.message as string | undefined
  const currencyError = errors[currencyName]?.message as string | undefined

  const selectedCurrency = currencies.find(c => c.code === currencyValue)

  const handleCurrencyChange = (value: string) => {
    setValue(currencyName, value, { shouldValidate: true })
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label className={required ? 'required' : ''}>
          {label}
        </Label>
      )}
      
      <div className="flex gap-2">
        <div className="flex-1">
          <div className="relative">
            {selectedCurrency && (
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                {selectedCurrency.symbol}
              </span>
            )}
            <Input
              type="number"
              step="0.01"
              {...register(amountName, { valueAsNumber: true })}
              className={`${selectedCurrency ? 'pl-8' : ''} ${amountError ? 'border-destructive' : ''}`}
              placeholder="0.00"
            />
          </div>
          {amountError && (
            <p className="text-sm text-destructive mt-1">{amountError}</p>
          )}
        </div>
        
        <div className="w-32">
          <Select value={currencyValue || ''} onValueChange={handleCurrencyChange}>
            <SelectTrigger className={currencyError ? 'border-destructive' : ''}>
              <SelectValue placeholder="USD" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((currency) => (
                <SelectItem key={currency.code} value={currency.code}>
                  {currency.code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currencyError && (
            <p className="text-sm text-destructive mt-1">{currencyError}</p>
          )}
        </div>
      </div>
    </div>
  )
}
```

## Form State Management

### 1. Custom Form Error Hook

Enhanced error handling for forms:

```typescript
// src/hooks/use-custom-form-error.ts
import { useFormContext } from 'react-hook-form'

export const useCustomFormError = () => {
  const { formState: { errors } } = useFormContext()

  const getError = (fieldName: string): string | undefined => {
    const error = errors[fieldName]
    if (typeof error?.message === 'string') {
      return error.message
    }
    return undefined
  }

  const hasError = (fieldName: string): boolean => {
    return Boolean(errors[fieldName])
  }

  const getFieldErrors = (fieldName: string): Record<string, string> => {
    const fieldError = errors[fieldName]
    if (fieldError && typeof fieldError === 'object') {
      const result: Record<string, string> = {}
      Object.entries(fieldError).forEach(([key, value]) => {
        if (typeof value?.message === 'string') {
          result[key] = value.message
        }
      })
      return result
    }
    return {}
  }

  const hasAnyErrors = (): boolean => {
    return Object.keys(errors).length > 0
  }

  return {
    getError,
    hasError,
    getFieldErrors,
    hasAnyErrors,
    errors
  }
}
```

### 2. Form Initial Values Helper

Utility for setting initial form values:

```typescript
// src/lib/form/get-initial-values.ts
export const getInitialValues = <T extends Record<string, any>>(
  data?: Partial<T>,
  defaults?: Partial<T>
): Partial<T> => {
  const result = { ...defaults }
  
  if (data) {
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        result[key as keyof T] = value
      }
    })
  }

  return result
}

// Usage example
const initialValues = getInitialValues(editingAccount, {
  type: 'deposit',
  allowSending: true,
  allowReceiving: true,
  metadata: []
})
```

## Form Submission Patterns

### 1. Async Form Submission

Handle async operations in form submission:

```typescript
// Form submission with error handling
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from '@/components/ui/use-toast'

interface UseFormSubmissionProps<T> {
  onSubmit: (data: T) => Promise<void>
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const useFormSubmission = <T>({
  onSubmit,
  onSuccess,
  onError
}: UseFormSubmissionProps<T>) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (data: T) => {
    setIsSubmitting(true)
    
    try {
      await onSubmit(data)
      
      toast({
        title: 'Success',
        description: 'Form submitted successfully'
      })
      
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred'
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      })
      
      onError?.(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    handleSubmit,
    isSubmitting
  }
}
```

### 2. Form Reset and Navigation

Reset form state and handle navigation:

```typescript
// Form navigation and reset utilities
import { useFormContext } from 'react-hook-form'
import { useRouter } from 'next/navigation'

export const useFormNavigation = () => {
  const { reset, formState: { isDirty } } = useFormContext()
  const router = useRouter()

  const resetForm = (values?: Record<string, any>) => {
    reset(values)
  }

  const navigateWithConfirmation = (path: string) => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      )
      if (!confirmed) return
    }
    
    router.push(path)
  }

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        'Are you sure you want to cancel? All changes will be lost.'
      )
      if (!confirmed) return
    }
    
    router.back()
  }

  return {
    resetForm,
    navigateWithConfirmation,
    handleCancel,
    isDirty
  }
}
```

## Complete Form Example

### 1. Account Creation Form

Complete form implementation:

```typescript
// src/components/forms/account-form.tsx
import React from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InputField } from '@/components/form/input-field'
import { SelectField } from '@/components/form/select-field'
import { MetadataField } from '@/components/form/metadata-field'
import { createAccountSchema, CreateAccountFormData } from '@/schema/account'
import { useFormSubmission } from '@/hooks/use-form-submission'

interface AccountFormProps {
  initialData?: Partial<CreateAccountFormData>
  onSubmit: (data: CreateAccountFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

const ACCOUNT_TYPES = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'savings', label: 'Savings' },
  { value: 'creditCard', label: 'Credit Card' },
  { value: 'loans', label: 'Loans' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'external', label: 'External' }
]

export const AccountForm: React.FC<AccountFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const methods = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      type: 'deposit',
      metadata: [],
      ...initialData
    },
    mode: 'onChange'
  })

  const { handleSubmit: handleFormSubmit, isSubmitting } = useFormSubmission({
    onSubmit,
    onSuccess: () => {
      methods.reset()
    }
  })

  const isFormLoading = isLoading || isSubmitting

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleFormSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputField
              name="name"
              label="Account Name"
              placeholder="Enter account name"
              required
            />
            
            <InputField
              name="alias"
              label="Account Alias"
              placeholder="Enter account alias (optional)"
            />
            
            <InputField
              name="assetCode"
              label="Asset Code"
              placeholder="e.g., USD, BTC"
              required
              helperText="3-10 uppercase letters only"
            />
            
            <SelectField
              name="type"
              label="Account Type"
              options={ACCOUNT_TYPES}
              required
            />
            
            <InputField
              name="entityId"
              label="Entity ID"
              placeholder="Enter entity identifier (optional)"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <MetadataField
              name="metadata"
              helperText="Add additional key-value pairs for this account"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isFormLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isFormLoading}
          >
            {isFormLoading ? 'Creating...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
```

This form handling approach provides a robust, type-safe, and user-friendly foundation for all form interactions in the application.
</file>
