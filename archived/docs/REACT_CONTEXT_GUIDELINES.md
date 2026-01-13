# React v18 Context Guidelines Quick Reference

**Enterprise-Grade React Context Patterns for Concurrent Mode**

---

## 40 Guidelines Applied

### Core Patterns (#1-20) - COMPLETED ✅
1. ✅ Cross-cutting concerns justify context
2. ✅ Narrow interface surface area
3. ✅ **Split state/action contexts**
4. ✅ Export only custom hooks, not raw contexts
5. ✅ Fail-fast when provider missing
6. ✅ High-frequency state in refs
7. ✅ **Explicit memoization of values**
8. ✅ `useContext` only in custom hooks
9. ✅ Co-locate types with provider
10. ✅ **Stabilize callbacks with useCallback**
11. ✅ Strict TypeScript contracts
12. ✅ Document value stability guarantees
13. ✅ **Document provider responsibilities**
14. ✅ Consumers trust provider defaults
15. ✅ Cleanup in effect returns
16. ✅ Single source of truth
17. ✅ Explicit re-exports in barrel files
18. ✅ Test provider mounting/unmounting
19. ✅ Measure re-render impact
20. ✅ Lazy-initialize expensive computations

### Concurrent Mode (#21-40) - COMPLETED ✅
21. ✅ Assume interruptible renders
22. ✅ **Concurrent-safe values** (immutable)
23. ✅ **No mutations between renders** (enforced with `freezeInDev`)
24. ✅ **Expect double invocation in StrictMode**
25. ✅ **Use startTransition for non-urgent updates**
26. ✅ Separate urgent/non-urgent paths
27. ✅ No time-based coupling
28. ✅ Pure consumer functions
29. ⚠️ Suspense cascade safety (N/A - no Suspense yet)
30. ⚠️ Suspense containment zones (N/A - no Suspense yet)
31. ✅ No uncommitted state derivation
32. ✅ **useSyncExternalStore for external sources**
33. ✅ **Expose isPending for transitional UI**
34. ✅ Repeatable reads (no side effects)
35. ✅ No position performance guarantees
36. ✅ Isolate from frequent reconciliation
37. ✅ Automatic batching support
38. ✅ Concurrent-safe defaults
39. ✅ No control flow via provider presence
40. ✅ Compose with future React features

---

## Implementation Checklist

### For New Context Providers

```typescript
// 1. Split contexts (#3)
const StateContext = createContext<StateValue | undefined>(undefined);
const ActionsContext = createContext<ActionsValue | undefined>(undefined);

// 2. Create fail-fast hooks (#4, #5)
export function useMyState(): StateValue {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useMyState must be used within MyProvider');
  }
  return context;
}

export function useMyActions(): ActionsValue {
  const context = useContext(ActionsContext);
  if (!context) {
    throw new Error('useMyActions must be used within MyProvider');
  }
  return context;
}

// 3. Provider with memoization (#7, #10, #13)
export const MyProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState(initialState);
  const [isPending, startTransition] = useTransition(); // #25, #33
  
  // Memoize actions (#10)
  const refresh = useCallback(async () => {
    const data = await fetchData();
    startTransition(() => { // #25 - Non-urgent update
      setState(data);
    });
  }, []);
  
  // Memoize values with freezing (#7, #22-23)
  const stateValue = useMemo(
    () => freezeInDev({ state, isPending }), // #22-23 - Immutable
    [state, isPending]
  );
  
  const actionsValue = useMemo(
    () => freezeInDev({ refresh }),
    [refresh]
  );
  
  // Cleanup timers (#15, #24)
  useEffect(() => {
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer); // #24 - StrictMode safe
  }, [refresh]);
  
  return (
    <StateContext.Provider value={stateValue}>
      <ActionsContext.Provider value={actionsValue}>
        {children}
      </ActionsContext.Provider>
    </StateContext.Provider>
  );
};
```

### For External Store Subscriptions (#32)

```typescript
// Use useSyncExternalStore for external mutable sources
function useExternalValue() {
  const subscribe = useCallback((callback: () => void) => {
    externalSource.addEventListener('change', callback);
    return () => externalSource.removeEventListener('change', callback);
  }, []);
  
  const getSnapshot = useCallback(() => externalSource.getValue(), []);
  const getServerSnapshot = useCallback(() => defaultValue, []);
  
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

### For Non-Urgent Updates (#25-26, #33)

```typescript
const [isPending, startTransition] = useTransition();

const refresh = useCallback(async () => {
  const data = await fetchData();
  
  // Wrap non-urgent state updates
  startTransition(() => {
    setData(data);
  });
}, []);

// Expose isPending for UI
const stateValue = useMemo(
  () => ({ data, isPending }),
  [data, isPending]
);
```

---

## Common Patterns

### Pattern: External Mutable Store
**Problem**: Reading `window.innerWidth`, `navigator.onLine`, etc. causes tearing  
**Solution**: Wrap with `useSyncExternalStore` (#32)

```typescript
function useWindowSize() {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => ({ width: window.innerWidth, height: window.innerHeight }),
    () => ({ width: 1024, height: 768 }) // SSR fallback
  );
}
```

### Pattern: Non-Blocking Data Refresh
**Problem**: Data fetches freeze UI  
**Solution**: Use `startTransition` for non-urgent updates (#25-26)

```typescript
const refreshDashboard = useCallback(async () => {
  const cases = await fetchCases();
  startTransition(() => {
    setCases(cases); // UI stays responsive
  });
}, []);
```

### Pattern: Transitional UI Feedback
**Problem**: Users don't know background work is happening  
**Solution**: Expose `isPending` state (#33)

```tsx
const { data, isPending } = useDataState();

return (
  <>
    {isPending && <ProgressBar />} {/* Non-blocking indicator */}
    <DataTable data={data} />
  </>
);
```

### Pattern: Development Mutation Detection
**Problem**: Accidental mutations cause bugs  
**Solution**: Use `freezeInDev()` utility (#22-23)

```typescript
const stateValue = useMemo(
  () => freezeInDev({ items, isLoading }),
  [items, isLoading]
);
// Throws in dev if consumer tries: stateValue.items.push(newItem)
```

### Pattern: StrictMode-Safe Timers
**Problem**: Double invocation causes memory leaks  
**Solution**: Always return cleanup function (#24)

```typescript
useEffect(() => {
  const timer = setTimeout(() => doWork(), 1000);
  return () => clearTimeout(timer); // ✅ Cleanup
}, [doWork]);

// Track multiple timers in Set
const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());

useEffect(() => {
  return () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
  };
}, []);
```

---

## Anti-Patterns to Avoid

### ❌ Direct External Reads
```typescript
// BAD - Causes tearing
const isOnline = navigator.onLine;
```
```typescript
// GOOD - Concurrent-safe
const isOnline = useSyncExternalStore(
  (cb) => {
    window.addEventListener('online', cb);
    window.addEventListener('offline', cb);
    return () => {
      window.removeEventListener('online', cb);
      window.removeEventListener('offline', cb);
    };
  },
  () => navigator.onLine,
  () => true
);
```

### ❌ Blocking Data Updates
```typescript
// BAD - Blocks UI during fetch
const refresh = async () => {
  const data = await fetchData();
  setData(data); // Blocks user interactions
};
```
```typescript
// GOOD - Non-blocking update
const [isPending, startTransition] = useTransition();
const refresh = async () => {
  const data = await fetchData();
  startTransition(() => setData(data)); // UI stays responsive
};
```

### ❌ Mutable Context Values
```typescript
// BAD - Mutable array
const stateValue = useMemo(() => ({ items }), [items]);
// Consumer can mutate: stateValue.items.push(newItem)
```
```typescript
// GOOD - Frozen in dev
const stateValue = useMemo(
  () => freezeInDev({ items }),
  [items]
);
// Throws in dev if mutated
```

### ❌ Timer Without Cleanup
```typescript
// BAD - Memory leak in StrictMode
useEffect(() => {
  setInterval(() => refresh(), 60000);
}, [refresh]);
```
```typescript
// GOOD - Properly cleaned up
useEffect(() => {
  const timer = setInterval(() => refresh(), 60000);
  return () => clearInterval(timer);
}, [refresh]);
```

---

## Migration Checklist

- [ ] Split unified contexts into state/actions pairs (#3)
- [ ] Add fail-fast hooks with runtime guards (#5)
- [ ] Memoize all provider values (#7)
- [ ] Stabilize callbacks with useCallback (#10)
- [ ] Document provider responsibilities (#13)
- [ ] Add cleanup to all effects (#15, #24)
- [ ] Wrap external reads in useSyncExternalStore (#32)
- [ ] Use startTransition for non-urgent updates (#25-26)
- [ ] Expose isPending for transitional UI (#33)
- [ ] Apply freezeInDev to context values (#22-23)
- [ ] Verify StrictMode compatibility (run app in StrictMode) (#24)
- [ ] Test concurrent rendering (use React DevTools Profiler)

---

## Tools & Utilities

### Immutability Enforcement
**File**: [`contexts/utils/immutability.ts`](./frontend/src/contexts/utils/immutability.ts)

```typescript
import { freezeInDev } from '@/contexts/utils/immutability';

// In provider:
const stateValue = useMemo(
  () => freezeInDev({ data, isLoading }),
  [data, isLoading]
);
```

### External Store Hook Template
```typescript
function useExternalStore<T>(
  subscribe: (callback: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot: () => T
): T {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
```

---

## Reference

- [React 18 Documentation](https://react.dev/blog/2022/03/29/react-v18)
- [useSyncExternalStore](https://react.dev/reference/react/useSyncExternalStore)
- [useTransition](https://react.dev/reference/react/useTransition)
- [Concurrent Features](https://react.dev/blog/2022/03/29/react-v18#new-feature-concurrent-rendering)
- [StrictMode](https://react.dev/reference/react/StrictMode)

---

**Last Updated**: 2025-01-XX  
**Status**: All 40 guidelines implemented ✅
