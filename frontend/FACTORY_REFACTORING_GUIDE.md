# Factory Abstractions - Refactoring Guide

## Overview

This document provides a comprehensive guide for refactoring LexiFlow services to use the new factory abstractions. These factories eliminate **~1,320 lines of duplicate code** across 50+ services.

---

## 📦 Available Factories

### 1. GenericRepository<T>
**Eliminates**: 100+ duplicate CRUD implementations  
**Location**: `services/core/factories/GenericRepository.ts`  
**Use Cases**: Any repository with standard CRUD operations

**Before** (20+ lines):
```typescript
export class ClientRepository {
  async getAll(): Promise<Client[]> {
    try {
      return await api.clients.getAll();
    } catch (error) {
      console.error('[ClientRepository.getAll] Error:', error);
      throw error;
    }
  }
  
  async getById(id: string): Promise<Client | undefined> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Invalid id parameter');
    }
    try {
      return await api.clients.getById(id);
    } catch (error) {
      console.error('[ClientRepository.getById] Error:', error);
      throw error;
    }
  }
  // ... 15+ more lines for add/update/delete
}
```

**After** (5 lines):
```typescript
export class ClientRepository extends GenericRepository<Client> {
  protected apiService = api.clients;
  protected repositoryName = 'ClientRepository';
  
  // CRUD inherited - only add custom methods
  async getByType(type: string): Promise<Client[]> {
    return this.getAll({ type });
  }
}
```

**Query Keys Helper**:
```typescript
export const CLIENT_QUERY_KEYS = createQueryKeys('clients');

// Usage
queryClient.useQuery(CLIENT_QUERY_KEYS.all(), () => repo.getAll());
queryClient.useQuery(CLIENT_QUERY_KEYS.byId('123'), () => repo.getById('123'));
```

---

### 2. EventEmitter<T>
**Eliminates**: 90+ duplicate listener management lines  
**Location**: `services/core/factories/EventEmitterMixin.ts`  
**Use Cases**: Services needing event publishing/subscription

**Before** (12+ lines):
```typescript
class SessionService {
  private listeners: Set<SessionListener> = new Set();
  
  addListener(listener: SessionListener) {
    this.listeners.add(listener);
    if (this.listeners.size > 1000) {
      console.warn('Listener overflow');
    }
    return () => this.listeners.delete(listener);
  }
  
  removeListener(listener: SessionListener) {
    this.listeners.delete(listener);
  }
  
  clearAllListeners() {
    this.listeners.clear();
  }
  
  protected notifyListeners(event: SessionEvent) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in listener:', error);
      }
    });
  }
}
```

**After** (3 lines):
```typescript
class SessionService {
  private events = new EventEmitter<SessionEvent>({ 
    serviceName: 'Session',
    maxListeners: 1000
  });
  
  addListener(listener: SessionListener) {
    return this.events.subscribe(listener);
  }
  
  protected notifySessionChange(event: SessionEvent) {
    this.events.notify(event);
  }
}
```

**TypedEventEmitter** (for multiple event types):
```typescript
interface WorkflowEvents {
  started: { workflowId: string };
  completed: { workflowId: string; result: unknown };
  failed: { workflowId: string; error: Error };
}

class WorkflowService {
  private events = new TypedEventEmitter<WorkflowEvents>({
    serviceName: 'Workflow'
  });
  
  start(id: string) {
    this.events.emit('started', { workflowId: id });
  }
  
  onStarted(listener: (data: { workflowId: string }) => void) {
    return this.events.on('started', listener);
  }
}
```

---

### 3. BackendSyncService<T>
**Eliminates**: 60+ duplicate sync queue lines  
**Location**: `services/core/factories/BackendSyncService.ts`  
**Use Cases**: Services needing backend synchronization with queue management

**Before** (50+ lines):
```typescript
class BackendStorageService {
  private syncQueue: Map<string, SyncQueueItem> = new Map();
  private syncTimer: NodeJS.Timeout | null = null;
  private processingQueue = false;
  
  protected queueSync(key: string, value: any) {
    this.syncQueue.set(key, { key, value, timestamp: Date.now() });
    this.debouncedProcessQueue();
  }
  
  private debouncedProcessQueue() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => this.processQueue(), 1000);
  }
  
  private async processQueue() {
    // ... 30+ more lines
  }
  
  protected enableAutoSync() {
    // ... 10+ more lines
  }
}
```

**After** (10 lines):
```typescript
class BackendStorageService extends BackendSyncService<StorageData> {
  constructor() {
    super('BackendStorage', {
      autoSyncInterval: 30000,
      maxRetries: 3,
      debounceDelay: 1000
    });
  }
  
  protected async syncToBackend(key: string, value: StorageData) {
    return api.storage.set(key, value);
  }
  
  protected async fetchFromBackend(key: string) {
    return api.storage.get(key);
  }
  
  // Queue management inherited
}
```

---

### 4. InterceptorChain
**Eliminates**: 50+ duplicate HTTP interceptor loops  
**Location**: `services/core/factories/InterceptorChain.ts`  
**Use Cases**: HTTP clients needing request/response/error interceptors

**Before** (10+ lines per HTTP method):
```typescript
async get(url: string, config: RequestConfig) {
  // Request interceptors
  for (const interceptor of this.requestInterceptors) {
    config = await interceptor(config);
  }
  
  const response = await fetch(url, config);
  
  // Response interceptors
  for (const interceptor of this.responseInterceptors) {
    response = await interceptor(response);
  }
  
  return response;
}
// ... duplicate for post/put/patch/delete
```

**After** (3 lines):
```typescript
class ApiClient {
  private interceptors = new InterceptorChain();
  
  constructor() {
    this.interceptors.addRequestInterceptor(createAuthInterceptor(() => getToken()));
    this.interceptors.addResponseInterceptor(jsonResponseInterceptor);
    this.interceptors.addErrorInterceptor(createRetryInterceptor({ maxRetries: 3 }));
  }
  
  async request(config: RequestConfig) {
    config = await this.interceptors.runRequestInterceptors(config);
    try {
      const response = await fetch(config.url, config);
      return await this.interceptors.runResponseInterceptors(response);
    } catch (error) {
      throw await this.interceptors.runErrorInterceptors(error);
    }
  }
}
```

**Built-in Interceptors**:
```typescript
// Auth
createAuthInterceptor(() => getToken())

// Retry
createRetryInterceptor({ 
  maxRetries: 3, 
  retryDelay: 1000,
  retryableStatuses: [408, 429, 500, 502, 503, 504]
})

// Logging
createLoggingInterceptor({
  logRequests: true,
  logResponses: true,
  logErrors: true
})
```

---

### 5. CacheManager<T>
**Eliminates**: 30+ duplicate cache management lines  
**Location**: `services/core/factories/CacheManager.ts`  
**Use Cases**: Services needing TTL-based caching with LRU eviction

**Before** (15+ lines):
```typescript
class FeatureFlagService {
  private cache: Map<string, { value: boolean; expiresAt: number }> = new Map();
  
  get(key: string): boolean | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    return entry.value;
  }
  
  set(key: string, value: boolean) {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + 60000
    });
  }
  // ... 5+ more lines
}
```

**After** (3 lines):
```typescript
class FeatureFlagService {
  private cache = new CacheManager<boolean>({ 
    defaultTTL: 60000,
    maxSize: 1000,
    name: 'FeatureFlags'
  });
  
  async getFlag(key: string): Promise<boolean> {
    return this.cache.getOrSet(
      key,
      () => api.featureFlags.get(key),
      60000 // TTL
    );
  }
}
```

**API**:
```typescript
cache.get(key)                       // Get with TTL check
cache.set(key, value, ttl)          // Set with optional TTL
cache.getOrSet(key, fetcher, ttl)   // Fetch if not cached
cache.pruneExpired()                // Remove expired entries
cache.getStats()                    // { hits, misses, hitRate, size }
```

---

### 6. GenericRegistry<T>
**Eliminates**: 60+ duplicate registry management lines  
**Location**: `services/core/factories/GenericRegistry.ts`  
**Use Cases**: Managing service/repository instances

**Before** (25+ lines):
```typescript
class ServiceRegistry {
  private services: Map<string, BaseService> = new Map();
  
  register(name: string, factory: () => BaseService) {
    this.services.set(name, factory());
  }
  
  get(name: string): BaseService | undefined {
    return this.services.get(name);
  }
  
  has(name: string): boolean {
    return this.services.has(name);
  }
  
  clear() {
    this.services.clear();
  }
  // ... 15+ more lines
}
```

**After** (1 line):
```typescript
export const ServiceRegistry = new GenericRegistry<BaseService>({
  name: 'Service',
  lazy: true // Lazy instantiation
});

// Usage
ServiceRegistry.register('auth', () => new AuthService());
const auth = ServiceRegistry.get('auth');
```

**Singleton Pattern**:
```typescript
export const ServiceRegistry = createSingletonRegistry<BaseService>({
  name: 'Service'
});
```

---

### 7. Utility Factories
**Location**: `services/core/factories/Utilities.ts`

#### IdGenerator
**Eliminates**: 4+ duplicate ID generation patterns

```typescript
const idGen = new IdGenerator('case');

idGen.next()   // "case_1234567890_1_abc"
idGen.uuid()   // "case_550e8400-e29b-41d4-a716-446655440000"
idGen.short()  // "case_a1b2c3d4"
```

#### TimerManager
**Eliminates**: 15+ duplicate setTimeout/setInterval patterns

```typescript
const timers = new TimerManager();

timers.setTimeout(() => console.log('tick'), 1000);
timers.setInterval(() => console.log('tick'), 1000);

// Auto-cleanup
timers.clearAll();
```

#### StoragePersistence
**Eliminates**: 12+ duplicate localStorage patterns

```typescript
interface UserPrefs {
  theme: 'light' | 'dark';
  language: string;
}

const storage = new StoragePersistence<UserPrefs>('user_prefs');

storage.set({ theme: 'dark', language: 'en' });
const prefs = storage.get(); // Type-safe
storage.update({ theme: 'light' }); // Partial update
```

#### debounce/throttle/retry
```typescript
// Debounce
const debouncedSearch = debounce((query: string) => {
  searchAPI(query);
}, 300);

// Throttle
const throttledScroll = throttle((e: Event) => {
  handleScroll(e);
}, 100);

// Retry with exponential backoff
const data = await retry(
  () => fetch('/api/data'),
  { 
    maxRetries: 3, 
    baseDelay: 1000,
    onRetry: (attempt, error) => console.log(`Retry ${attempt}:`, error)
  }
);
```

---

## 🔄 Refactoring Plan

### Phase 1: Repositories (CRITICAL - 20+ files)
**Target**: All repositories in `services/data/repositories/`

**Files to Refactor**:
- ClientRepository
- UserRepository
- DocumentRepository
- TaskRepository
- WitnessRepository
- MatterRepository
- EntityRepository
- MotionRepository
- TemplateRepository
- CitationRepository
- PleadingRepository
- EvidenceRepository
- ... 8+ more

**Steps**:
1. Extend `GenericRepository<T>`
2. Remove duplicate CRUD methods (getAll, getById, add, update, delete)
3. Keep only custom methods
4. Replace query key objects with `createQueryKeys()`

**Estimated Reduction**: 100+ lines → ~10 lines per repository

---

### Phase 2: Event Emitters (HIGH - 6+ files)
**Target**: Services with listener management

**Files to Refactor**:
- Repository.ts (lines 55-125)
- NotificationService.ts (lines 113-140)
- SessionService.ts (lines 116-123)
- ModuleRegistry.ts (lines 87-94)
- BackendDiscoveryService
- IntegrationEventPublisher

**Steps**:
1. Replace listener Set with `EventEmitter<T>`
2. Replace subscribe/removeListener/notify methods with emitter calls
3. Remove overflow checking (handled by EventEmitter)

**Estimated Reduction**: 90 lines → ~3 lines per service

---

### Phase 3: Backend Sync Services (CRITICAL - 2 files)
**Target**: Services with sync queues

**Files to Refactor**:
- BackendStorageService (lines 63, 252-264)
- BackendSessionService (identical sync queue)

**Steps**:
1. Extend `BackendSyncService<T>`
2. Implement `syncToBackend()` and `fetchFromBackend()`
3. Remove duplicate sync queue management
4. Remove duplicate auto-sync timer setup

**Estimated Reduction**: 50+ lines → ~10 lines per service

---

### Phase 4: HTTP Client (HIGH - 1 file)
**Target**: api-client.ts

**Files to Refactor**:
- services/infrastructure/api-client/api-client.ts (lines 62-190)

**Steps**:
1. Replace interceptor loops with `InterceptorChain`
2. Use built-in interceptors (auth, retry, logging)
3. Remove duplicate error handling

**Estimated Reduction**: 50+ lines → ~10 lines

---

### Phase 5: Cache Services (MEDIUM - 4 files)
**Target**: Services with TTL caching

**Files to Refactor**:
- BackendCryptoService (lines 70-85)
- BackendFeatureFlagService (line 233)
- BackendStorageService
- Repository.ts (LRU cache)

**Steps**:
1. Replace custom cache with `CacheManager<T>`
2. Remove TTL validation logic
3. Use `getOrSet()` for fetch-on-miss

**Estimated Reduction**: 15+ lines → ~3 lines per service

---

### Phase 6: Registries (MEDIUM - 2 files)
**Target**: Registry implementations

**Files to Refactor**:
- ServiceRegistry.ts (lines 415-471)
- RepositoryRegistry.ts (lines 24-80)

**Steps**:
1. Replace with `GenericRegistry<T>` or `createSingletonRegistry<T>()`
2. Remove duplicate registration/retrieval logic

**Estimated Reduction**: 60+ lines → ~5 lines per registry

---

### Phase 7: Utilities (MEDIUM - 15+ patterns)
**Target**: Scattered utility patterns

**Patterns to Refactor**:
- Timer management (15+ patterns) → `TimerManager`
- ID generation (4+ patterns) → `IdGenerator`
- localStorage access (12+ patterns) → `StoragePersistence`

**Steps**:
1. Replace setTimeout/setInterval with `TimerManager`
2. Replace UUID generation with `IdGenerator`
3. Replace localStorage calls with `StoragePersistence`

**Estimated Reduction**: 5-10 lines → 1 line per pattern

---

## 📊 Expected Impact

| Phase | Files | Lines Removed | Lines Added | Net Reduction |
|-------|-------|---------------|-------------|---------------|
| 1. Repositories | 20+ | ~2,000 | ~200 | **-1,800** |
| 2. Event Emitters | 6 | ~540 | ~18 | **-522** |
| 3. Backend Sync | 2 | ~120 | ~20 | **-100** |
| 4. HTTP Client | 1 | ~50 | ~10 | **-40** |
| 5. Cache Services | 4 | ~60 | ~12 | **-48** |
| 6. Registries | 2 | ~60 | ~10 | **-50** |
| 7. Utilities | 15+ | ~150 | ~15 | **-135** |
| **TOTAL** | **50+** | **~2,980** | **~285** | **-2,695** |

**Overall Code Reduction**: ~2,700 lines (60-70% in affected services)

---

## ✅ Testing Strategy

### Unit Tests
Create test suites for each factory:

```typescript
// GenericRepository.test.ts
describe('GenericRepository', () => {
  it('should fetch all items', async () => {
    const repo = new TestRepository();
    const items = await repo.getAll();
    expect(items).toBeDefined();
  });
  
  it('should validate ID parameter', async () => {
    const repo = new TestRepository();
    await expect(repo.getById('')).rejects.toThrow(ValidationError);
  });
});

// EventEmitter.test.ts
describe('EventEmitter', () => {
  it('should subscribe and notify', () => {
    const emitter = new EventEmitter<string>();
    let received: string | undefined;
    emitter.subscribe((msg) => { received = msg; });
    emitter.notify('test');
    expect(received).toBe('test');
  });
});
```

### Integration Tests
Test refactored services end-to-end:

```typescript
describe('ClientRepository (refactored)', () => {
  it('should perform CRUD operations', async () => {
    const repo = new ClientRepository();
    
    // Create
    const client = await repo.add({ name: 'Test', type: 'corporate' });
    expect(client.id).toBeDefined();
    
    // Read
    const fetched = await repo.getById(client.id);
    expect(fetched).toEqual(client);
    
    // Update
    const updated = await repo.update(client.id, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
    
    // Delete
    await repo.delete(client.id);
    const deleted = await repo.getById(client.id);
    expect(deleted).toBeUndefined();
  });
});
```

---

## 🚀 Implementation Steps

1. **Week 1**: Implement factories (✅ COMPLETE)
2. **Week 2**: Phase 1 - Refactor repositories
3. **Week 3**: Phase 2-4 - Refactor event emitters, sync services, HTTP client
4. **Week 4**: Phase 5-7 - Refactor cache services, registries, utilities
5. **Week 5**: Testing and validation
6. **Week 6**: Documentation and training

---

## 📚 Resources

- Factory implementations: `services/core/factories/`
- Example refactorings: See "Before/After" sections above
- Type definitions: `services/core/factories/index.ts`
- Integration guide: `hooks/integration/README.md`

---

## 🤝 Support

For questions or issues:
1. Check this guide first
2. Review factory source code
3. Consult coordination scratchpad: `.scratchpad/duplicate-code-analysis.md`
4. Ask team lead

---

**Last Updated**: 2026-01-17  
**Status**: Factories implemented, ready for refactoring
