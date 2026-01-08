# Enterprise shadcn/ui Components

Production-ready enterprise components built with shadcn/ui, Radix UI, and best practices.

## 🎯 Components

### Command Palette (`command.tsx`)
Advanced command palette with fuzzy search, keyboard shortcuts, and accessibility.

```tsx
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/shadcn/command"

// Basic command palette
<Command>
  <CommandInput placeholder="Type a command or search..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Suggestions">
      <CommandItem>
        <Calendar className="mr-2 h-4 w-4" />
        <span>Calendar</span>
      </CommandItem>
      <CommandItem>
        <User className="mr-2 h-4 w-4" />
        <span>Search Users</span>
        <CommandShortcut>⌘U</CommandShortcut>
      </CommandItem>
    </CommandGroup>
    <CommandSeparator />
    <CommandGroup heading="Settings">
      <CommandItem>
        <Settings className="mr-2 h-4 w-4" />
        <span>Settings</span>
        <CommandShortcut>⌘S</CommandShortcut>
      </CommandItem>
    </CommandGroup>
  </CommandList>
</Command>

// Command dialog (with keyboard shortcut)
const [open, setOpen] = React.useState(false)

React.useEffect(() => {
  const down = (e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setOpen((open) => !open)
    }
  }
  document.addEventListener("keydown", down)
  return () => document.removeEventListener("keydown", down)
}, [])

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Type a command..." />
  <CommandList>
    <CommandEmpty>No results found.</CommandEmpty>
    <CommandGroup heading="Actions">
      <CommandItem onSelect={() => console.log("New case")}>
        Create new case
      </CommandItem>
    </CommandGroup>
  </CommandList>
</CommandDialog>
```

### Calendar (`calendar.tsx`)
Enterprise date picker with range selection, disabled dates, and internationalization.

```tsx
import { Calendar } from "@/components/ui/shadcn/calendar"

// Single date selection
const [date, setDate] = React.useState<Date | undefined>(new Date())

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="rounded-md border"
/>

// Date range selection
const [dateRange, setDateRange] = React.useState<DateRange | undefined>()

<Calendar
  mode="range"
  selected={dateRange}
  onSelect={setDateRange}
  numberOfMonths={2}
  className="rounded-md border"
/>

// Multiple date selection
const [dates, setDates] = React.useState<Date[] | undefined>([])

<Calendar
  mode="multiple"
  selected={dates}
  onSelect={setDates}
  className="rounded-md border"
/>

// With disabled dates
<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={(date) => date < new Date()}
  className="rounded-md border"
/>
```

### Date Picker (`date-picker.tsx`)
Complete date picker with popover and calendar integration.

```tsx
import { DatePicker, DateRangePicker } from "@/components/ui/shadcn/date-picker"

// Single date picker
const [date, setDate] = React.useState<Date>()

<DatePicker
  date={date}
  onSelect={setDate}
  placeholder="Pick a date"
  dateFormat="MM/dd/yyyy"
  fromDate={new Date()}
/>

// Date range picker
const [range, setRange] = React.useState<{from: Date | undefined; to?: Date | undefined}>()

<DateRangePicker
  dateRange={range}
  onSelect={setRange}
  placeholder="Select date range"
/>

// With constraints
<DatePicker
  date={date}
  onSelect={setDate}
  placeholder="Select deadline"
  fromDate={new Date()}
  toDate={new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}
  disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
/>
```

### Breadcrumb (`breadcrumb.tsx`)
Navigation breadcrumb with ellipsis for long paths.

```tsx
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/shadcn/breadcrumb"

// Basic breadcrumb
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/cases">Cases</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Case Details</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

// With ellipsis for long paths
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink href="/">Home</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbEllipsis />
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbLink href="/cases/123">Case #123</BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Documents</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

// With Next.js Link
import Link from "next/link"

<BreadcrumbItem>
  <BreadcrumbLink asChild>
    <Link href="/cases">Cases</Link>
  </BreadcrumbLink>
</BreadcrumbItem>
```

### Pagination (`pagination.tsx`)
Table pagination with page numbers and navigation.

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/shadcn/pagination"

// Basic pagination
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="#" />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#" isActive>1</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">2</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">3</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink href="#">10</PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationNext href="#" />
    </PaginationItem>
  </PaginationContent>
</Pagination>

// Controlled pagination
const [currentPage, setCurrentPage] = React.useState(1)
const totalPages = 10

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious
        href="#"
        onClick={(e) => {
          e.preventDefault()
          setCurrentPage(Math.max(1, currentPage - 1))
        }}
      />
    </PaginationItem>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <PaginationItem key={page}>
        <PaginationLink
          href="#"
          isActive={currentPage === page}
          onClick={(e) => {
            e.preventDefault()
            setCurrentPage(page)
          }}
        >
          {page}
        </PaginationLink>
      </PaginationItem>
    ))}
    <PaginationItem>
      <PaginationNext
        href="#"
        onClick={(e) => {
          e.preventDefault()
          setCurrentPage(Math.min(totalPages, currentPage + 1))
        }}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

### Sonner Toast (`sonner.tsx`)
Advanced toast notifications with promise support and rich content.

```tsx
// 1. Add Toaster to your root layout
import { Toaster } from "@/components/ui/shadcn/sonner"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}

// 2. Use toast in your components
import { toast } from "sonner"

// Simple toast
toast("Event has been created")

// Success toast
toast.success("Case saved successfully")

// Error toast
toast.error("Failed to save document")

// Promise toast (for async operations)
toast.promise(
  fetch("/api/cases").then(res => res.json()),
  {
    loading: "Loading cases...",
    success: "Cases loaded successfully",
    error: "Failed to load cases",
  }
)

// Toast with action button
toast("Case archived", {
  action: {
    label: "Undo",
    onClick: () => console.log("Undo"),
  },
})

// Custom JSX content
toast.custom((t) => (
  <div className="bg-white p-4 rounded-lg shadow-lg">
    <h3 className="font-semibold">Custom Toast</h3>
    <p className="text-sm text-muted-foreground">With custom content</p>
    <button onClick={() => toast.dismiss(t)}>Dismiss</button>
  </div>
))

// With duration
toast("This will auto-dismiss", { duration: 5000 })

// Persistent toast
toast("This stays until dismissed", { duration: Infinity })
```

### Drawer (`drawer.tsx`)
Mobile-first bottom drawer with gesture support.

```tsx
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/shadcn/drawer"

// Basic drawer
<Drawer>
  <DrawerTrigger asChild>
    <Button variant="outline">Open Drawer</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Drawer Title</DrawerTitle>
      <DrawerDescription>
        This is a drawer description
      </DrawerDescription>
    </DrawerHeader>
    <div className="p-4">
      <p>Drawer content goes here</p>
    </div>
    <DrawerFooter>
      <Button>Submit</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>

// Controlled drawer
const [open, setOpen] = React.useState(false)

<Drawer open={open} onOpenChange={setOpen}>
  <DrawerTrigger asChild>
    <Button variant="outline">Open</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Are you sure?</DrawerTitle>
      <DrawerDescription>This action cannot be undone.</DrawerDescription>
    </DrawerHeader>
    <DrawerFooter>
      <Button onClick={() => setOpen(false)}>Confirm</Button>
      <DrawerClose asChild>
        <Button variant="outline">Cancel</Button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>

// Responsive: Drawer on mobile, Dialog on desktop
import { useMobile } from "@/hooks/use-mobile"

function ResponsiveComponent() {
  const isMobile = useMobile()
  const [open, setOpen] = React.useState(false)

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button>Open</Button>
        </DrawerTrigger>
        <DrawerContent>{/* content */}</DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open</Button>
      </DialogTrigger>
      <DialogContent>{/* content */}</DialogContent>
    </Dialog>
  )
}
```

### Input OTP (`input-otp.tsx`)
One-time password input with auto-focus and paste support.

```tsx
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/shadcn/input-otp"

// Basic 6-digit OTP
const [value, setValue] = React.useState("")

<InputOTP maxLength={6} value={value} onChange={setValue}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>

// With separator (123-456)
<InputOTP maxLength={6}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
  </InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>

// Pattern validation (numbers only)
import { REGEXP_ONLY_DIGITS } from "input-otp"

<InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS}>
  <InputOTPGroup>
    <InputOTPSlot index={0} />
    <InputOTPSlot index={1} />
    <InputOTPSlot index={2} />
    <InputOTPSlot index={3} />
    <InputOTPSlot index={4} />
    <InputOTPSlot index={5} />
  </InputOTPGroup>
</InputOTP>

// Form integration
<form onSubmit={(e) => {
  e.preventDefault()
  console.log(value)
}}>
  <InputOTP maxLength={6} value={value} onChange={setValue}>
    <InputOTPGroup>
      <InputOTPSlot index={0} />
      <InputOTPSlot index={1} />
      <InputOTPSlot index={2} />
      <InputOTPSlot index={3} />
      <InputOTPSlot index={4} />
      <InputOTPSlot index={5} />
    </InputOTPGroup>
  </InputOTP>
  <Button type="submit">Verify</Button>
</form>
```

## 🎣 Hooks

### `useMobile()`
Detect mobile viewport for responsive behavior.

```tsx
import { useMobile } from "@/hooks/use-mobile"

function MyComponent() {
  const isMobile = useMobile()

  return (
    <div>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}
    </div>
  )
}
```

### `useToast()`
Programmatic toast management.

```tsx
import { useToast } from "@/hooks/use-toast"

function MyComponent() {
  const { toast, success, error, promise } = useToast()

  return (
    <Button onClick={() => success("Saved successfully!")}>
      Save
    </Button>
  )
}
```

## 🎨 Styling

All components use:
- Tailwind CSS for styling
- CSS variables for theming
- Dark mode support
- OKLCH color space for perceptual uniformity
- Accessible color contrast ratios

## 📦 Dependencies

- `cmdk` - Command palette
- `react-day-picker` - Calendar
- `sonner` - Toast notifications
- `vaul` - Drawer
- `input-otp` - OTP input
- `@radix-ui/*` - Accessible primitives
- `date-fns` - Date formatting
- `lucide-react` - Icons

## ♿ Accessibility

All components include:
- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support
- High contrast mode support

## 🚀 Performance

Components are optimized for:
- Tree-shaking
- Code splitting
- Minimal re-renders
- Efficient event handlers
- Lazy loading where appropriate

## 📝 License

These components follow the shadcn/ui license (MIT).

---

# Form Components

Enterprise-grade form components with full TypeScript support, react-hook-form integration, and Zod validation.

## Form Components Overview

### Input (`input.tsx`)
Enhanced text input with size variants, error states, and full width support.

```tsx
import { Input } from "@/components/ui/shadcn"

<Input
  inputSize="md"           // "sm" | "md" | "lg"
  error={false}           // Error state styling
  fullWidth={false}       // Full width
  placeholder="Enter text"
  disabled={false}
/>
```

### Textarea (`textarea.tsx`)
Multi-line text input with auto-resize capability.

```tsx
import { Textarea } from "@/components/ui/shadcn"

<Textarea
  textareaSize="md"       // "sm" | "md" | "lg"
  error={false}
  autoResize={false}      // Auto-resize to content
  fullWidth={false}
  placeholder="Enter description..."
/>
```

### Label (`label.tsx`)
Form label with required indicator and variants.

```tsx
import { Label } from "@/components/ui/shadcn"

<Label
  variant="default"       // "default" | "muted" | "error"
  size="md"              // "sm" | "md" | "lg"
  required={true}        // Shows red asterisk
>
  Field Label
</Label>
```

### Select (`select.tsx`)
Dropdown select with size variants and error states.

```tsx
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
} from "@/components/ui/shadcn"

<Select>
  <SelectTrigger
    selectSize="md"       // "sm" | "md" | "lg"
    error={false}
    fullWidth={false}
  >
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Options</SelectLabel>
      <SelectItem value="1">Option 1</SelectItem>
      <SelectItem value="2">Option 2</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectItem value="other">Other</SelectItem>
  </SelectContent>
</Select>
```

### Checkbox (`checkbox.tsx`)
Checkbox with indeterminate state and size variants.

```tsx
import { Checkbox } from "@/components/ui/shadcn"

<Checkbox
  size="md"              // "sm" | "md" | "lg"
  variant="default"      // "default" | "destructive" | "success"
  error={false}
  indeterminate={false}  // For parent checkboxes
  checked={false}
/>
```

### Radio Group (`radio-group.tsx`)
Radio button group with size and variant options.

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/shadcn"
import { Label } from "@/components/ui/shadcn"

<RadioGroup defaultValue="option1" orientation="vertical">
  <div className="flex items-center space-x-2">
    <RadioGroupItem
      value="option1"
      size="md"          // "sm" | "md" | "lg"
      variant="default"  // "default" | "destructive"
      error={false}
    />
    <Label>Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" size="md" />
    <Label>Option 2</Label>
  </div>
</RadioGroup>
```

### Switch (`switch.tsx`)
Toggle switch component.

```tsx
import { Switch } from "@/components/ui/shadcn"

<Switch
  size="md"              // "sm" | "md" | "lg"
  variant="default"      // "default" | "destructive" | "success"
  error={false}
  checked={false}
  onCheckedChange={(checked) => console.log(checked)}
/>
```

### Slider (`slider.tsx`)
Range slider with value display and formatting.

```tsx
import { Slider } from "@/components/ui/shadcn"

<Slider
  size="md"              // "sm" | "md" | "lg"
  variant="default"      // "default" | "destructive" | "success"
  error={false}
  showValue={true}       // Display value label
  formatValue={(v) => `${v}px`}  // Custom formatter
  min={0}
  max={100}
  step={1}
  value={[50]}
  onValueChange={(values) => console.log(values[0])}
/>
```

### Form (`form.tsx`)
Complete form system with react-hook-form integration.

```tsx
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormSection,
  FormGrid,
  FormActions,
} from "@/components/ui/shadcn"

// See full examples below
```

## Form Layout Components

### FormSection
Groups related form fields with optional title and description.

```tsx
<FormSection
  title="Personal Information"
  description="Provide your basic details"
>
  {/* Form fields go here */}
</FormSection>
```

### FormGrid
Responsive grid layout for form fields.

```tsx
<FormGrid columns={2}>  {/* 1 | 2 | 3 | 4 */}
  <FormField>{/* Field 1 */}</FormField>
  <FormField>{/* Field 2 */}</FormField>
</FormGrid>
```

### FormActions
Action buttons container with alignment options.

```tsx
<FormActions align="right">  {/* "left" | "center" | "right" | "between" */}
  <Button type="button" variant="outline">Cancel</Button>
  <Button type="submit">Submit</Button>
</FormActions>
```

## Complete Form Example

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormSection,
  FormGrid,
  FormActions,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Switch,
  Button,
} from "@/components/ui/shadcn"

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  accountType: z.enum(["personal", "business"]),
  bio: z.string().max(500).optional(),
  notifications: z.boolean(),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms",
  }),
})

type FormData = z.infer<typeof formSchema>

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      accountType: "personal",
      bio: "",
      notifications: true,
      terms: false,
    },
  })

  const onSubmit = (data: FormData) => {
    console.log(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormSection
          title="Personal Information"
          description="Basic details about yourself"
        >
          <FormGrid columns={2}>
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John"
                      {...field}
                      error={!!form.formState.errors.firstName}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Doe"
                      {...field}
                      error={!!form.formState.errors.lastName}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </FormGrid>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john@example.com"
                    {...field}
                    error={!!form.formState.errors.email}
                  />
                </FormControl>
                <FormDescription>
                  We'll never share your email with anyone else.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accountType"
            render={({ field }) => (
              <FormItem>
                <FormLabel required>Account Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger error={!!form.formState.errors.accountType}>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself..."
                    autoResize
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Brief description (max 500 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection title="Preferences">
          <FormField
            control={form.control}
            name="notifications"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Notifications</FormLabel>
                  <FormDescription>
                    Receive email notifications
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    error={!!form.formState.errors.terms}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel required>Accept Terms</FormLabel>
                  <FormDescription>
                    You agree to our Terms of Service and Privacy Policy
                  </FormDescription>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />
        </FormSection>

        <FormActions align="between">
          <Button type="button" variant="outline">Cancel</Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </FormActions>
      </form>
    </Form>
  )
}
```

## Accessibility Features

All form components include:

- ✅ **ARIA Labels**: Proper `aria-label`, `aria-describedby`, `aria-invalid`
- ✅ **Keyboard Navigation**: Full keyboard support with Tab/Enter/Space
- ✅ **Screen Reader**: Semantic HTML and ARIA live regions for errors
- ✅ **Focus Management**: Visible focus rings using Tailwind ring utilities
- ✅ **Error Announcements**: `role="alert"` and `aria-live="polite"` for validation

## Size Variants

All inputs support three sizes:

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| sm   | h-8    | px-2.5  | text-xs   |
| md   | h-10   | px-3    | text-sm   |
| lg   | h-12   | px-4    | text-base |

## Error Handling

Components support error states through:

1. **Visual Indicators**: Red border (`border-destructive`)
2. **Focus Ring**: Red ring on focus (`ring-destructive`)
3. **Error Messages**: `FormMessage` component with ARIA
4. **Accessible Announcements**: Live regions for screen readers

```tsx
// Error state example
<Input
  error={!!form.formState.errors.fieldName}
  aria-invalid={!!form.formState.errors.fieldName}
/>
<FormMessage />  {/* Automatically shows error.message */}
```

## TypeScript Support

All components are fully typed:

```tsx
import type {
  InputProps,
  CheckboxProps,
  SwitchProps,
  SliderProps,
} from "@/components/ui/shadcn"

// Props are fully typed with IntelliSense support
```

## Examples File

See `examples.tsx` for comprehensive examples including:

- User registration form with validation
- Settings form with radio groups and sliders
- Size variants showcase
- Error states demonstration

## Form Component Dependencies

- `@radix-ui/react-label` - Label primitives
- `@radix-ui/react-select` - Select primitives
- `@radix-ui/react-checkbox` - Checkbox primitives
- `@radix-ui/react-radio-group` - Radio primitives
- `@radix-ui/react-switch` - Switch primitives
- `@radix-ui/react-slider` - Slider primitives
- `@radix-ui/react-slot` - Slot primitives
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `class-variance-authority` - Variant styling
- `tailwind-merge` - Class merging
- `lucide-react` - Icons
