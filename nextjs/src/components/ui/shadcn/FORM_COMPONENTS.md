# Form Components Documentation

Enterprise-grade form and input components built with Radix UI primitives, TypeScript, and react-hook-form integration for the LexiFlow legal tech application.

## Components Overview

All components are production-ready with:
- Full TypeScript support with proper types
- Radix UI primitives for accessibility
- react-hook-form integration
- Error states and validation display
- Size variants
- Proper ARIA attributes
- No mocks or TODOs

---

## 1. Input Component

Basic text input with size variants and error states.

### Props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "sm" | "md" | "lg";  // Default: "md"
  error?: boolean;
  fullWidth?: boolean;
}
```

### Usage

```tsx
import { Input } from "@/components/ui/shadcn/input";

// Basic usage
<Input placeholder="Enter text" />

// With error state
<Input error={true} placeholder="Required field" />

// Different sizes
<Input inputSize="sm" />
<Input inputSize="lg" />

// Full width
<Input fullWidth placeholder="Full width input" />

// With react-hook-form
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input {...field} error={!!form.formState.errors.email} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 2. Label Component

Label component with Radix UI Label primitive.

### Props

```typescript
interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
  variant?: "default" | "muted" | "error";
  size?: "sm" | "md" | "lg";
  required?: boolean;
}
```

### Usage

```tsx
import { Label } from "@/components/ui/shadcn/label";

// Basic usage
<Label htmlFor="email">Email Address</Label>

// Required field
<Label htmlFor="name" required>Full Name</Label>

// Error variant
<Label variant="error">This field has an error</Label>

// Size variants
<Label size="sm">Small Label</Label>
<Label size="lg">Large Label</Label>
```

---

## 3. Textarea Component

Multi-line text input with auto-resize capability.

### Props

```typescript
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  textareaSize?: "sm" | "md" | "lg";
  error?: boolean;
  fullWidth?: boolean;
  autoResize?: boolean;
}
```

### Usage

```tsx
import { Textarea } from "@/components/ui/shadcn/textarea";

// Basic usage
<Textarea placeholder="Enter description" />

// Auto-resize based on content
<Textarea autoResize placeholder="This will grow as you type" />

// With error state
<Textarea error={true} />

// Different sizes
<Textarea textareaSize="sm" />
<Textarea textareaSize="lg" />

// With react-hook-form
<FormField
  control={form.control}
  name="description"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Description</FormLabel>
      <FormControl>
        <Textarea
          autoResize
          error={!!form.formState.errors.description}
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 4. Select Component

Dropdown select with Radix UI Select primitive.

### Components

- `Select` - Root component
- `SelectTrigger` - The button that opens the select
- `SelectContent` - The dropdown content
- `SelectItem` - Individual select option
- `SelectValue` - Displays selected value
- `SelectGroup` - Groups select items
- `SelectLabel` - Label for a group
- `SelectSeparator` - Visual separator

### Props

```typescript
interface SelectTriggerProps extends React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> {
  selectSize?: "sm" | "md" | "lg";
  error?: boolean;
  fullWidth?: boolean;
}
```

### Usage

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/shadcn/select";

// Basic usage
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>

// With react-hook-form
<FormField
  control={form.control}
  name="caseType"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Case Type</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger error={!!form.formState.errors.caseType}>
            <SelectValue placeholder="Select case type" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="civil">Civil Litigation</SelectItem>
          <SelectItem value="criminal">Criminal Defense</SelectItem>
          <SelectItem value="corporate">Corporate Law</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 5. Checkbox Component

Checkbox with Radix UI Checkbox primitive.

### Props

```typescript
interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "destructive";
  error?: boolean;
  indeterminate?: boolean;
}
```

### Usage

```tsx
import { Checkbox } from "@/components/ui/shadcn/checkbox";
import { Label } from "@/components/ui/shadcn/label";

// Basic usage
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>

// Indeterminate state (for parent checkboxes)
<Checkbox indeterminate={true} />

// With error state
<Checkbox error={true} />

// Different sizes
<Checkbox size="sm" />
<Checkbox size="lg" />

// With react-hook-form
<FormField
  control={form.control}
  name="billable"
  render={({ field }) => (
    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
      <FormControl>
        <Checkbox
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      </FormControl>
      <div className="space-y-1 leading-none">
        <FormLabel>Billable Case</FormLabel>
        <FormDescription>
          This case will be billed to the client
        </FormDescription>
      </div>
    </FormItem>
  )}
/>
```

---

## 6. Radio Group Component

Radio button group with Radix UI RadioGroup primitive.

### Props

```typescript
interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  orientation?: "vertical" | "horizontal";
  error?: boolean;
}

interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "destructive";
  error?: boolean;
}
```

### Usage

```tsx
import { RadioGroup, RadioGroupItem } from "@/components/ui/shadcn/radio-group";
import { Label } from "@/components/ui/shadcn/label";

// Basic usage
<RadioGroup defaultValue="option1">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option1" id="r1" />
    <Label htmlFor="r1">Option 1</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="option2" id="r2" />
    <Label htmlFor="r2">Option 2</Label>
  </div>
</RadioGroup>

// Horizontal orientation
<RadioGroup orientation="horizontal">
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="yes" id="yes" />
    <Label htmlFor="yes">Yes</Label>
  </div>
  <div className="flex items-center space-x-2">
    <RadioGroupItem value="no" id="no" />
    <Label htmlFor="no">No</Label>
  </div>
</RadioGroup>

// With react-hook-form
<FormField
  control={form.control}
  name="status"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Case Status</FormLabel>
      <FormControl>
        <RadioGroup
          onValueChange={field.onChange}
          defaultValue={field.value}
          error={!!form.formState.errors.status}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="active" id="active" />
            <Label htmlFor="active">Active</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="closed" id="closed" />
            <Label htmlFor="closed">Closed</Label>
          </div>
        </RadioGroup>
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 7. Switch Component

Toggle switch with Radix UI Switch primitive.

### Props

```typescript
interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: "sm" | "md" | "lg";
  variant?: "default" | "destructive";
  error?: boolean;
}
```

### Usage

```tsx
import { Switch } from "@/components/ui/shadcn/switch";
import { Label } from "@/components/ui/shadcn/label";

// Basic usage
<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <Label htmlFor="notifications">Enable notifications</Label>
</div>

// Different sizes
<Switch size="sm" />
<Switch size="lg" />

// With error state
<Switch error={true} />

// With react-hook-form
<FormField
  control={form.control}
  name="notifyClient"
  render={({ field }) => (
    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel>Client Notifications</FormLabel>
        <FormDescription>
          Send automatic email notifications to the client
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
```

---

## 8. Slider Component

Range slider with Radix UI Slider primitive.

### Props

```typescript
interface SliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  variant?: "default" | "destructive";
  size?: "sm" | "md" | "lg";
  error?: boolean;
  showValue?: boolean;
  formatValue?: (value: number) => string;
}
```

### Usage

```tsx
import { Slider } from "@/components/ui/shadcn/slider";

// Basic usage
<Slider defaultValue={[50]} max={100} step={1} />

// Show value below slider
<Slider
  defaultValue={[50]}
  max={100}
  step={5}
  showValue
  formatValue={(val) => `${val}%`}
/>

// Range slider (two thumbs)
<Slider defaultValue={[25, 75]} max={100} step={1} />

// With react-hook-form
<FormField
  control={form.control}
  name="budgetPercentage"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Budget Utilization</FormLabel>
      <FormControl>
        <Slider
          min={0}
          max={100}
          step={5}
          value={[field.value]}
          onValueChange={(vals) => field.onChange(vals[0])}
          showValue
          formatValue={(val) => `${val}%`}
        />
      </FormControl>
      <FormDescription>
        Current budget utilization percentage
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## 9. Form Components

Complete form solution using react-hook-form with proper TypeScript support.

### Components

- `Form` - FormProvider wrapper
- `FormField` - Field wrapper with context
- `FormItem` - Container for form field
- `FormLabel` - Label with error state
- `FormControl` - Control wrapper
- `FormDescription` - Help text
- `FormMessage` - Error message display
- `useFormField` - Hook to access field context

### Usage

```tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/shadcn/form";
import { Input } from "@/components/ui/shadcn/input";
import { Button } from "@/components/ui/shadcn/button";

// Define validation schema
const formSchema = z.object({
  caseName: z.string().min(3, "Case name must be at least 3 characters"),
  caseNumber: z.string().min(1, "Case number is required"),
});

type FormValues = z.infer<typeof formSchema>;

function MyForm() {
  const form = useForm<FormValues>({
    defaultValues: {
      caseName: "",
      caseNumber: "",
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="caseName"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Case Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter case name"
                  error={!!form.formState.errors.caseName}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The full name or title of the legal case
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="caseNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel required>Case Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., CV-2024-001"
                  error={!!form.formState.errors.caseNumber}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

---

## Complete Example

See `form-example.tsx` for a comprehensive example showing all components working together in a legal case management form with:

- Text inputs with validation
- Textarea with auto-resize
- Select dropdowns
- Radio groups
- Checkboxes
- Switches
- Sliders
- Full form validation with Zod
- Error states
- Required field indicators

---

## Best Practices

1. **Always use FormField with react-hook-form** for proper validation and error handling
2. **Pass error prop** to input components when using form validation
3. **Use required prop on FormLabel** to indicate required fields
4. **Provide FormDescription** for complex fields to help users
5. **Use appropriate size variants** for visual hierarchy
6. **Leverage TypeScript types** for type-safe form handling
7. **Use Zod schemas** for validation to keep types in sync

---

## Accessibility

All components follow WAI-ARIA guidelines:

- Proper ARIA attributes (aria-invalid, aria-describedby, etc.)
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Proper labeling associations

---

## File Locations

```
nextjs/src/components/ui/shadcn/
├── input.tsx              # Input component
├── label.tsx              # Label component
├── textarea.tsx           # Textarea component
├── select.tsx             # Select dropdown
├── checkbox.tsx           # Checkbox component
├── radio-group.tsx        # Radio group component
├── switch.tsx             # Switch toggle
├── slider.tsx             # Range slider
├── form.tsx              # Form components
├── form-example.tsx      # Usage examples
└── index.ts              # Exports
```

---

## Dependencies

All Radix UI primitives are already installed:

- `@radix-ui/react-label`
- `@radix-ui/react-select`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-switch`
- `@radix-ui/react-slider`
- `@radix-ui/react-slot`
- `react-hook-form`
- `class-variance-authority`
- `lucide-react` (for icons)

No additional dependencies needed!
