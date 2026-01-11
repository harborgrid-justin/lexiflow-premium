# Architecture Notes - NewCase.tsx Refactoring - R3F4C7

## High-level Design Decisions

### Component Composition Strategy
- **Main Component**: NewCase.tsx acts as orchestrator (~150 LOC)
- **Tab Components**: Each tab is self-contained with its own form fields
- **Shared Components**: Reusable form inputs extracted to components/
- **Custom Hooks**: Business logic extracted to hooks/
- **Types**: All interfaces and types in types/ for reusability

### State Management Approach
- **Form State**: Centralized in useNewCaseForm hook
- **UI State**: Local state in main component (activeTab, modals)
- **Server State**: React Query in useNewCaseMutations hook
- **Derived State**: useMemo for generated number and validation

### Props vs. Context API Decision
- **Props Drilling**: Acceptable for this component tree (max 2 levels deep)
- **No Context Needed**: Component tree is shallow, props are clear
- **Hook Sharing**: Custom hooks share logic without prop drilling

### Performance Optimization Strategies
- **Memoization**: useCallback for event handlers passed to children
- **useMemo**: For expensive computations (validation, generated number)
- **Code Splitting**: Not needed (component is lazy-loaded at route level)
- **Re-render Prevention**: React.memo on tab components if needed

## Integration Patterns

### Parent-Child Communication
```
NewCase (orchestrator)
  ├─> TabBar (activeTab, setActiveTab)
  ├─> IntakeTab (formData, handleChange, errors)
  ├─> CourtTab (formData, handleChange, errors)
  ├─> PartiesTab (formData, handleChange, errors)
  ├─> FinancialTab (formData, handleChange, errors)
  └─> RelatedCasesTab (relatedCases, handlers)
```

### Custom Hooks Dependency Graph
```
useNewCaseForm
  ├─> useState (formData)
  ├─> useCallback (handleChange)
  └─> useMemo (loadFormData)

useNewCaseMutations
  ├─> useMutation (create)
  ├─> useMutation (update)
  └─> useMutation (delete)

useConflictCheck
  ├─> useState (conflictStatus)
  ├─> useEffect (check conflicts)
  └─> useQuery (existing matters)

useFormValidation
  ├─> useState (errors)
  └─> useCallback (validate)

useRelatedCases
  └─> useCallback (add/remove/update)
```

## React Patterns Used

### Custom Hooks Design
- **Separation of Concerns**: Each hook handles one aspect (form, mutations, validation)
- **Composability**: Main component composes multiple hooks
- **Reusability**: Hooks can be reused in similar forms
- **Type Safety**: All hooks fully typed with TypeScript

### Compound Components Pattern (Not Used)
- **Decision**: Not needed for this use case
- **Reason**: Tabs are simple enough with props-based approach
- **Alternative**: TabBar component with tabs array config

### Render Props (Not Used)
- **Decision**: Hooks pattern preferred
- **Reason**: Modern React favors hooks over render props

### Higher-Order Components (Not Used)
- **Decision**: No HOCs in refactored code
- **Reason**: Hooks provide cleaner composition

## Performance Considerations

### Memoization Strategy
- **useCallback**: All event handlers passed to child components
- **useMemo**: Validation function, generated number, expensive computations
- **React.memo**: Apply to tab components if re-render issues arise

### Code Splitting Points
- **Current**: Component loaded via route-based code splitting
- **Future**: Could split tabs with React.lazy if size grows

### Lazy Loading Approach
- **Not Implemented**: All components loaded together
- **Reason**: Component size is manageable after refactor

### Re-render Optimization
- **Key Strategy**: Proper dependency arrays in hooks
- **Form Fields**: Memoized onChange handlers
- **Tab Switching**: Only active tab renders content

## Type Safety

### TypeScript Interface Design
```typescript
// Centralized in types/newCaseTypes.ts
export interface FormData { /* 50+ fields */ }
export interface NewMatterProps { /* component props */ }
export type TabId = 'intake' | 'court' | 'parties' | 'financial' | 'related';

// Hook interfaces
export interface UseNewCaseFormResult {
  formData: FormData;
  handleChange: (field: keyof FormData, value: unknown) => void;
  loadFormData: (data: Matter | Case) => void;
}
```

### Generic Component Patterns
- **FormField<T>**: Generic field component (if needed in future)
- **Current**: Simple typed props for form components

### Props Type Definitions
- **Explicit**: All props interfaces exported
- **Strict**: No `any` types
- **Discriminated Unions**: For variant props (error states)

### Event Handler Typing
```typescript
// Properly typed event handlers
handleChange: (field: keyof FormData, value: unknown) => void;
handleSubmit: (e: React.FormEvent) => Promise<void>;
```

## Component Responsibility Matrix

| Component | Responsibility | State | LOC |
|-----------|---------------|-------|-----|
| NewCase.tsx | Orchestration, routing | UI state | 150 |
| IntakeTab | Intake form fields | None | 200 |
| CourtTab | Court form fields | None | 190 |
| PartiesTab | Parties form fields | None | 180 |
| FinancialTab | Financial form fields | None | 190 |
| RelatedCasesTab | Related cases CRUD | None | 100 |
| FormField | Reusable input | None | 60 |
| FormSelect | Reusable select | None | 60 |
| TabBar | Tab navigation | None | 90 |
| useNewCaseForm | Form state logic | Form data | 120 |
| useNewCaseMutations | Server mutations | None | 90 |
| useConflictCheck | Conflict detection | Conflict status | 70 |
| useFormValidation | Validation logic | Errors | 70 |

## Testing Strategy

### Component Testing Approach
- **Unit Tests**: Each tab component tested independently
- **Integration Tests**: Main component with all tabs
- **Hook Tests**: Custom hooks with renderHook from RTL

### Test Coverage Goals
- **Components**: 80%+ coverage
- **Hooks**: 90%+ coverage (business logic)
- **Integration**: Key user flows tested

## Migration Path

### Backward Compatibility
- **Default Export**: Maintained from NewCase.tsx
- **Props Interface**: Unchanged (NewMatterProps)
- **Public API**: No breaking changes

### Incremental Adoption
- **Phase by Phase**: Can be done incrementally
- **Testing**: Test after each phase
- **Rollback**: Original file backed up
