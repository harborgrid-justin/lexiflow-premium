# SyncEngine Architecture Notes

**Task ID:** SE901A
**Agent:** TypeScript Architect
**Created:** 2026-01-11

## High-Level Design Decisions

### Modularization Strategy: Facade Pattern

**Decision:** Refactor 1031-LOC monolithic syncEngine.ts into 8 focused modules orchestrated by a facade.

**Rationale:**
1. **API Stability:** SyncContext.tsx depends on exact SyncEngine API. Facade pattern allows internal refactoring without breaking consumers.
2. **Separation of Concerns:** Cache, queue, sync, and utilities have distinct responsibilities. Splitting improves testability and maintainability.
3. **Single Responsibility Principle:** Each module has one clear purpose (SOLID principles).
4. **Testability:** Smaller modules easier to unit test in isolation.

### Module Boundaries

```
services/data/sync/
├── types/
│   └── syncTypes.ts          # Core type definitions (Mutation, CacheEntry)
├── config/
│   └── syncConfig.ts         # Configuration constants (TTL, retry limits, etc.)
├── utils/
│   └── patchGenerator.ts     # JSON Patch generation logic
├── cache/
│   └── cacheManager.ts       # Cache lifecycle, eviction, statistics
├── queue/
│   └── queueManager.ts       # Queue operations (FIFO, persistence)
├── sync/
│   ├── backendSync.ts        # Backend integration, retry logic
│   └── syncEngine.ts         # Main facade API
└── index.ts                   # Barrel export
```

### Dependency Graph

```
syncEngine.ts (facade)
    ├─> queueManager.ts
    │       ├─> syncTypes.ts
    │       ├─> syncConfig.ts
    │       ├─> patchGenerator.ts
    │       └─> cacheManager.ts
    ├─> cacheManager.ts
    │       ├─> syncTypes.ts
    │       └─> syncConfig.ts
    └─> backendSync.ts
            ├─> syncTypes.ts
            ├─> syncConfig.ts
            └─> queueManager.ts
```

**Key Principle:** No circular dependencies. Types/config are leaf nodes.

## Type System Strategies

### Strict Typing for Mutation Pipeline

```typescript
// syncTypes.ts
export interface Mutation {
  id: string;                              // UUID for idempotency
  type: string;                            // Mutation discriminator
  payload: unknown;                        // Flexible payload (runtime validated)
  patch?: unknown;                         // JSON Patch optimization
  timestamp: number;                       // Ordering + TTL
  status: "pending" | "syncing" | "failed"; // Explicit state machine
  retryCount: number;                      // Exponential backoff tracking
  lastError?: string;                      // Debugging aid
}
```

**Design Choices:**
- `unknown` for `payload` and `patch` instead of `any`: Forces type guards in consumers
- Explicit string literal union for `status`: Type-safe state machine
- Optional `lastError`: Error context without cluttering happy path

### Cache Entry Type Safety

```typescript
interface CacheEntry {
  processed: boolean;  // Deduplication flag
  timestamp: number;   // TTL enforcement
}
```

**Design Choices:**
- Simple structure for O(1) hash lookup performance
- No union types to avoid runtime overhead
- Timestamp for TTL-based eviction

## Integration Patterns

### Singleton Pattern for Shared State

**Pattern:** Module-level singleton instances for cache and queue.

```typescript
// cacheManager.ts
const processedCache = new LinearHash<string, CacheEntry>();
export const CacheManager = { /* methods */ };

// queueManager.ts
export const QueueManager = { /* methods */ };
```

**Rationale:**
1. **Shared State:** Cache and queue must be consistent across all SyncEngine operations
2. **Memory Efficiency:** Single instance of LinearHash and queue array
3. **Performance:** Avoid instance creation overhead

### Facade Pattern for API Surface

**Pattern:** SyncEngine delegates to specialized modules, maintaining exact API.

```typescript
// syncEngine.ts
export const SyncEngine = {
  getQueue: () => QueueManager.getQueue(),
  enqueue: (type, payload, oldPayload) => QueueManager.enqueue(type, payload, oldPayload),
  // ... 25 more delegated methods
};
```

**Rationale:**
1. **Backward Compatibility:** No breaking changes for consumers
2. **Centralized Documentation:** Single source of truth for API docs
3. **Flexibility:** Can change internal implementation without affecting consumers

### Dependency Injection for Testing

**Pattern:** Modules accept dependencies via parameters where appropriate.

```typescript
// backendSync.ts
export const syncMutation = async (
  mutation: Mutation,
  apiClient = defaultApiClient  // Injectable for testing
): Promise<boolean> => { /* ... */ };
```

**Rationale:**
1. **Testability:** Easy to inject mock API clients
2. **Flexibility:** Can swap implementations without changing consumers
3. **Default Parameters:** Production code doesn't need to pass dependencies

## Performance Considerations

### Algorithmic Complexity Preservation

| Operation | Original | Modularized | Notes |
|-----------|----------|-------------|-------|
| `enqueue()` | O(1) | O(1) | Array append + hash insert |
| `dequeue()` | O(1) | O(1) | Array shift + hash insert |
| `peek()` | O(1) | O(1) | Array index access |
| `update()` | O(n) | O(n) | Linear search (acceptable for small queues) |
| `cleanupCache()` | O(k) | O(k) | k = expired entries |
| `enforceCacheLimit()` | O(n log n) | O(n log n) | Sorting for LRU eviction |
| `createPatch()` | O(n) | O(n) | n = number of fields |

**Optimization Opportunities (Future):**
1. **Update Operation:** Use hash map for O(1) lookup instead of linear search
2. **Cache Eviction:** Maintain sorted timestamp index for O(k) eviction
3. **Patch Generation:** Shallow comparison for nested objects to reduce recursion

### Memory Management

**Original Footprint:** ~50KB for 1000 queued mutations
**Target Footprint:** ≤60KB (20% overhead acceptable for modular design)

**Strategies:**
1. **Bounded Caches:** `MAX_CACHE_SIZE` enforces hard limit
2. **TTL-Based Eviction:** Automatic cleanup every hour
3. **JSON Patch Optimization:** 70% reduction in network payload (preserving this)

### Network Efficiency

**JSON Patch Optimization Preserved:**
- UPDATE mutations include `patch` field with only changed fields
- Backend receives patch instead of full payload
- 70% bandwidth reduction maintained

**Example:**
```typescript
// Original: 500 bytes
const fullPayload = { id: '1', status: 'closed', title: 'Long Title...', /* 20 more fields */ };

// Patch: 150 bytes (70% reduction)
const patch = { status: 'closed' };
```

## Security Requirements

### Type Safety for Input Validation

**Strategy:** Use `unknown` instead of `any` to force type guards.

```typescript
// Before (unsafe)
function processMutation(mutation: { payload: any }) {
  const data = mutation.payload;  // No type checking
  apiClient.post('/sync', data);  // Potential XSS/injection
}

// After (safe)
function processMutation(mutation: Mutation) {
  if (mutation.payload && typeof mutation.payload === 'object') {
    const validated = sanitizePayload(mutation.payload);  // Explicit validation
    apiClient.post('/sync', validated);
  }
}
```

### Error Handling Security

**Strategy:** Never expose internal errors to users; log for debugging.

```typescript
catch (error: unknown) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.error('[SyncEngine] Internal error:', errorMessage);  // Log details

  // Return generic error to user
  return { success: false, error: 'Sync failed. Please retry.' };
}
```

### Cache Poisoning Prevention

**Strategy:** TTL-based eviction prevents stale/malicious cache entries.

1. **Bounded Size:** Max 1000 entries (configurable)
2. **TTL Enforcement:** 1-hour expiration
3. **LRU Eviction:** Oldest 20% evicted when full

## SOLID Principles Application

### Single Responsibility Principle (SRP)

Each module has one clear responsibility:
- **syncTypes.ts:** Type definitions only
- **syncConfig.ts:** Configuration only
- **patchGenerator.ts:** Diff calculation only
- **cacheManager.ts:** Cache lifecycle only
- **queueManager.ts:** Queue operations only
- **backendSync.ts:** Network synchronization only
- **syncEngine.ts:** API facade only

### Open/Closed Principle (OCP)

Modules are open for extension, closed for modification:
- New mutation types: Add to `MUTATION_HANDLERS` registry (no changes to core)
- New retry strategies: Inject custom `calculateBackoffDelay` (no changes to core)
- New cache eviction: Extend `CacheManager` (no changes to queue/sync)

### Liskov Substitution Principle (LSP)

Modules can be swapped with compatible implementations:
- `QueueManager` could be replaced with Redis-backed queue
- `CacheManager` could be replaced with IndexedDB cache
- `BackendSyncService` could be replaced with WebSocket sync

### Interface Segregation Principle (ISP)

Consumers only depend on methods they use:
- SyncContext uses: `enqueue()`, `dequeue()`, `peek()`, `update()`, `count()`, `getFailed()`, `resetFailed()`
- Background sync uses: `processQueue()`, `syncFromBackend()`, `getBackendStatus()`
- Monitoring uses: `getCacheStats()`, `count()`, `getFailed()`

### Dependency Inversion Principle (DIP)

High-level modules depend on abstractions:
- `SyncEngine` depends on `QueueManager` interface (not implementation)
- `BackendSyncService` depends on `apiClient` abstraction (injectable)
- All modules depend on `syncTypes.ts` (abstraction, not concrete)

## Evolution Strategy

### Phase 1: Internal Refactoring (This Task)
Break monolith into modules without changing API.

### Phase 2: Enhanced Type Safety (Future)
- Replace `unknown` payloads with generic types
- Add runtime validation with Zod/io-ts
- Discriminated unions for mutation types

### Phase 3: Performance Optimization (Future)
- O(1) update operation with hash map
- Optimized cache eviction
- Worker thread for background sync

### Phase 4: Advanced Features (Future)
- Conflict resolution strategies (CRDT, OT)
- Bidirectional sync with operational transforms
- Real-time sync via WebSockets
