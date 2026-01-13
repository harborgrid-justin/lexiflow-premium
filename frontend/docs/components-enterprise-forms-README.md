# Enterprise Form Components

Comprehensive, type-safe, and accessible form system for enterprise applications.

## Overview

This directory contains a complete form management system with:
- ✅ **Type Safety**: No `any` types, full TypeScript support
- ♿ **Accessibility**: WCAG 2.1 AA compliant with ARIA attributes
- 🎨 **Theming**: Integrated with enterprise theme system
- ⚡ **Performance**: Debounced validation, optimized re-renders
- 📝 **Validation**: Sync/async validators, cross-field validation
- 🔄 **Auto-save**: Configurable auto-save with conflict resolution
- 🧙 **Wizard Forms**: Multi-step forms with conditional logic
- 🎯 **Dynamic Forms**: Schema-driven form generation

## Components

### DynamicFormBuilder

Schema-driven form builder that generates complete forms from JSON configuration.

```typescript
import { DynamicFormBuilder } from '@/components/enterprise/forms';
import type { FormConfig } from '@/types/forms';

const config: FormConfig<UserData> = {
  schema: {
    id: 'user-form',
    title: 'User Profile',
    fields: [
      {
        name: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
        validationRules: [
          { name: 'email', validator: email('Invalid email') }
        ]
      }
    ]
  },
  initialValues: { email: '' },
  onSubmit: async (data) => {
    await saveUser(data);
  }
};

function MyForm() {
  return <DynamicFormBuilder config={config} />;
}
```

**Features:**
- Automatic field rendering based on type
- Built-in validation
- Conditional field visibility
- Section/fieldset support
- Auto-save capability
- Custom field renderers

### FormField

Universal form field component supporting all common input types.

```typescript
import { FormField } from '@/components/enterprise/forms';

<FormField
  field={{
    name: 'username',
    type: 'text',
    label: 'Username',
    required: true,
    minLength: 3,
    maxLength: 20,
    helpText: 'Choose a unique username',
    ariaDescription: 'Username must be 3-20 characters'
  }}
  value={value}
  onChange={setValue}
  error={error}
/>
```

**Supported Field Types:**
- Text inputs: `text`, `email`, `password`, `tel`, `url`, `search`
- Numeric: `number`, `range`
- Dates: `date`, `datetime-local`, `time`, `month`, `week`
- Selection: `select`, `multiselect`, `radio`
- Boolean: `checkbox`, `toggle`
- File: `file`
- Other: `textarea`, `color`, `custom`

**Accessibility Features:**
- Proper ARIA labels and descriptions
- Error announcements
- Keyboard navigation
- Focus management
- Screen reader support

### FormSection

Collapsible form section/fieldset component.

```typescript
import { FormSection } from '@/components/enterprise/forms';

<FormSection
  section={{
    id: 'personal-info',
    title: 'Personal Information',
    description: 'Enter your personal details',
    fields: [...],
    collapsible: true,
    defaultCollapsed: false
  }}
>
  {/* Field components */}
</FormSection>
```

### WizardForm

Multi-step wizard form with progress tracking.

```typescript
import { WizardForm } from '@/components/enterprise/forms';

const config: WizardConfig<FormData> = {
  id: 'onboarding',
  title: 'User Onboarding',
  steps: [
    {
      id: 'step-1',
      title: 'Basic Info',
      fields: [...]
    },
    {
      id: 'step-2',
      title: 'Preferences',
      fields: [...],
      skipWhen: { field: 'userType', operator: 'equals', value: 'guest' }
    }
  ],
  showProgress: true,
  progressType: 'steps',
  onSubmit: async (data) => await save(data)
};

<WizardForm config={config} initialData={initialData} />
```

**Features:**
- Conditional step visibility
- Per-step validation
- Progress indicators (dots, bar, steps)
- Data persistence
- Keyboard shortcuts
- Step navigation guards

## Hooks

### useEnhancedFormValidation

Advanced form validation with async support and cross-field rules.

```typescript
import { useEnhancedFormValidation } from '@/hooks/useEnhancedFormValidation';

const {
  formState,
  setValue,
  validateField,
  validateAll,
  isValid,
  errors,
  warnings
} = useEnhancedFormValidation({
  schema: formSchema,
  initialValues: { email: '', password: '' },
  validationMode: 'onChange',
  validateOnMount: true
});
```

**Features:**
- Sync and async validation
- Debounced async validators
- Cross-field validation
- Conditional field visibility
- Validation severity levels (error/warning/info)
- Smart re-validation

### useEnhancedAutoSave

Auto-save with conflict resolution and retry logic.

```typescript
import { useEnhancedAutoSave } from '@/hooks/useEnhancedAutoSave';

const {
  status,
  isSaving,
  lastSaved,
  forceSave,
  error
} = useEnhancedAutoSave({
  data: formData,
  onSave: async (data) => {
    const result = await api.save(data);
    return { success: true, data: result };
  },
  delay: 2000,
  enabled: true,
  maxRetries: 3
});
```

**Features:**
- Debounced saves
- Conflict detection
- Optimistic updates
- Version tracking
- Network error handling with retry
- Offline queue support

### useEnhancedWizard

Multi-step wizard state management.

```typescript
import { useEnhancedWizard } from '@/hooks/useEnhancedWizard';

const {
  currentStep,
  currentStepIndex,
  data,
  updateData,
  goNext,
  goBack,
  progress,
  submit
} = useEnhancedWizard({
  config: wizardConfig,
  initialData: {},
  validateStep: async (stepIndex, data) => {
    return await validateStepData(data);
  }
});
```

## Validation Utilities

### Built-in Validators

```typescript
import {
  required,
  email,
  minLength,
  maxLength,
  pattern,
  min,
  max,
  range,
  url,
  phoneUS,
  creditCard,
  dateAfter,
  dateBefore
} from '@/components/enterprise/forms';

// Combine validators
const validators = and(
  required('Required'),
  email('Invalid email'),
  minLength(5)
);
```

### Async Validators

```typescript
import { uniqueAsync, emailExistsAsync } from '@/components/enterprise/forms';

const checkUnique = uniqueAsync(
  async (value) => {
    const response = await fetch(`/api/check/${value}`);
    return response.ok;
  },
  'Already exists'
);
```

### Custom Validators

```typescript
import { custom } from '@/components/enterprise/forms';

const passwordStrength = custom(
  (value: string) => {
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    return hasUpper && hasLower && hasNumber;
  },
  'Password must contain uppercase, lowercase, and number'
);
```

## Type Guards

Type-safe field schema discrimination:

```typescript
import {
  isTextField,
  isNumberField,
  isSelectField,
  supportsMinMax
} from '@/components/enterprise/forms';

if (isTextField(field)) {
  // field is TextFieldSchema
  console.log(field.maxLength);
}

if (supportsMinMax(field)) {
  // field is NumberFieldSchema | DateFieldSchema
  console.log(field.min, field.max);
}
```

## Best Practices

### 1. Type Safety

Always provide explicit types for your form data:

```typescript
interface UserForm {
  email: string;
  age: number;
  preferences: string[];
}

const { formState } = useEnhancedFormValidation<UserForm>({...});
```

### 2. Accessibility

- Always provide `label` and `ariaLabel`
- Use `ariaDescription` for complex inputs
- Provide helpful `helpText`
- Use appropriate field types
- Ensure keyboard navigation works

### 3. Validation

- Use appropriate validators for each field
- Combine validators with `and()`
- Debounce async validators
- Provide clear error messages
- Consider validation severity (error vs warning)

### 4. Performance

- Use `validationMode: 'onBlur'` for complex forms
- Debounce auto-save appropriately
- Avoid unnecessary re-renders
- Use conditional field rendering

### 5. User Experience

- Show loading states
- Provide progress indicators
- Auto-save when appropriate
- Handle errors gracefully
- Give immediate feedback

## Examples

### Complete Form Example

```typescript
import { DynamicFormBuilder } from '@/components/enterprise/forms';
import { required, email, minLength } from '@/components/enterprise/forms';

interface ContactForm {
  name: string;
  email: string;
  message: string;
}

function ContactFormComponent() {
  const config: FormConfig<ContactForm> = {
    schema: {
      id: 'contact-form',
      title: 'Contact Us',
      description: 'Send us a message',
      fields: [
        {
          name: 'name',
          type: 'text',
          label: 'Your Name',
          required: true,
          validationRules: [
            { name: 'required', validator: required() },
            { name: 'minLength', validator: minLength(2) }
          ]
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
          required: true,
          validationRules: [
            { name: 'required', validator: required() },
            { name: 'email', validator: email() }
          ]
        },
        {
          name: 'message',
          type: 'textarea',
          label: 'Message',
          required: true,
          rows: 5,
          validationRules: [
            { name: 'required', validator: required() },
            { name: 'minLength', validator: minLength(10) }
          ]
        }
      ]
    },
    initialValues: {
      name: '',
      email: '',
      message: ''
    },
    onSubmit: async (data) => {
      await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    validationMode: 'onBlur',
    enableAutoSave: false
  };

  return <DynamicFormBuilder config={config} />;
}
```

## Testing

All components are fully tested with:
- Unit tests for validation logic
- Integration tests for form workflows
- Accessibility tests (axe-core)
- E2E tests for wizard forms

## Contributing

When adding new field types or validators:
1. Add type definition to `/types/forms.ts`
2. Create type guard in `type-guards.ts`
3. Update `FormField` component
4. Add validator to `validation.ts`
5. Write tests
6. Update this README

## License

Copyright © 2024 LexiFlow. All rights reserved.
