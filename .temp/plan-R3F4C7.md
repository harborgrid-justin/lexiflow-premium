# NewCase.tsx Refactoring Plan - R3F4C7

## Overview
Break down the 1549-line NewCase.tsx component into smaller, focused components averaging ~90 LOC each, following React component composition best practices.

## Current Analysis
- **Total LOC**: 1549
- **Target LOC per file**: ~90
- **Estimated new files**: ~17 files
- **Component type**: Large form with tabs, state management, validation, CRUD operations

## Component Breakdown Strategy

### Phase 1: Type Extraction (30 min)
**Files to create:**
1. `types/newCaseTypes.ts` (~80 LOC)
   - FormData interface
   - TabId type
   - NewMatterProps interface
   - CaseType enum

### Phase 2: Custom Hooks Extraction (60 min)
**Files to create:**
2. `hooks/useNewCaseForm.ts` (~120 LOC)
   - Form state management
   - handleChange, handleSubmit
   - Form data initialization

3. `hooks/useNewCaseMutations.ts` (~90 LOC)
   - Create, update, delete mutations
   - Query invalidation logic

4. `hooks/useConflictCheck.ts` (~70 LOC)
   - Conflict checking logic
   - Conflict status state

5. `hooks/useRelatedCases.ts` (~80 LOC)
   - Related cases array management
   - Add, remove, update handlers

6. `hooks/useFormValidation.ts` (~70 LOC)
   - Validation logic
   - Error state management

### Phase 3: Shared UI Components (60 min)
**Files to create:**
7. `components/FormField.tsx` (~60 LOC)
   - Reusable input field with label and error

8. `components/FormSelect.tsx` (~60 LOC)
   - Reusable select field with label and error

9. `components/FormTextarea.tsx` (~60 LOC)
   - Reusable textarea with label

10. `components/CurrencyInput.tsx` (~70 LOC)
    - Currency input with $ prefix

11. `components/TabBar.tsx` (~90 LOC)
    - Tab navigation component

12. `components/DeleteConfirmModal.tsx` (~80 LOC)
    - Delete confirmation dialog

13. `components/ConflictWarning.tsx` (~50 LOC)
    - Conflict warning banner

14. `components/GlobalErrors.tsx` (~50 LOC)
    - Global error display

### Phase 4: Tab Components (90 min)
**Files to create:**
15. `tabs/IntakeTab.tsx` (~200 LOC)
    - Intake form fields
    - Basic info section

16. `tabs/CourtTab.tsx` (~190 LOC)
    - Court information fields
    - Federal litigation fields

17. `tabs/PartiesTab.tsx` (~180 LOC)
    - Parties and team
    - Conflict check section
    - Risk management section

18. `tabs/FinancialTab.tsx` (~190 LOC)
    - Financial fields
    - Billing information
    - Important dates

19. `tabs/RelatedCasesTab.tsx` (~100 LOC)
    - Related cases list
    - Add/remove functionality

### Phase 5: Main Component Refactor (45 min)
**Files to modify:**
20. `NewCase.tsx` (~150 LOC)
    - Component orchestration
    - Header and breadcrumbs
    - Tab switching logic
    - Hook integration

## File Structure
```
frontend/src/features/cases/components/create/
├── NewCase.tsx (main orchestrator - 150 LOC)
├── types/
│   └── newCaseTypes.ts (80 LOC)
├── hooks/
│   ├── useNewCaseForm.ts (120 LOC)
│   ├── useNewCaseMutations.ts (90 LOC)
│   ├── useConflictCheck.ts (70 LOC)
│   ├── useRelatedCases.ts (80 LOC)
│   └── useFormValidation.ts (70 LOC)
├── components/
│   ├── FormField.tsx (60 LOC)
│   ├── FormSelect.tsx (60 LOC)
│   ├── FormTextarea.tsx (60 LOC)
│   ├── CurrencyInput.tsx (70 LOC)
│   ├── TabBar.tsx (90 LOC)
│   ├── DeleteConfirmModal.tsx (80 LOC)
│   ├── ConflictWarning.tsx (50 LOC)
│   └── GlobalErrors.tsx (50 LOC)
└── tabs/
    ├── IntakeTab.tsx (200 LOC)
    ├── CourtTab.tsx (190 LOC)
    ├── PartiesTab.tsx (180 LOC)
    ├── FinancialTab.tsx (190 LOC)
    └── RelatedCasesTab.tsx (100 LOC)
```

## Timeline
- **Phase 1**: 30 minutes
- **Phase 2**: 60 minutes
- **Phase 3**: 60 minutes
- **Phase 4**: 90 minutes
- **Phase 5**: 45 minutes
- **Validation**: 30 minutes
- **Total**: ~5 hours

## Success Criteria
- All files < 200 LOC (target ~90 LOC)
- All existing functionality preserved
- TypeScript types maintained
- No import errors
- Component still exports default
- All tests pass (if present)
- Clean component composition
- Proper hook dependency arrays
- Memoization where appropriate

## Risk Mitigation
- Keep original file backed up
- Test each phase incrementally
- Verify imports after each extraction
- Check TypeScript compilation
- Maintain props interface compatibility
