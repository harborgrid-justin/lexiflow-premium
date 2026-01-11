# NewCase Component - Refactored Structure

## Overview

This directory contains the refactored NewCase (Matter/Case creation) component, broken down from a monolithic 1549-line file into 20 focused, maintainable modules.

## Directory Structure

```
create/
├── NewCase.tsx                    # Main orchestrator component (295 LOC)
├── types/
│   └── newCaseTypes.ts           # TypeScript interfaces (127 LOC)
├── hooks/
│   ├── useNewCaseForm.ts         # Form state management (164 LOC)
│   ├── useNewCaseMutations.ts    # CRUD operations (110 LOC)
│   ├── useConflictCheck.ts       # Conflict detection (41 LOC)
│   ├── useRelatedCases.ts        # Related cases management (44 LOC)
│   └── useFormValidation.ts      # Validation logic (58 LOC)
├── components/
│   ├── FormField.tsx             # Reusable input field (70 LOC)
│   ├── FormSelect.tsx            # Reusable select dropdown (65 LOC)
│   ├── FormTextarea.tsx          # Reusable textarea (55 LOC)
│   ├── CurrencyInput.tsx         # Currency input with formatting (69 LOC)
│   ├── TabBar.tsx                # Tab navigation (46 LOC)
│   ├── DeleteConfirmModal.tsx    # Delete confirmation dialog (57 LOC)
│   ├── ConflictWarning.tsx       # Conflict warning banner (23 LOC)
│   └── GlobalErrors.tsx          # Global error display (23 LOC)
└── tabs/
    ├── IntakeTab.tsx             # Intake & basic info (177 LOC)
    ├── CourtTab.tsx              # Court information (140 LOC)
    ├── PartiesTab.tsx            # Parties & team (152 LOC)
    ├── FinancialTab.tsx          # Financial information (138 LOC)
    └── RelatedCasesTab.tsx       # Related cases (86 LOC)
```

## Component Architecture

### Main Component: NewCase.tsx

The main component acts as an orchestrator:
- Manages tab navigation state
- Coordinates custom hooks
- Renders appropriate tab based on state
- Handles form submission

```typescript
import NewMatter from './NewCase';

<NewMatter
  id={matterId}              // Optional: for edit mode
  onBack={() => navigate('/')}
  onSaved={(id) => console.log('Saved:', id)}
  currentUser={user}
/>
```

### Custom Hooks

#### useNewCaseForm
Manages form state and provides handlers for form data manipulation.

```typescript
const { formData, handleChange, loadFormData, generatedNumber } = useNewCaseForm(
  existingMattersCount
);
```

#### useNewCaseMutations
Handles create, update, and delete operations via React Query.

```typescript
const { createMatter, updateMatter, deleteMatter, isDeleting } = useNewCaseMutations(
  id,
  onSaved,
  onBack
);
```

#### useConflictCheck
Performs real-time conflict checking against existing matters.

```typescript
const { conflictStatus } = useConflictCheck(
  formData.clientName,
  existingMatters,
  id
);
```

#### useFormValidation
Validates form fields and manages error state.

```typescript
const { errors, validate, clearFieldError } = useFormValidation(
  formData,
  conflictStatus
);
```

#### useRelatedCases
Manages the related cases array with add/remove/update operations.

```typescript
const { addRelatedCase, removeRelatedCase, updateRelatedCase } = useRelatedCases(
  formData.relatedCases,
  setRelatedCases
);
```

### Reusable Components

All components in `components/` are fully reusable across the application:

#### FormField
```typescript
<FormField
  id="title"
  label="Title"
  value={formData.title}
  onChange={(value) => handleChange('title', value)}
  error={errors.title}
  required
  placeholder="Enter title"
/>
```

#### FormSelect
```typescript
<FormSelect
  id="status"
  label="Status"
  value={formData.status}
  onChange={(value) => handleChange('status', value)}
  options={statusOptions}
  required
/>
```

#### CurrencyInput
```typescript
<CurrencyInput
  id="estimatedValue"
  label="Estimated Value"
  value={formData.estimatedValue}
  onChange={(value) => handleChange('estimatedValue', value)}
/>
```

### Tab Components

Each tab is self-contained and receives:
- `formData`: Current form state
- `onChange`: Handler for field changes
- `errors`: Validation errors (if applicable)

```typescript
<IntakeTab
  formData={formData}
  generatedNumber={generatedNumber}
  conflictStatus={conflictStatus}
  errors={errors}
  onChange={handleFieldChange}
/>
```

## TypeScript Types

All types are centralized in `types/newCaseTypes.ts`:

```typescript
import { FormData, TabId, NewMatterProps, CaseType } from './types/newCaseTypes';
```

Key types:
- `FormData`: Complete form structure (50+ fields)
- `TabId`: Union type for tab identifiers
- `NewMatterProps`: Component props interface
- `CaseType`: Enum for case types

## Best Practices Applied

### React Patterns
- ✓ Functional components throughout
- ✓ Custom hooks for business logic
- ✓ Component composition over inheritance
- ✓ Props destructuring for clarity
- ✓ Single responsibility per file

### Performance
- ✓ `useCallback` for event handlers passed to children
- ✓ `useMemo` for expensive computations
- ✓ Proper dependency arrays in hooks
- ✓ React Query caching (staleTime: 60s)

### Type Safety
- ✓ Full TypeScript coverage
- ✓ No `any` types
- ✓ Proper event handler typing
- ✓ Discriminated unions for variants

### Code Organization
- ✓ Clear file structure
- ✓ Consistent naming conventions
- ✓ JSDoc comments on complex logic
- ✓ Logical grouping of related code

## Testing Strategy

### Unit Tests
Each hook can be tested independently with `renderHook`:
```typescript
import { renderHook } from '@testing-library/react';
import { useNewCaseForm } from './hooks/useNewCaseForm';

test('initializes form with defaults', () => {
  const { result } = renderHook(() => useNewCaseForm(0));
  expect(result.current.formData.title).toBe('');
});
```

### Component Tests
Components can be tested in isolation:
```typescript
import { render, screen } from '@testing-library/react';
import { FormField } from './components/FormField';

test('renders input with label', () => {
  render(<FormField id="test" label="Test" value="" onChange={jest.fn()} />);
  expect(screen.getByLabelText('Test')).toBeInTheDocument();
});
```

### Integration Tests
Test the full component flow:
```typescript
test('creates new matter on submit', async () => {
  render(<NewMatter currentUser={mockUser} />);
  // Fill form
  // Submit
  // Assert mutations called
});
```

## Migration Guide

### Using the Refactored Component

No changes required for existing consumers:
```typescript
// Before and After - Same API
import NewMatter from '@/features/cases/components/create/NewCase';

<NewMatter id={id} onSaved={handleSave} currentUser={user} />
```

### Extending with New Fields

1. Add field to `FormData` in `types/newCaseTypes.ts`
2. Add field to initial state in `useNewCaseForm.ts`
3. Add field to appropriate tab component
4. Update validation in `useFormValidation.ts` if needed

### Adding a New Tab

1. Create tab component in `tabs/` directory
2. Add tab config to `tabs` array in `NewCase.tsx`
3. Add tab rendering logic in main component
4. Update `TabId` type in `types/newCaseTypes.ts`

## Performance Considerations

### Current Optimizations
- Form state centralized in single hook
- Event handlers memoized with `useCallback`
- Expensive computations memoized with `useMemo`
- React Query caching prevents unnecessary fetches

### Future Optimizations (if needed)
- Apply `React.memo` to tab components
- Implement virtual scrolling for long lists
- Code split tabs with `React.lazy`
- Debounce conflict checking

## Maintenance

### Adding Validation
Update `useFormValidation.ts`:
```typescript
const validate = useCallback((): boolean => {
  const newErrors: Record<string, string> = {};

  // Add new validation rule
  if (!formData.newField?.trim()) {
    newErrors.newField = 'New field is required';
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
}, [formData]);
```

### Adding Reusable Components
Create in `components/` directory following existing patterns:
```typescript
export interface MyComponentProps {
  // Props with proper types
}

export const MyComponent: React.FC<MyComponentProps> = ({ ...props }) => {
  // Implementation
};
```

## Dependencies

### External Libraries
- React 18+
- React Query (via `@/hooks/useQueryHooks`)
- Lucide React (icons)
- TailwindCSS (styling via `@/shared/lib/cn`)

### Internal Dependencies
- `@/shared/ui/atoms/Button`
- `@/shared/ui/molecules/Breadcrumbs`
- `@/shared/ui/organisms/PageHeader`
- `@/contexts/theme/ThemeContext`
- `@/hooks/useNotify`
- `@/services/data/dataService`
- `@/types` (Matter, Case, etc.)

## Troubleshooting

### TypeScript Errors
Ensure all types are imported from `types/newCaseTypes.ts`:
```typescript
import { FormData, TabId } from './types/newCaseTypes';
```

### Hook Dependency Warnings
Check that all dependencies are included in hook arrays:
```typescript
useCallback(() => {
  // If using 'formData', include it in deps
}, [formData]);
```

### Component Not Rendering
Verify tab switching logic in `NewCase.tsx`:
```typescript
{activeTab === 'intake' && <IntakeTab {...props} />}
```

## Contributing

When adding new features:
1. Follow existing file structure and naming
2. Keep files under ~200 LOC
3. Use TypeScript strict mode
4. Add JSDoc comments for complex logic
5. Test your changes
6. Update this README if adding new patterns

## License

Internal use only - Lexiflow Premium
