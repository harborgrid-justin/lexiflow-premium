# NewCase.tsx Refactoring Checklist - R3F4C7

## Phase 1: Type Extraction
- [ ] Create `types/` directory
- [ ] Extract FormData interface to `types/newCaseTypes.ts`
- [ ] Extract TabId type
- [ ] Extract NewMatterProps interface
- [ ] Export CaseType enum
- [ ] Verify TypeScript compilation

## Phase 2: Custom Hooks Extraction
- [ ] Create `hooks/` directory
- [ ] Create `useNewCaseForm.ts`
  - [ ] Extract form state
  - [ ] Extract handleChange
  - [ ] Extract loadFormData
  - [ ] Export hook interface
- [ ] Create `useNewCaseMutations.ts`
  - [ ] Extract createMutation
  - [ ] Extract updateMutation
  - [ ] Extract deleteMutation
  - [ ] Export mutation functions
- [ ] Create `useConflictCheck.ts`
  - [ ] Extract conflict checking logic
  - [ ] Extract conflictStatus state
  - [ ] Export hook interface
- [ ] Create `useRelatedCases.ts`
  - [ ] Extract related cases handlers
  - [ ] Export add/remove/update functions
- [ ] Create `useFormValidation.ts`
  - [ ] Extract validation logic
  - [ ] Extract errors state
  - [ ] Export validate function
- [ ] Verify all hooks compile

## Phase 3: Shared UI Components
- [ ] Create `components/` directory
- [ ] Create `FormField.tsx`
  - [ ] Implement label, input, error props
  - [ ] Add TypeScript types
  - [ ] Handle error styling
- [ ] Create `FormSelect.tsx`
  - [ ] Implement select with options
  - [ ] Add error handling
- [ ] Create `FormTextarea.tsx`
  - [ ] Implement textarea component
  - [ ] Add rows prop
- [ ] Create `CurrencyInput.tsx`
  - [ ] Add $ prefix styling
  - [ ] Handle number parsing
- [ ] Create `TabBar.tsx`
  - [ ] Extract tabs config
  - [ ] Implement tab switching
  - [ ] Add active styling
- [ ] Create `DeleteConfirmModal.tsx`
  - [ ] Extract modal markup
  - [ ] Add onConfirm/onCancel props
- [ ] Create `ConflictWarning.tsx`
  - [ ] Extract warning banner
  - [ ] Add status prop
- [ ] Create `GlobalErrors.tsx`
  - [ ] Extract error display
  - [ ] Add errors prop
- [ ] Verify all components render

## Phase 4: Tab Components
- [ ] Create `tabs/` directory
- [ ] Create `IntakeTab.tsx`
  - [ ] Extract intake form fields
  - [ ] Use FormField components
  - [ ] Add proper TypeScript types
  - [ ] Verify all fields working
- [ ] Create `CourtTab.tsx`
  - [ ] Extract court form fields
  - [ ] Use shared components
  - [ ] Verify all fields working
- [ ] Create `PartiesTab.tsx`
  - [ ] Extract parties fields
  - [ ] Extract conflict check section
  - [ ] Extract risk management section
  - [ ] Verify all fields working
- [ ] Create `FinancialTab.tsx`
  - [ ] Extract financial fields
  - [ ] Use CurrencyInput
  - [ ] Verify all fields working
- [ ] Create `RelatedCasesTab.tsx`
  - [ ] Extract related cases list
  - [ ] Implement add/remove UI
  - [ ] Verify functionality
- [ ] Test all tabs render correctly

## Phase 5: Main Component Refactor
- [ ] Update NewCase.tsx imports
- [ ] Import all custom hooks
- [ ] Import all tab components
- [ ] Import shared components
- [ ] Replace inline JSX with components
- [ ] Verify component orchestration
- [ ] Maintain default export
- [ ] Remove unused code
- [ ] Clean up imports

## Phase 6: Validation
- [ ] TypeScript compilation passes
- [ ] No import errors
- [ ] All tabs render correctly
- [ ] Form submission works
- [ ] Validation works
- [ ] Conflict checking works
- [ ] Related cases CRUD works
- [ ] Delete functionality works
- [ ] Edit mode loads data correctly
- [ ] Create mode works
- [ ] All LOC targets met
- [ ] Component composition clean
- [ ] Props properly typed
- [ ] Hooks have correct dependencies

## Completion Criteria
- [ ] All checklist items completed
- [ ] Original functionality preserved
- [ ] Code quality improved
- [ ] Documentation updated
- [ ] No regressions introduced
