# EA-2: Frontend State Management Architecture Analysis

**Agent:** EA-2
**Date:** 2025-12-16
**Domain:** Frontend State Management
**Status:** COMPLETE

---

## Executive Summary

This analysis traces all function calls and data flows through the LexiFlow frontend state management layer, identifying the custom React Query-like implementation (QueryClient), offline-first mutation queue (SyncEngine), context providers, and state management hooks.

**Key Findings:**
- ✅ Well-architected custom query client with LRU caching
- ⚠️ Multiple unbounded data structures pose memory leak risks
- ⚠️ Duplicative listener pattern implementations across 4+ files
- ⚠️ Inconsistent localStorage access patterns (direct vs. utility)
- ⚠️ Potential listener cleanup issues in long-running sessions

---

## State Management Architecture

```mermaid
graph TB
    subgraph "Application Layer"
        Components[React Components]
        CustomHooks[Custom Hooks]
    end

    subgraph "State Management Hooks"
        useQuery[useQuery]
        useMutation[useMutation]
        useDomainData[useDomainData Hooks]
        useGlobalQueryStatus[useGlobalQueryStatus]
        useAppController[useAppController]
        useAutoSave[useAutoSave]
        useHistory[useHistory]
        useModal[useModal]
        useSessionStorage[useSessionStorage]
        useDebounce[useDebounce]
    end

    subgraph "Core State Layer - QueryClient"
        QC[QueryClient Instance]
        QCCache[Cache: Map&lt;string, QueryState&gt;<br/>MAX: 100 entries<br/>LRU Eviction]
        QCListeners[Listeners: Map&lt;string, Set&lt;fn&gt;&gt;<br/>⚠️ UNBOUNDED]
        QCInflight[Inflight: Map&lt;string, Promise&gt;<br/>Auto-cleanup]
        QCAbort[AbortControllers: Map&lt;string, AC&gt;<br/>Auto-cleanup]
        QCGlobal[GlobalListeners: Set&lt;fn&gt;<br/>⚠️ UNBOUNDED]

        QC --> QCCache
        QC --> QCListeners
        QC --> QCInflight
        QC --> QCAbort
        QC --> QCGlobal
    end

    subgraph "Offline Sync Layer - SyncEngine"
        SE[SyncEngine Static Object]
        SEQueue[Queue: localStorage Array<br/>Persistent]
        SECache[ProcessedCache: LinearHash<br/>⚠️ UNBOUNDED]

        SE --> SEQueue
        SE --> SECache
    end

    subgraph "Context Providers"
        ThemeCtx[ThemeContext<br/>localStorage: color-theme]
        WindowCtx[WindowContext<br/>windows: WindowInstance[]<br/>⚠️ UNBOUNDED]
        SyncCtx[SyncContext<br/>Queue Processor]
        DataSourceCtx[DataSourceContext<br/>localStorage: data source]
        ToastCtx[ToastContext<br/>toasts: Toast[]<br/>queueRef: ⚠️ UNBOUNDED]
    end

    subgraph "Repository Layer"
        Repo[Repository Base Class]
        RepoCache[LRU Cache: 100 capacity<br/>✅ BOUNDED]
        RepoListeners[Listeners: Set&lt;fn&gt;<br/>⚠️ UNBOUNDED]
        RepoORM[MicroORM]

        Repo --> RepoCache
        Repo --> RepoListeners
        Repo --> RepoORM
    end

    subgraph "Storage Layer"
        LocalStorage[(localStorage)]
        SessionStorage[(sessionStorage)]
        IndexedDB[(IndexedDB)]
        StorageUtils[StorageUtils Facade]
    end

    %% Component to Hook connections
    Components --> useQuery
    Components --> useMutation
    Components --> useDomainData
    Components --> useGlobalQueryStatus
    Components --> useAppController
    Components --> useAutoSave
    Components --> useHistory
    Components --> useModal
    Components --> useSessionStorage
    Components --> useDebounce

    %% Hook to Core State connections
    useQuery --> QC
    useMutation --> QC
    useDomainData --> useQuery
    useGlobalQueryStatus --> QCGlobal
    useAppController --> useSessionStorage
    useAutoSave --> useDebounce

    %% QueryClient operations
    QC -->|fetch/invalidate/setQueryData| QCCache
    QC -->|subscribe/notify| QCListeners
    QC -->|deduplication| QCInflight
    QC -->|cancellation| QCAbort
    QC -->|global status| QCGlobal

    %% Mutation to Sync flow
    useMutation -->|enqueue| SE
    SyncCtx --> SE
    SE -->|persist| SEQueue
    SE -->|dedupe| SECache

    %% Context provider connections
    Components --> ThemeCtx
    Components --> WindowCtx
    Components --> SyncCtx
    Components --> DataSourceCtx
    Components --> ToastCtx

    SyncCtx -->|processQueue| SE
    ToastCtx -->|priority queue| ToastCtx

    %% Repository connections
    QC -->|via DataService| Repo
    Repo --> RepoCache
    Repo --> RepoListeners
    RepoORM --> IndexedDB

    %% Storage connections
    StorageUtils --> LocalStorage
    ThemeCtx --> LocalStorage
    WindowCtx --> LocalStorage
    DataSourceCtx --> LocalStorage
    SE --> StorageUtils
    useSessionStorage --> SessionStorage

    %% Data flow annotations
    classDef bounded fill:#90EE90,stroke:#006400,stroke-width:2px
    classDef unbounded fill:#FFB6C1,stroke:#8B0000,stroke-width:2px
    classDef warning fill:#FFD700,stroke:#FF8C00,stroke-width:2px

    class QCCache,RepoCache,useHistory bounded
    class QCListeners,QCGlobal,RepoListeners,SECache,WindowCtx,ToastCtx unbounded
    class SE,QC warning
```

---

## Detailed Function Call Traces

### 1. Query Flow: Component → IndexedDB

```
Component.render()
  └─> useQuery(key, fn, options)
      ├─> useState(initialState)
      ├─> queryClient.subscribe(key, setState)
      │   ├─> hashKey(key) → stableStringify()
      │   ├─> listeners.get(hashedKey) || listeners.set(hashedKey, new Set())
      │   └─> touch(hashedKey) [LRU update]
      │
      └─> queryClient.fetch(key, fn, staleTime, force)
          ├─> hashKey(key)
          ├─> cache.get(hashedKey) [Check staleness]
          ├─> inflight.has(hashedKey) [Deduplication]
          ├─> new AbortController()
          ├─> notify(hashedKey, { isFetching: true })
          ├─> notifyGlobal()
          │   └─> globalListeners.forEach(listener => listener({isFetching}))
          │
          ├─> fn(signal) → DataService.domain.method()
          │   └─> Repository.getAll()
          │       ├─> safeExecute(operation)
          │       ├─> orm.findAll() → MicroORM
          │       │   └─> IndexedDB.getAll(storeName)
          │       └─> [Result]
          │
          ├─> fastDeepEqual(cached.data, newData) [Optimize re-renders]
          ├─> cache.set(hashedKey, state)
          ├─> enforceLimits() [LRU eviction if size > 100]
          ├─> notify(hashedKey, state)
          │   └─> listeners.get(hashedKey)?.forEach(listener => listener(state))
          ├─> notifyGlobal()
          ├─> inflight.delete(hashedKey)
          └─> abortControllers.delete(hashedKey)
```

### 2. Mutation Flow: Component → SyncEngine → Queue

```
Component.handleSubmit()
  └─> useMutation(mutationFn, options)
      └─> mutate(variables)
          ├─> setStatus('pending')
          ├─> onMutate(variables) [Optimistic update]
          │
          ├─> mutationFn(variables)
          │   └─> DataService.domain.add(item)
          │       └─> IntegratedRepository.add(item)
          │           ├─> super.add(item) → Repository.add()
          │           │   ├─> orm.create(item)
          │           │   │   └─> IndexedDB.add(storeName, item)
          │           │   ├─> cache.put(id, item) [LRU cache]
          │           │   └─> notify(item)
          │           │       └─> listeners.forEach(l => l(item))
          │           │
          │           └─> IntegrationOrchestrator.publish(EVENT_TYPE, payload)
          │               └─> [Fire side-effects asynchronously]
          │
          ├─> setData(result)
          ├─> setStatus('success')
          ├─> onSuccess(result, variables, context)
          ├─> onSettled(result, error, variables, context)
          │
          └─> invalidateKeys.forEach(k => queryClient.invalidate(k))
              └─> cache.keys().filter(key => key.includes(pattern))
                  └─> cache.set(key, { ...state, dataUpdatedAt: 0 })
```

### 3. Offline Sync Flow: Network Reconnection

```
window.addEventListener('online')
  └─> SyncContext.handleOnline()
      └─> SyncContext.processQueue()
          ├─> SyncEngine.peek() → StorageUtils.get(QUEUE_KEY)
          │   └─> localStorage.getItem('lexiflow_sync_queue')
          │
          ├─> [Check mutation.status === 'failed']
          ├─> SyncEngine.update(id, { status: 'syncing' })
          │   └─> StorageUtils.set(QUEUE_KEY, queue)
          │
          ├─> MUTATION_HANDLERS[type](payload)
          │   └─> DataService.domain.method(payload)
          │       └─> [Same as Mutation Flow above]
          │
          ├─> [Success Path]
          │   ├─> SyncEngine.dequeue()
          │   │   ├─> queue.shift()
          │   │   ├─> processedCache.set(item.id, true) [LinearHash]
          │   │   └─> StorageUtils.set(QUEUE_KEY, queue)
          │   └─> processQueue() [Recursive - process next]
          │
          └─> [Error Path]
              ├─> mutation.retryCount++
              ├─> [If retryCount >= MAX_RETRIES]
              │   ├─> SyncEngine.update(id, { status: 'failed' })
              │   └─> setSyncStatus('error')
              └─> [Else]
                  ├─> SyncEngine.update(id, { status: 'pending', retryCount++ })
                  └─> setTimeout(() => processQueue(), exponentialBackoff)
```

### 4. Context Provider Data Flows

#### ThemeContext Flow:
```
ThemeProvider.mount()
  └─> useState('light')
  └─> useEffect(() => {
      ├─> localStorage.getItem('color-theme')
      ├─> setMode(stored || systemPreference)
      └─> [Apply CSS classes to document.documentElement]
  }, [])

toggleTheme()
  ├─> setMode(prev => prev === 'light' ? 'dark' : 'light')
  └─> localStorage.setItem('color-theme', newMode)
```

#### WindowContext Flow:
```
openWindow(id, title, component)
  ├─> windows.find(w => w.id === id) [Dedupe]
  ├─> [Calculate position with stagger: offset = (length % 10) * 30]
  ├─> setWindows([...prev, newWindow])
  └─> setMaxZIndex(prev => prev + 1)

handleDragStart(e, id, x, y)
  ├─> dragRef.current = { id, startX, startY, initialX, initialY }
  ├─> bringToFront(id)
  │   └─> setWindows(prev => prev.map(w => w.id === id ? {...w, zIndex: maxZ+1} : w))
  └─> [addEventListener: mousemove, mouseup]
      └─> [Update position with bounds checking]
```

#### ToastContext Flow:
```
addToast(message, type)
  ├─> [Dedupe: Check toasts & queueRef for duplicate]
  ├─> queueRef.current.push(newToast)
  └─> processQueue()
      ├─> [If toasts.length < MAX_VISIBLE_TOASTS]
      ├─> queueRef.sort((a,b) => PRIORITY_MAP comparison)
      ├─> nextToast = queueRef.shift()
      ├─> setToasts([...prev, nextToast])
      └─> setTimeout(() => removeToast(id), duration)

useEffect(() => processQueue(), [toasts.length])
```

---

## Duplicative Code Patterns

### 1. LRU Cache Implementation (2 instances)

**Location 1: `/home/user/lexiflow-premium/frontend/services/queryClient.ts:93-109`**
```typescript
private touch(key: string) {
  const value = this.cache.get(key);
  if (value) {
    this.cache.delete(key);
    this.cache.set(key, value);
  }
}

private enforceLimits() {
  if (this.cache.size > MAX_CACHE_SIZE) {
    const oldestKey = this.cache.keys().next().value;
    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.listeners.delete(oldestKey);
    }
  }
}
```

**Location 2: `/home/user/lexiflow-premium/frontend/services/core/Repository.ts:7-41`**
```typescript
class LRUCache<T> {
  private capacity: number;
  private cache: Map<string, T>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: string): T | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, value);
  }
}
```

**Recommendation:** Extract to shared utility `/home/user/lexiflow-premium/frontend/utils/datastructures/lruCache.ts`

---

### 2. Listener Pattern Implementation (4+ instances)

**Location 1: `/home/user/lexiflow-premium/frontend/services/queryClient.ts:68,71`**
```typescript
private listeners: Map<string, Set<(state: QueryState<any>) => void>> = new Map();
private globalListeners: Set<(status: { isFetching: number }) => void> = new Set();
```

**Location 2: `/home/user/lexiflow-premium/frontend/services/core/Repository.ts:47`**
```typescript
private listeners: Set<Listener<T>> = new Set();
```

**Location 3: `/home/user/lexiflow-premium/frontend/context/WindowContext.tsx:42-44`**
```typescript
const [windows, setWindows] = useState<WindowInstance[]>([]);
// Implicit listener pattern via React state + subscribers
```

**Location 4: `/home/user/lexiflow-premium/frontend/context/ToastContext.tsx:41-43`**
```typescript
const [toasts, setToasts] = useState<Toast[]>([]);
const queueRef = useRef<Toast[]>([]);
```

**Recommendation:** Create a shared `EventEmitter` or `Observable` utility class.

---

### 3. localStorage Access Patterns (Inconsistent)

**Centralized Pattern:** `/home/user/lexiflow-premium/frontend/utils/storage.ts:9-36`
```typescript
export const StorageUtils = {
  get: <T>(key: string, defaultData: T): T => { /* ... */ },
  set: <T>(key: string, value: T): void => { /* ... */ }
}
```

**Direct Access Locations:**
- `/home/user/lexiflow-premium/frontend/context/ThemeContext.tsx:39,54`
- `/home/user/lexiflow-premium/frontend/context/WindowContext.tsx:50,58`
- `/home/user/lexiflow-premium/frontend/context/DataSourceContext.tsx:21,35`

**Recommendation:** Enforce use of `StorageUtils` facade throughout codebase for consistency and error handling.

---

### 4. Stable Stringify / Deep Equal Logic

**Location: `/home/user/lexiflow-premium/frontend/services/queryClient.ts:27-64`**
```typescript
function fastDeepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
  try {
    return stableStringify(obj1) === stableStringify(obj2);
  } catch (e) {
    console.warn("Deep equal failed due to circular structure");
    return false;
  }
}

function stableStringify(obj: any, seen: WeakSet<object> = new WeakSet()): string {
  // ... 40 lines of recursive stringify logic
}
```

**Recommendation:** Extract to `/home/user/lexiflow-premium/frontend/utils/comparison.ts` for reuse in Repository and other caching layers.

---

### 5. Queue Processing Logic (2 implementations)

**Location 1: `/home/user/lexiflow-premium/frontend/context/SyncContext.tsx:56-123`**
- Processes mutation queue with exponential backoff
- Retries with MAX_RETRIES=3

**Location 2: `/home/user/lexiflow-premium/frontend/context/ToastContext.tsx:45-72`**
- Processes toast queue with priority sorting
- Max visible limit enforcement

**Recommendation:** Create abstract `QueueProcessor` base class with configurable retry/priority strategies.

---

## Open-Ended Data Segments (Memory Leak Risks)

### ⚠️ CRITICAL - Unbounded Growth

#### 1. QueryClient.listeners
**File:** `/home/user/lexiflow-premium/frontend/services/queryClient.ts:68`
**Type:** `Map<string, Set<(state: QueryState<any>) => void>>`
**Growth:** Grows with unique query keys over application lifetime
**Risk:** High - In long-running sessions, stale listeners accumulate
**Cleanup:** Unsubscribe functions exist but may not be called consistently
**Recommendation:** Implement periodic garbage collection for listeners with no active subscribers

```typescript
// Current Implementation
subscribe(key: QueryKey, listener: (state: QueryState<any>) => void) {
  const hashedKey = this.hashKey(key);
  if (!this.listeners.has(hashedKey)) {
    this.listeners.set(hashedKey, new Set());
  }
  this.listeners.get(hashedKey)!.add(listener);

  return () => {
    const listeners = this.listeners.get(hashedKey);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) this.listeners.delete(hashedKey); // ✅ Good cleanup
    }
  };
}
```

**Mitigation:** Cleanup is present, but relies on components calling unsubscribe. Risk if components unmount improperly.

---

#### 2. QueryClient.globalListeners
**File:** `/home/user/lexiflow-premium/frontend/services/queryClient.ts:71`
**Type:** `Set<(status: { isFetching: number }) => void>`
**Growth:** Grows with each component using `useGlobalQueryStatus`
**Risk:** Medium - Limited to components using global status hook
**Cleanup:** Unsubscribe returns cleanup function
**Recommendation:** Monitor for component unmount edge cases

---

#### 3. Repository.listeners
**File:** `/home/user/lexiflow-premium/frontend/services/core/Repository.ts:47`
**Type:** `Set<Listener<T>>`
**Growth:** Per-repository instance, grows with subscriptions
**Risk:** Medium - One Set per domain (cases, documents, etc.)
**Cleanup:** Unsubscribe function provided
**Recommendation:** Add `clearStaleListeners()` method for manual cleanup

---

#### 4. SyncEngine.processedCache
**File:** `/home/user/lexiflow-premium/frontend/services/syncEngine.ts:17`
**Type:** `LinearHash<string, boolean>`
**Growth:** Grows with every mutation processed (never cleared)
**Risk:** HIGH - No eviction policy, accumulates forever
**Current State:** Only used for deduplication on enqueue
**Recommendation:** Add TTL-based eviction or max size limit (e.g., 10,000 entries)

```typescript
// Problematic code
const processedCache = new LinearHash<string, boolean>();

// In dequeue():
if(item) processedCache.set(item.id, true); // ⚠️ Never removed!
```

**Suggested Fix:**
```typescript
const processedCache = new LinearHash<string, { timestamp: number }>();
const MAX_PROCESSED_CACHE_SIZE = 10000;
const PROCESSED_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

// Add cleanup in dequeue or periodic background task
```

---

#### 5. WindowContext.windows
**File:** `/home/user/lexiflow-premium/frontend/context/WindowContext.tsx:43`
**Type:** `WindowInstance[]`
**Growth:** Grows with each unique window opened
**Risk:** Medium - Windows are removed on close, but accumulates if users don't close
**Cleanup:** `closeWindow()` filters out, but relies on user action
**Recommendation:** Add "Close All" functionality or max window limit (e.g., 20)

---

#### 6. ToastContext.queueRef
**File:** `/home/user/lexiflow-premium/frontend/context/ToastContext.tsx:42`
**Type:** `Toast[]`
**Growth:** Grows if toasts are created faster than displayed
**Risk:** Low-Medium - Auto-removed after display, but queue can grow during burst events
**Recommendation:** Add max queue size limit (e.g., 100) with FIFO eviction

```typescript
const MAX_QUEUE_SIZE = 100;

const addToast = useCallback((message: string, type: ToastType) => {
  // ... existing dedupe logic

  queueRef.current.push(newToast);

  // Add eviction
  if (queueRef.current.length > MAX_QUEUE_SIZE) {
    queueRef.current.shift(); // Drop oldest queued toast
  }

  processQueue();
}, [toasts, processQueue]);
```

---

### ✅ BOUNDED - No Risk

#### 1. QueryClient.cache
**File:** `/home/user/lexiflow-premium/frontend/services/queryClient.ts:67`
**Type:** `Map<string, QueryState<any>>`
**Size Limit:** `MAX_CACHE_SIZE = 100`
**Eviction:** LRU via `enforceLimits()`
**Status:** ✅ Safe

---

#### 2. Repository.cache
**File:** `/home/user/lexiflow-premium/frontend/services/core/Repository.ts:46,51`
**Type:** `LRUCache<T>`
**Size Limit:** `capacity = 100`
**Eviction:** LRU in `put()` method
**Status:** ✅ Safe

---

#### 3. useHistory.historyRef
**File:** `/home/user/lexiflow-premium/frontend/hooks/useHistory.ts:37`
**Type:** `HistoryCommand<T>[]`
**Size Limit:** `maxHistory = 50`
**Eviction:** Array shift on overflow
**Status:** ✅ Safe

---

## Performance Considerations

### 1. Stale Closure Risk in Refs
**Files:**
- `/home/user/lexiflow-premium/frontend/hooks/useAutoSave.ts:26-29`
- `/home/user/lexiflow-premium/frontend/hooks/useHistory.ts:37-38`
- `/home/user/lexiflow-premium/frontend/context/SyncContext.tsx:48`

**Pattern:**
```typescript
const fnRef = useRef(fn);
useEffect(() => { fnRef.current = fn; }, [fn]);
```

**Status:** ✅ Correct pattern - refs updated in useEffect to avoid stale closures

---

### 2. Deep Equality Checks
**File:** `/home/user/lexiflow-premium/frontend/services/queryClient.ts:174`

**Pattern:**
```typescript
if (currentCache && fastDeepEqual(currentCache.data, data) && currentCache.status === 'success') {
  // Skip update if data unchanged
  return currentCache.data;
}
```

**Status:** ✅ Good optimization to prevent unnecessary re-renders
**Risk:** `stableStringify()` can be expensive for large objects
**Recommendation:** Add size threshold before deep comparison (e.g., skip if > 1MB)

---

### 3. Request Deduplication
**File:** `/home/user/lexiflow-premium/frontend/services/queryClient.ts:151-153`

**Pattern:**
```typescript
if (this.inflight.has(hashedKey)) {
  return this.inflight.get(hashedKey);
}
```

**Status:** ✅ Excellent deduplication prevents redundant network calls

---

## Integration with Data Layer

### DataService Facade Integration
**File:** `/home/user/lexiflow-premium/frontend/services/dataService.ts:93-100`

```typescript
export const DataService = {
  cases: useBackendApi ? apiServices.cases : new IntegratedCaseRepository(),
  docket: useBackendApi ? apiServices.docket : new IntegratedDocketRepository(),
  // ... 20+ domain services
}
```

**Integration Pattern:**
```
useQuery → QueryClient.fetch → DataService.domain.method → Repository/API → Data Source
```

**Status:** ✅ Clean abstraction allows backend/IndexedDB switching

---

### Integration Events
**File:** `/home/user/lexiflow-premium/frontend/services/integrationOrchestrator.ts:18-150`

**Pattern:**
```typescript
class IntegratedCaseRepository extends CaseRepository {
  add = async (item: Case): Promise<Case> => {
    const result = await super.add(item);
    IntegrationOrchestrator.publish(SystemEventType.CASE_CREATED, { caseData: result });
    return result;
  }
}
```

**Status:** ✅ Event-driven architecture decouples modules
**Risk:** No error handling if `publish()` throws
**Recommendation:** Wrap in try-catch, fire-and-forget semantics

---

## State Persistence Strategies

| Layer | Strategy | Storage | Persistence |
|-------|----------|---------|-------------|
| QueryClient Cache | In-memory Map | RAM | Session (lost on reload) |
| Repository Cache | In-memory LRU | RAM | Session (lost on reload) |
| SyncEngine Queue | localStorage | Disk | Persistent across sessions |
| ThemeContext | localStorage | Disk | Persistent |
| WindowContext | localStorage (settings only) | Disk | Settings persist, windows don't |
| DataSourceContext | localStorage | Disk | Persistent |
| SessionStorage | sessionStorage | Disk | Tab-specific, lost on close |
| Repository Data | IndexedDB | Disk | Persistent, structured |

---

## Recommended Improvements

### Priority 1 - Memory Leak Prevention

1. **Add cleanup to SyncEngine.processedCache**
   ```typescript
   // Add to syncEngine.ts
   const MAX_PROCESSED = 10000;
   const PROCESSED_TTL = 86400000; // 24h

   cleanupProcessedCache: () => {
     const now = Date.now();
     // Implement TTL-based cleanup
   }
   ```

2. **Add window limit to WindowContext**
   ```typescript
   const MAX_WINDOWS = 20;
   if (windows.length >= MAX_WINDOWS) {
     addToast('Maximum windows reached. Close some windows.', 'warning');
     return;
   }
   ```

3. **Add queue size limit to ToastContext**
   ```typescript
   const MAX_QUEUE_SIZE = 100;
   if (queueRef.current.length > MAX_QUEUE_SIZE) {
     queueRef.current.shift();
   }
   ```

### Priority 2 - Code Deduplication

4. **Extract LRU Cache to shared utility**
   - Create `/home/user/lexiflow-premium/frontend/utils/datastructures/lruCache.ts`
   - Refactor QueryClient and Repository to use shared implementation

5. **Standardize localStorage access**
   - Enforce `StorageUtils` usage via ESLint rule
   - Refactor direct `localStorage` calls in contexts

6. **Extract comparison utilities**
   - Create `/home/user/lexiflow-premium/frontend/utils/comparison.ts`
   - Export `fastDeepEqual`, `stableStringify`, `shallowEqual`

### Priority 3 - Monitoring

7. **Add state size monitoring**
   ```typescript
   // Add to QueryClient
   getMetrics(): {
     cacheSize: number;
     listenerCount: number;
     inflightCount: number;
     globalListenerCount: number;
   } {
     return {
       cacheSize: this.cache.size,
       listenerCount: Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0),
       inflightCount: this.inflight.size,
       globalListenerCount: this.globalListeners.size
     };
   }
   ```

8. **Add performance marks**
   ```typescript
   // In fetch() method
   performance.mark(`query-${hashedKey}-start`);
   // ... after fetch
   performance.mark(`query-${hashedKey}-end`);
   performance.measure(`query-${hashedKey}`, `query-${hashedKey}-start`, `query-${hashedKey}-end`);
   ```

---

## Conclusion

The LexiFlow frontend state management architecture demonstrates strong architectural patterns with a custom React Query-like implementation, offline-first sync capabilities, and clean separation of concerns. However, several unbounded data structures pose memory leak risks in long-running sessions, and duplicative code patterns indicate opportunities for consolidation.

**Overall Grade: B+**

**Strengths:**
- ✅ Clean abstraction layers (QueryClient, Repository, DataService)
- ✅ Offline-first architecture with sync queue
- ✅ Request deduplication and caching
- ✅ LRU eviction policies where implemented
- ✅ Event-driven integration architecture

**Weaknesses:**
- ⚠️ Unbounded listener maps in QueryClient and Repository
- ⚠️ SyncEngine.processedCache grows indefinitely
- ⚠️ Duplicative LRU cache implementations
- ⚠️ Inconsistent localStorage access patterns
- ⚠️ No state size monitoring or alerts

**Critical Action Items:**
1. Implement cleanup for SyncEngine.processedCache (HIGH PRIORITY)
2. Add listener garbage collection to QueryClient
3. Extract shared LRU cache utility
4. Add state size monitoring and alerts
5. Enforce StorageUtils usage for localStorage access
