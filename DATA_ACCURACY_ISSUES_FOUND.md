# IndexedDB Data Accuracy Issues - Deep Analysis Report

## Critical Issues Found

### 1. **CreateCaseModal Missing DataService Integration**
**Location**: `frontend/components/case-list/CreateCaseModal.tsx`

**Problem**: The modal calls `onSave(newCase)` but never persists data to IndexedDB via DataService.

**Impact**: Cases created through the modal are never saved to IndexedDB - they only exist in memory temporarily.

**Fix Required**:
```tsx
// In CreateCaseModal.tsx - handleSave function needs:
await DataService.cases.add(newCase);
queryClient.invalidate([STORES.CASES, 'all']);
onSave(newCase); // Then notify parent
```

---

### 2. **Incomplete Query Invalidation After Mutations**
**Locations**: Multiple components

**Problems**:
- Some mutations invalidate with broad patterns like `'tasks'` instead of `[STORES.TASKS, 'all']`
- Inconsistent invalidation keys across components
- Missing invalidation in some mutation success handlers

**Examples**:
```tsx
// ❌ BAD - Too broad
queryClient.invalidate('tasks'); // TaskCreationModal.tsx:89

// ❌ BAD - Inconsistent pattern  
queryClient.invalidate(['cases']); // CaseListToolbar.tsx:77

// ✅ GOOD - Specific and consistent
queryClient.invalidate([STORES.CASES, 'all']);
```

**Impact**: Stale data remains in cache, components don't refetch after mutations.

---

### 3. **Mixed Optimistic Update Patterns**
**Locations**: Multiple components use `queryClient.setQueryData` inconsistently

**Problems**:
- Some components use optimistic updates, others don't
- Rollback logic missing in some places
- No standardized pattern

**Impact**: UI shows stale data or inconsistent states after mutations fail.

---

### 4. **Repository Notifications Not Triggering Query Refetch**
**Location**: `frontend/services/core/Repository.ts`

**Problem**: Repository `notify()` calls don't automatically invalidate React Query cache.

**Impact**: When data changes through DataService, React Query cache isn't notified to refetch.

**Fix Needed**: Bridge Repository notifications to queryClient invalidations.

---

### 5. **Cache Bypass Not Fully Implemented**
**Location**: `frontend/services/queryClient.ts`

**Problem**: `cacheBypass` option added but not fully integrated into dependency arrays and effect hooks.

**Impact**: Critical queries can't force fresh data fetches when needed.

---

### 6. **Local State Mixed with Server State**
**Locations**: Multiple dashboard/list components

**Problem**: Components use `useState` for data that should come from IndexedDB:
```tsx
// ❌ BAD - Local state for DB data
const [judges, setJudges] = useState<JudgeProfile[]>([]);
const [custodians, setCustodians] = useState<Custodian[]>(mockCustodians);
```

**Impact**: Data doesn't reflect actual IndexedDB state, shows hardcoded/mock data instead.

---

### 7. **Missing Refetch on Window Focus**
**Problem**: `refetchOnWindowFocus` defaults to `true` but doesn't work for invalidated queries.

**Impact**: When user switches tabs and returns, they see stale data even if `dataUpdatedAt === 0`.

---

### 8. **Inconsistent STORES Key Usage**
**Problem**: Some components use string literals, others use `STORES` constants.

**Examples**:
```tsx
// Inconsistent patterns:
['tasks', 'all']           // String literal
[STORES.TASKS, 'all']     // Constant (correct)
'tasks'                    // Just string
```

**Impact**: Cache keys don't match, invalidation misses queries.

---

## Recommended Fixes (Priority Order)

### HIGH PRIORITY

1. **Fix CreateCaseModal to persist data**
2. **Standardize all invalidation keys to use STORES constants**
3. **Bridge Repository notifications to queryClient**
4. **Replace local useState with useQuery for DB data**

### MEDIUM PRIORITY

5. **Implement consistent optimistic update pattern**
6. **Add automatic invalidation after all mutations**
7. **Complete cacheBypass implementation**

### LOW PRIORITY

8. **Add data validation layer**
9. **Implement query key factory pattern**
10. **Add IndexedDB transaction logging**

---

## Query Key Standards (To Implement)

```typescript
// Standardized query key factory
export const queryKeys = {
  cases: {
    all: () => [STORES.CASES, 'all'] as const,
    detail: (id: string) => [STORES.CASES, 'detail', id] as const,
    byStatus: (status: string) => [STORES.CASES, 'byStatus', status] as const,
  },
  // ... repeat for all entities
};

// Usage:
useQuery(queryKeys.cases.all(), () => DataService.cases.getAll());
```

---

## Cache Invalidation Best Practices

```typescript
// After any mutation:
useMutation(DataService.cases.add, {
  onSuccess: (newCase) => {
    // 1. Invalidate list queries
    queryClient.invalidate(queryKeys.cases.all());
    
    // 2. Optionally set query data for immediate update
    queryClient.setQueryData(queryKeys.cases.detail(newCase.id), newCase);
    
    // 3. Invalidate related queries
    queryClient.invalidate(queryKeys.dashboard.stats());
  }
});
```

---

## Testing Recommendations

1. **Manual Testing Checklist**:
   - [ ] Create case → Verify appears in list immediately
   - [ ] Update case → Verify changes reflect across all views
   - [ ] Delete case → Verify removed from all lists
   - [ ] Switch tabs and return → Verify data still current
   - [ ] Offline mode → Verify sync queue works
   - [ ] Clear IndexedDB → Verify app recovers gracefully

2. **Automated Tests Needed**:
   - Repository CRUD operations
   - QueryClient invalidation logic
   - Optimistic updates and rollbacks
   - Cache coherence across components

---

## Files Requiring Updates

### Critical
- `frontend/components/case-list/CreateCaseModal.tsx` - Add DataService persistence
- `frontend/services/queryClient.ts` - Complete cacheBypass, improve invalidation
- `frontend/services/dataService.ts` - Bridge Repository to QueryClient

### Important
- All components using `queryClient.invalidate` (37 files) - Standardize keys
- All components using local `useState` for DB data (~40 files) - Convert to useQuery

### Nice to Have
- Create `frontend/utils/queryKeys.ts` - Query key factory
- Create `frontend/hooks/useOptimisticMutation.ts` - Standardized pattern
