# Form Handling Patterns

## Overview

The Midaz Console implements a comprehensive form handling system using React Hook Form with Zod validation, custom form components, and sophisticated state management patterns.

## Core Technologies

- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation and type inference
- **Custom Form Components**: Reusable form field components
- **Form Provider Pattern**: Context-based form state sharing

## Form Architecture

### 1. Schema Definition with Zod

```typescript
// Schema definition (src/schema/account.ts)
import { z } from 'zod'

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Only alphanumeric characters, hyphens, and underscores'),
  
  type: z.enum(['deposit', 'savings', 'loan', 'marketplace']),
  
  currency: z
    .string()
    .length(3, 'Currency code must be 3 characters')
    .toUpperCase(),
  
  balance: z
    .number()
    .min(0, 'Balance cannot be negative')
    .optional(),
  
  metadata: z
    .record(z.string(), z.any())
    .optional(),
  
  status: z
    .object({
      code: z.string(),
      description: z.string().optional()
    })
    .optional()
})

// Type inference from schema
export type CreateAccountInput = z.infer<typeof createAccountSchema>
```

### 2. Form Provider Pattern

```typescript
// Form provider (src/app/(routes)/transactions/create/transaction-form-provider.tsx)
interface TransactionFormContextValue {
  form: UseFormReturn<TransactionFormData>
  mode: 'simple' | 'complex'
  setMode: (mode: 'simple' | 'complex') => void
  accounts: Account[]
  isLoadingAccounts: boolean
  calculateFees: () => Promise<FeeCalculation>
}

const TransactionFormContext = createContext<TransactionFormContextValue | null>(null)

export function TransactionFormProvider({ children }: { children: ReactNode }) {
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      mode: 'simple',
      operations: [{ /* default operation */ }],
      metadata: {}
    }
  })

  const [mode, setMode] = useState<'simple' | 'complex'>('simple')
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts()

  const calculateFees = useCallback(async () => {
    const values = form.getValues()
    return feeService.calculate(values)
  }, [form])

  return (
    <TransactionFormContext.Provider
      value={{
        form,
        mode,
        setMode,
        accounts: accounts || [],
        isLoadingAccounts,
        calculateFees
      }}
    >
      {children}
    </TransactionFormContext.Provider>
  )
}

export function useTransactionForm() {
  const context = useContext(TransactionFormContext)
  if (!context) {
    throw new Error('useTransactionForm must be used within TransactionFormProvider')
  }
  return context
}
```

## Form Components

### 1. Base Form Components

```typescript
// Form root component
export const Form = FormProvider

export const FormField = ({
  ...props
}: ControllerProps<FieldValues, FieldPath<FieldValues>>) => {
  return <Controller {...props} />
}

export const FormItem = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    />
  )
})

export const FormLabel = forwardRef<
  HTMLLabelElement,
  ComponentPropsWithoutRef<typeof Label> & { required?: boolean }
>(({ className, required, children, ...props }, ref) => {
  return (
    <Label
      ref={ref}
      className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive", className)}
      {...props}
    >
      {children}
    </Label>
  )
})

export const FormControl = forwardRef<
  HTMLElement,
  ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        formDescriptionId || formMessageId
          ? `${formDescriptionId} ${formMessageId}`
          : undefined
      }
      {...props}
    />
  )
})

export const FormMessage = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  )
})
```

### 2. Custom Field Components

```typescript
// Input field component (src/components/form/input-field/index.tsx)
interface InputFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  type?: 'text' | 'email' | 'password' | 'number'
  control: Control<any>
}

export function InputField({
  name,
  label,
  placeholder,
  required,
  disabled,
  type = 'text',
  control
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
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              onChange={(e) => {
                const value = type === 'number' 
                  ? e.target.valueAsNumber 
                  : e.target.value
                field.onChange(value)
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

### 3. Select Field Component

```typescript
// Select field component (src/components/form/select-field/index.tsx)
interface SelectFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  control: Control<any>
  options: Array<{ label: string; value: string }>
}

export function SelectField({
  name,
  label,
  placeholder = 'Select an option',
  required,
  disabled,
  control,
  options
}: SelectFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel required={required}>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
```

### 4. Metadata Field Component

```typescript
// Metadata field component (src/components/form/metadata-field/index.tsx)
interface MetadataFieldProps {
  name: string
  label?: string
  control: Control<any>
}

export function MetadataField({ name, label = 'Metadata', control }: MetadataFieldProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <FormLabel>{label}</FormLabel>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ key: '', value: '' })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Metadata
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-2">
          <FormField
            control={control}
            name={`${name}.${index}.key`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Key" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name={`${name}.${index}.value`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input placeholder="Value" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
```

## Form Patterns

### 1. Multi-Step Form with Stepper

```typescript
// Multi-step form (src/app/(routes)/onboarding/create/page.tsx)
export function OnboardingForm() {
  const [step, setStep] = useState(0)
  const form = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      organization: {},
      ledger: {},
      theme: {}
    }
  })

  const steps = [
    { title: 'Organization Details', component: <OnboardDetail /> },
    { title: 'Address Information', component: <OnboardAddress /> },
    { title: 'Theme Selection', component: <OnboardTheme /> }
  ]

  const handleNext = async () => {
    const fields = getFieldsForStep(step)
    const isValid = await form.trigger(fields)
    
    if (isValid) {
      setStep(step + 1)
    }
  }

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await createOnboarding(data)
      router.push('/onboarding/success')
    } catch (error) {
      toast.error('Failed to complete onboarding')
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <Stepper activeStep={step} steps={steps.map(s => s.title)} />
        
        <div className="mt-8">
          {steps[step].component}
        </div>

        <div className="flex justify-between mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
          >
            Previous
          </Button>

          {step < steps.length - 1 ? (
            <Button type="button" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button type="submit">
              Complete
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
```

### 2. Dynamic Form Fields

```typescript
// Dynamic form fields based on selection
export function TransactionForm() {
  const form = useForm<TransactionFormData>()
  const transactionType = form.watch('type')

  return (
    <Form {...form}>
      <SelectField
        name="type"
        label="Transaction Type"
        control={form.control}
        options={[
          { label: 'Transfer', value: 'transfer' },
          { label: 'Deposit', value: 'deposit' },
          { label: 'Withdrawal', value: 'withdrawal' }
        ]}
      />

      {transactionType === 'transfer' && (
        <>
          <InputField
            name="sourceAccount"
            label="Source Account"
            control={form.control}
            required
          />
          <InputField
            name="destinationAccount"
            label="Destination Account"
            control={form.control}
            required
          />
        </>
      )}

      {transactionType === 'deposit' && (
        <InputField
          name="destinationAccount"
          label="Account"
          control={form.control}
          required
        />
      )}

      {transactionType === 'withdrawal' && (
        <InputField
          name="sourceAccount"
          label="Account"
          control={form.control}
          required
        />
      )}

      <InputField
        name="amount"
        label="Amount"
        type="number"
        control={form.control}
        required
      />
    </Form>
  )
}
```

### 3. Form with Real-time Validation

```typescript
// Real-time validation
export function AccountForm() {
  const form = useForm({
    resolver: zodResolver(accountSchema),
    mode: 'onChange', // Enable real-time validation
    reValidateMode: 'onChange'
  })

  const nameValue = form.watch('name')
  const { data: isNameAvailable } = useQuery({
    queryKey: ['checkAccountName', nameValue],
    queryFn: () => checkAccountNameAvailability(nameValue),
    enabled: nameValue?.length >= 3,
    debounce: 500
  })

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Account Name</FormLabel>
            <FormControl>
              <div className="relative">
                <Input {...field} />
                {isNameAvailable !== undefined && (
                  <div className="absolute right-2 top-2">
                    {isNameAvailable ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
            {isNameAvailable === false && (
              <p className="text-sm text-destructive">
                This name is already taken
              </p>
            )}
          </FormItem>
        )}
      />
    </Form>
  )
}
```

## Form Validation Patterns

### 1. Custom Validation Rules

```typescript
// Custom validation with Zod
const customValidationSchema = z.object({
  email: z
    .string()
    .email()
    .refine(async (email) => {
      const exists = await checkEmailExists(email)
      return !exists
    }, 'Email already exists'),

  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number')
    .regex(/[^A-Za-z0-9]/, 'Must contain special character'),

  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
})
```

### 2. Cross-field Validation

```typescript
// Cross-field validation
const transactionSchema = z.object({
  sourceAccount: z.string(),
  destinationAccount: z.string(),
  amount: z.number().positive(),
  sourceBalance: z.number()
}).refine((data) => {
  return data.sourceAccount !== data.destinationAccount
}, {
  message: 'Source and destination accounts must be different',
  path: ['destinationAccount']
}).refine((data) => {
  return data.amount <= data.sourceBalance
}, {
  message: 'Insufficient balance',
  path: ['amount']
})
```

### 3. Async Validation

```typescript
// Async validation
const organizationSchema = z.object({
  name: z.string().min(3),
  domain: z.string()
}).superRefine(async (data, ctx) => {
  const isAvailable = await checkDomainAvailability(data.domain)
  if (!isAvailable) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Domain is not available',
      path: ['domain']
    })
  }
})
```

## Form State Management

### 1. Form Persistence

```typescript
// Persist form state to localStorage
export function useFormPersistence<T>(key: string, form: UseFormReturn<T>) {
  useEffect(() => {
    const saved = localStorage.getItem(key)
    if (saved) {
      const data = JSON.parse(saved)
      form.reset(data)
    }
  }, [])

  useEffect(() => {
    const subscription = form.watch((data) => {
      localStorage.setItem(key, JSON.stringify(data))
    })
    return () => subscription.unsubscribe()
  }, [form, key])
}
```

### 2. Form Reset with Confirmation

```typescript
// Form reset with confirmation dialog
export function FormActions({ form }: { form: UseFormReturn }) {
  const { confirm } = useConfirmDialog()

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset Form',
      description: 'Are you sure you want to reset the form? All changes will be lost.',
      confirmText: 'Reset',
      variant: 'destructive'
    })

    if (confirmed) {
      form.reset()
      toast.info('Form has been reset')
    }
  }

  return (
    <div className="flex gap-4">
      <Button type="button" variant="outline" onClick={handleReset}>
        Reset
      </Button>
      <Button type="submit">Submit</Button>
    </div>
  )
}
```

### 3. Form Submission with Loading State

```typescript
// Form submission pattern
export function CreateAccountForm() {
  const form = useForm<CreateAccountInput>({
    resolver: zodResolver(createAccountSchema)
  })
  
  const createAccount = useCreateAccount()

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      await createAccount.mutateAsync(data)
      form.reset()
      router.push('/accounts')
    } catch (error) {
      // Error handled by mutation
    }
  })

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Form fields */}
        
        <LoadingButton
          type="submit"
          loading={createAccount.isPending}
          disabled={!form.formState.isValid}
        >
          Create Account
        </LoadingButton>
      </form>
    </Form>
  )
}
```

## Advanced Form Patterns

### 1. Conditional Form Sections

```typescript
// Conditional form sections
export function AdvancedSettingsForm() {
  const form = useForm()
  const [showAdvanced, setShowAdvanced] = useState(false)
  const enableFeature = form.watch('enableFeature')

  return (
    <Form {...form}>
      <SwitchField
        name="enableFeature"
        label="Enable Advanced Feature"
        control={form.control}
      />

      {enableFeature && (
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger className="flex items-center gap-2">
            <ChevronRight 
              className={cn(
                "h-4 w-4 transition-transform",
                showAdvanced && "rotate-90"
              )}
            />
            Advanced Settings
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <InputField
              name="threshold"
              label="Threshold"
              type="number"
              control={form.control}
            />
            <SelectField
              name="mode"
              label="Mode"
              control={form.control}
              options={[
                { label: 'Auto', value: 'auto' },
                { label: 'Manual', value: 'manual' }
              ]}
            />
          </CollapsibleContent>
        </Collapsible>
      )}
    </Form>
  )
}
```

### 2. Form Array Pattern

```typescript
// Dynamic form arrays
export function OperationsForm() {
  const form = useForm({
    defaultValues: {
      operations: [{ type: '', amount: 0, account: '' }]
    }
  })

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: 'operations'
  })

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Operation {index + 1}</CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => move(index, Math.min(fields.length - 1, index + 1))}
                  disabled={index === fields.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SelectField
              name={`operations.${index}.type`}
              label="Type"
              control={form.control}
              options={operationTypes}
            />
            <InputField
              name={`operations.${index}.amount`}
              label="Amount"
              type="number"
              control={form.control}
            />
            <InputField
              name={`operations.${index}.account`}
              label="Account"
              control={form.control}
            />
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => append({ type: '', amount: 0, account: '' })}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Operation
      </Button>
    </div>
  )
}
```