# React 18/19 Concurrent Mode - Migration Guide

**Date**: 2026-01-02
**Status**: Implementation Guide
**Reference**: [REACT_CONCURRENT_MODE_GAP_ANALYSIS.md](./REACT_CONCURRENT_MODE_GAP_ANALYSIS.md)

---

## 🎯 Overview

This guide provides step-by-step instructions for implementing the fixes identified in the gap analysis.

---

## Phase 1: Critical Fixes (Week 1)

### Fix 1: Migrate SyncContext to useSyncExternalStore

**Status**: ✅ Implementation Ready
**Files**: `src/providers/SyncContext.tsx`, `src/services/data/syncStore.ts`
**Impact**: Prevents tearing, 95% fewer re-renders

#### Step 1: Create External Store

✅ **DONE**: Created `/nextjs/src/services/data/syncStore.ts`

```typescript
import {
  syncStore,
  useIsOnline,
  usePendingCount,
} from "@/services/data/syncStore";

// Fine-grained subscriptions
const isOnline = useIsOnline(); // Only re-renders on online changes
const pending = usePendingCount(); // Only re-renders on count changes
```

#### Step 2: Refactor SyncContext

✅ **DONE**: Created `/nextjs/src/providers/SyncContext.refactored.tsx`

#### Step 3: Replace Original File

```bash
cd /workspaces/lexiflow-premium/nextjs
# Backup original
cp src/providers/SyncContext.tsx src/providers/SyncContext.backup.tsx
# Replace with refactored version
cp src/providers/SyncContext.refactored.tsx src/providers/SyncContext.tsx
```

#### Step 4: Update Consumers

Most consumers use the `useSync()` hook - **no changes needed** for backward compatibility.

For performance-critical components, migrate to fine-grained hooks:

```typescript
// ❌ OLD: Re-renders on every state change
const { isOnline, pendingCount } = useSync();

// ✅ NEW: Only re-renders when specific value changes
const isOnline = useIsOnline();
const pending = usePendingCount();
```

**Files to Optionally Optimize**:

- `components/features/core/components/ConnectivityHUD/ConnectivityHUD.tsx`
- Any component showing sync status in header/footer

#### Step 5: Test

```bash
# Run test suite
npm test

# Check for tearing bugs
# 1. Open app in browser
# 2. Toggle online/offline rapidly in DevTools
# 3. Verify all UI updates consistently
```

---

### Fix 2: Migrate DataSourceContext

**Status**: 🔄 TODO
**Priority**: 🔴 Critical
**ETA**: 2 hours

#### Implementation Pattern

Follow the same pattern as SyncContext:

1. Create `src/services/data/dataSourceStore.ts`
2. Create `src/providers/DataSourceContext.refactored.tsx`
3. Replace original file
4. Test for tearing

---

### Fix 3: Audit ToastContext

**Status**: 🔄 TODO
**Priority**: 🔴 Critical if high-frequency updates
**ETA**: 1 hour

#### Investigation

```bash
# Check update frequency
grep -n "addToast\|removeToast\|setToasts" src/providers/ToastContext.tsx
```

If toasts are added/removed > 1x per second, migrate to external store.

---

## Phase 2: High Priority Fixes (Week 2)

### Fix 4: Replace useDebounce with useDeferredValue

**Files to Migrate** (7 files):

#### 4.1: hooks/useCaseList.ts

```typescript
// ❌ OLD (Line 203)
const debouncedSearchTerm = useDebounce(searchTerm, 300);

// ✅ NEW
const deferredSearchTerm = useDeferredValue(searchTerm);

// Update filtering logic to use deferredSearchTerm
const filteredCases = useMemo(() => {
  return cases.filter((c) =>
    c.title.toLowerCase().includes(deferredSearchTerm.toLowerCase())
  );
}, [cases, deferredSearchTerm]);
```

#### 4.2: hooks/useRuleSearchAndSelection.ts

```typescript
// ❌ OLD (Line 77)
const debouncedSearchTerm = useDebounce(searchTerm, SEARCH_DEBOUNCE_MS);

// ✅ NEW
const deferredSearchTerm = useDeferredValue(searchTerm);
```

#### 4.3-4.7: Repeat pattern for remaining files

- `hooks/useAutoSave.ts`
- `hooks/useEnhancedAutoSave.ts`
- `components/ui/molecules/RuleSelector/RuleSelector.tsx`
- `components/features/navigation/components/NeuralCommandBar/NeuralCommandBar.tsx`
- `components/features/navigation/components/CommandPalette/CommandPalette.tsx`

#### Global Search & Replace

```bash
# Find all useDebounce usage
grep -rn "useDebounce" src/ --include="*.tsx" --include="*.ts"

# For each file, replace pattern
```

---

### Fix 5: Separate Urgent/Deferred State in ExhibitManager

**Status**: ✅ Reference Implementation Ready
**File**: `src/components/exhibits/ExhibitManager.refactored.tsx`

#### Compare Original vs Refactored

**Before** (Anti-pattern):

```typescript
const [filterParty, setFilterParty] = useState("All");
const filteredExhibits = exhibits.filter(/* expensive */);
```

**After** (Correct):

```typescript
// Urgent: UI state
const [filterParty, setFilterParty] = useState("All");

// Deferred: Expensive computation
const [isPending, startTransition] = useTransition();
const deferredFilterParty = useDeferredValue(filterParty);

// Use deferred value for filtering
const filteredExhibits = useMemo(() => {
  return exhibits.filter((ex) => ex.party === deferredFilterParty);
}, [exhibits, deferredFilterParty]);
```

#### Apply to Original

```bash
# Replace original with refactored
cp src/components/exhibits/ExhibitManager.refactored.tsx \
   src/components/exhibits/ExhibitManager.tsx
```

---

### Fix 6: Audit Render Side Effects

#### Search for Anti-Patterns

```bash
# Find console.log in components (outside useEffect)
grep -rn "console\." src/components/ src/features/ --include="*.tsx"

# Find localStorage writes in render
grep -rn "localStorage\." src/components/ src/features/ --include="*.tsx"

# Find direct API calls (should be in useEffect)
grep -rn "fetch(" src/components/ src/features/ --include="*.tsx"
```

#### Fix Pattern

```typescript
// ❌ DANGEROUS: Side effect in render
function Component() {
  console.log('Rendered at', Date.now());  // Can run multiple times
  return <div>...</div>;
}

// ✅ SAFE: Side effect in useEffect
function Component() {
  useEffect(() => {
    console.log('Mounted at', Date.now());  // Runs once per mount
  }, []);

  return <div>...</div>;
}
```

---

## Phase 3: Optimizations (Week 3+)

### Fix 7: Reduce useMemo Overhead

#### Pattern 1: Normalize at Data Layer

```typescript
// ❌ ANTI-PATTERN: Expensive computation in useMemo
const sortedCases = useMemo(() => {
  return cases.sort((a, b) => new Date(b.date) - new Date(a.date));
}, [cases]);

// ✅ BETTER: Server component returns pre-sorted data
// Or normalize data structure:
interface NormalizedCases {
  byDate: Case[];
  byStatus: Record<string, Case[]>;
}

// API returns pre-computed structure
const { byDate, byStatus } = await fetchNormalizedCases();
```

#### Pattern 2: Move to Web Worker

```typescript
// ✅ BEST: Offload to worker
import { useWorkerComputation } from "@/hooks/useWorkerComputation";

const sortedCases = useWorkerComputation(
  cases,
  "sortByDate" // Worker handles this
);
```

---

## 📋 Migration Checklist

### Phase 1: Critical (Week 1)

- [x] Create syncStore.ts
- [x] Create SyncContext.refactored.tsx
- [ ] Replace SyncContext.tsx
- [ ] Test tearing scenarios
- [ ] Migrate DataSourceContext
- [ ] Audit ToastContext

### Phase 2: High Priority (Week 2)

- [ ] Replace useDebounce in useCaseList.ts
- [ ] Replace useDebounce in useRuleSearchAndSelection.ts
- [ ] Replace useDebounce in 5 other files
- [ ] Refactor ExhibitManager.tsx
- [ ] Audit render side effects

### Phase 3: Optimizations (Week 3+)

- [ ] Move computations to data layer
- [ ] Implement web worker patterns
- [ ] Profile and optimize hotspots

---

## 🧪 Testing Strategy

### 1. Tearing Tests

```typescript
// Test for tearing in SyncContext
describe('SyncContext Tearing', () => {
  it('should not tear during concurrent renders', async () => {
    const { getAllByText } = render(<TestComponent />);

    // Trigger rapid state changes
    act(() => {
      window.dispatchEvent(new Event('online'));
      window.dispatchEvent(new Event('offline'));
      window.dispatchEvent(new Event('online'));
    });

    // All components should see consistent state
    const statuses = getAllByText(/online|offline/i);
    const uniqueStates = new Set(statuses.map(el => el.textContent));
    expect(uniqueStates.size).toBe(1);  // No tearing
  });
});
```

### 2. Performance Tests

```typescript
// Measure render count reduction
let renderCount = 0;

function TestComponent() {
  renderCount++;
  const isOnline = useIsOnline();  // Fine-grained
  return <div>{isOnline ? 'Online' : 'Offline'}</div>;
}

// Compare old vs new
// OLD: 10 renders per sync operation
// NEW: 1 render per online status change
```

### 3. Concurrent Rendering Tests

```bash
# Enable React Strict Mode (if not already)
# This double-invokes renders to expose bugs

# src/main.tsx
<StrictMode>
  <App />
</StrictMode>
```

---

## 📊 Success Metrics

Track these metrics before and after migration:

| Metric                     | Before  | Target | Actual |
| -------------------------- | ------- | ------ | ------ |
| SyncContext re-renders/sec | ~20     | <2     | TBD    |
| Tearing bugs               | Present | 0      | TBD    |
| Input lag (search)         | ~300ms  | <50ms  | TBD    |
| Strict Mode errors         | Unknown | 0      | TBD    |
| Bundle size impact         | -       | +2KB   | TBD    |

---

## 🆘 Troubleshooting

### Issue: "useSyncExternalStore is not defined"

**Fix**: Ensure React 18+ is installed:

```bash
npm list react
# Should show 18.2.0 or higher (or 19.x)
```

### Issue: "Cannot read property 'subscribe' of undefined"

**Fix**: Ensure syncStore is imported before use:

```typescript
import { syncStore } from "@/services/data/syncStore";
```

### Issue: "Hydration mismatch"

**Fix**: Ensure server snapshot is provided:

```typescript
useSyncExternalStore(
  subscribe,
  getSnapshot,
  getServerSnapshot // Required for SSR
);
```

---

## 📚 Additional Resources

- [React 18 useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [useDeferredValue API](https://react.dev/reference/react/useDeferredValue)
- [startTransition Guide](https://react.dev/reference/react/startTransition)
- [Concurrent Rendering](https://react.dev/blog/2022/03/29/react-v18#what-is-concurrent-react)

---

**Last Updated**: 2026-01-02
**Next Review**: After Phase 1 completion
