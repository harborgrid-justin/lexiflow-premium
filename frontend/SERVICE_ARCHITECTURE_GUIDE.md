# Service Architecture Quick Reference

**Updated:** December 28, 2025  
**For:** LexiFlow Developers  

---

## 🎯 Core Principles (Memorize These)

1. **No direct browser APIs** - Use adapters
2. **No generic errors** - Use domain errors
3. **Methods = domain intent** - Not CRUD verbs
4. **Inject dependencies** - No hardcoded implementations
5. **Services = stateless** - State belongs in React Query/hooks

---

## 📦 Essential Imports

```typescript
// Adapters (for portable services)
import { 
  defaultStorage,           // Browser localStorage wrapper
  defaultSessionStorage,    // Browser sessionStorage wrapper
  MemoryStorageAdapter,     // For tests
  type IStorageAdapter      // Interface for DI
} from '@/services';

import {
  defaultWindowAdapter,     // Browser window/timer wrapper
  TestWindowAdapter,        // For tests
  type IWindowAdapter       // Interface for DI
} from '@/services';

// Domain Errors (replace throw new Error)
import {
  CaseNotFoundError,
  UserNotFoundError,
  ValidationError,
  UnauthorizedError,
  ConflictError,
  // ... 40+ more
} from '@/services';
```

---

## ✅ DO's

### ✅ Use Storage Adapter
```typescript
// Good
import { defaultStorage } from '@/services';

export class ApiConfigService {
  isEnabled(): boolean {
    return defaultStorage.getItem('feature') === 'true';
  }
}
```

### ✅ Use Window Adapter
```typescript
// Good
import { defaultWindowAdapter } from '@/services';

export class PollingService {
  private timerId?: number;
  
  start(): void {
    this.timerId = defaultWindowAdapter.setInterval(() => {
      this.poll();
    }, 5000);
  }
}
```

### ✅ Use Domain Errors
```typescript
// Good
import { CaseNotFoundError } from '@/services';

async getCase(id: CaseId): Promise<Case> {
  const case = await this.repository.findById(id);
  if (!case) throw new CaseNotFoundError(id);
  return case;
}
```

### ✅ Intent-Based Method Names
```typescript
// Good
class CaseRepository {
  async openCase(data: CaseIntake): Promise<Case> { ... }
  async archiveCase(id: CaseId): Promise<void> { ... }
  async closeCase(id: CaseId, outcome: string): Promise<void> { ... }
}
```

### ✅ Inject Dependencies
```typescript
// Good
export class CaseService {
  constructor(
    private readonly repository: ICaseRepository,
    private readonly storage: IStorageAdapter
  ) {}
}
```

---

## ❌ DON'Ts

### ❌ No Direct localStorage
```typescript
// Bad
const value = localStorage.getItem('key');
localStorage.setItem('key', 'value');

// Good
const value = defaultStorage.getItem('key');
defaultStorage.setItem('key', 'value');
```

### ❌ No Direct window
```typescript
// Bad
const timerId = window.setInterval(() => check(), 1000);
window.addEventListener('beforeunload', cleanup);

// Good
const timerId = defaultWindowAdapter.setInterval(() => check(), 1000);
defaultWindowAdapter.addEventListener('beforeunload', cleanup);
```

### ❌ No Generic Errors
```typescript
// Bad
throw new Error('Case not found');
throw new Error('Invalid input');

// Good
throw new CaseNotFoundError(caseId);
throw new ValidationError('Invalid input', { field: 'title' });
```

### ❌ No CRUD Method Names
```typescript
// Bad
class CaseRepository {
  async getAll(): Promise<Case[]> { ... }
  async add(case: Case): Promise<Case> { ... }
  async update(id, data): Promise<Case> { ... }
  async delete(id): Promise<void> { ... }
}

// Good
class CaseRepository {
  async findActiveCases(): Promise<Case[]> { ... }
  async openCase(data: CaseIntake): Promise<Case> { ... }
  async updateCaseDetails(id, updates): Promise<Case> { ... }
  async archiveCase(id): Promise<void> { ... }
}
```

### ❌ No Hardcoded Dependencies
```typescript
// Bad
export class CaseRepository {
  private api = new CasesApiService(); // Hardcoded
  
  constructor() {
    super(STORES.CASES);
  }
}

// Good
export class CaseRepository {
  constructor(
    private readonly api: ICaseApiClient // Injected interface
  ) {}
}
```

---

## 🧪 Testing Patterns

### Test with Mock Storage
```typescript
import { MemoryStorageAdapter } from '@/services';

describe('ApiConfigService', () => {
  let mockStorage: MemoryStorageAdapter;
  let service: ApiConfigService;
  
  beforeEach(() => {
    mockStorage = new MemoryStorageAdapter();
    service = new ApiConfigService(mockStorage);
  });
  
  it('should check feature flag', () => {
    mockStorage.setItem('feature', 'true');
    expect(service.isEnabled()).toBe(true);
  });
});
```

### Test with Mock Window
```typescript
import { TestWindowAdapter } from '@/services';

describe('PollingService', () => {
  let mockWindow: TestWindowAdapter;
  let service: PollingService;
  
  beforeEach(() => {
    mockWindow = new TestWindowAdapter();
    service = new PollingService(mockWindow);
  });
  
  it('should poll on interval', () => {
    const pollSpy = jest.spyOn(service, 'poll');
    service.start();
    
    mockWindow.triggerInterval(1); // Manual trigger
    expect(pollSpy).toHaveBeenCalled();
  });
});
```

### Test Domain Errors
```typescript
import { CaseNotFoundError } from '@/services';

describe('CaseService', () => {
  it('should throw CaseNotFoundError', async () => {
    await expect(service.getCase('invalid'))
      .rejects.toThrow(CaseNotFoundError);
  });
  
  it('should include context in error', async () => {
    try {
      await service.getCase('invalid');
    } catch (err) {
      expect(err).toBeInstanceOf(CaseNotFoundError);
      expect(err.statusCode).toBe(404);
      expect(err.context).toEqual({ caseId: 'invalid' });
    }
  });
});
```

---

## 🗺️ Domain Error Selection Guide

| Scenario | Error Class | Status Code |
|----------|-------------|-------------|
| Entity doesn't exist | `CaseNotFoundError`, `UserNotFoundError` | 404 |
| Invalid input data | `ValidationError`, `InvalidInputError` | 400 |
| Missing required field | `MissingRequiredFieldError` | 400 |
| Invalid state transition | `InvalidStatusTransitionError` | 400 |
| Not authenticated | `UnauthorizedError` | 401 |
| No permission | `ForbiddenError`, `InsufficientPermissionsError` | 403 |
| Ethical wall block | `EthicalWallViolationError` | 403 |
| Duplicate entry | `DuplicateEntityError` | 409 |
| Concurrent edit | `ConcurrentModificationError` | 409 |
| Business rule broken | `BusinessRuleViolationError` | 409 |
| External API failed | `ExternalServiceError` | 502 |
| Request timeout | `ApiTimeoutError` | 504 |
| Service down | `ServiceUnavailableError` | 503 |
| Worker pool failed | `WorkerPoolInitializationError` | 500 |
| Workflow error | `WorkflowExecutionError` | 500 |
| Config missing | `MissingConfigurationError` | 500 |

---

## 📝 JSDoc Template

```typescript
/**
 * CaseRepository - Enterprise Case Management
 * 
 * RESPONSIBILITIES:
 * ✅ Case lifecycle management (open, archive, close)
 * ✅ Party and attorney relationship tracking
 * ✅ Status transitions and validation
 * ✅ Integration with docket import
 * 
 * NOT RESPONSIBLE FOR:
 * ❌ Document management (see DocumentRepository)
 * ❌ Billing calculations (see BillingService)
 * ❌ Calendar events (see CalendarService)
 * ❌ UI state management (use React Query hooks)
 * 
 * BOUNDARIES:
 * - Does not access DocumentRepository directly
 * - Publishes events for cross-domain updates
 * - Consumes only Case and Party entities
 * 
 * @example
 * ```typescript
 * const repo = new CaseRepository(apiClient, storage);
 * const cases = await repo.findActiveCases();
 * await repo.archiveCase(caseId);
 * ```
 */
export class CaseRepository {
  constructor(
    private readonly api: ICaseApiClient,
    private readonly storage: IStorageAdapter = defaultStorage
  ) {}
}
```

---

## 🚀 Migration Checklist

When refactoring a service:

- [ ] Remove `localStorage` → use `defaultStorage`
- [ ] Remove `sessionStorage` → use `defaultSessionStorage`
- [ ] Remove `window.setTimeout` → use `defaultWindowAdapter.setTimeout`
- [ ] Remove `window.setInterval` → use `defaultWindowAdapter.setInterval`
- [ ] Remove `window.addEventListener` → use `defaultWindowAdapter.addEventListener`
- [ ] Replace `throw new Error()` with domain error classes
- [ ] Rename CRUD methods to intent-based names
- [ ] Extract hardcoded dependencies to constructor injection
- [ ] Add RESPONSIBILITIES section to JSDoc
- [ ] Add NOT RESPONSIBLE FOR section to JSDoc
- [ ] Write unit tests with mocked adapters

---

## 💡 Pro Tips

1. **Default parameters for backward compatibility**
   ```typescript
   // Allows gradual migration
   export function myFunction(storage: IStorageAdapter = defaultStorage) {
     // Old code still works, new code can inject
   }
   ```

2. **Error context is your friend**
   ```typescript
   // Include helpful context
   throw new CaseNotFoundError(caseId); // Auto-includes context
   throw new ValidationError('Invalid', { field: 'title', value: 'x' });
   ```

3. **Test adapters have extra methods**
   ```typescript
   // TestWindowAdapter has manual triggers
   mockWindow.triggerInterval(timerId);
   mockWindow.triggerTimeout(timerId);
   mockWindow.triggerEvent('beforeunload', event);
   ```

4. **Storage adapters auto-fallback**
   ```typescript
   // No need to check if localStorage exists
   // Adapter handles it and falls back to memory
   defaultStorage.setItem('key', 'value'); // Safe everywhere
   ```

---

## 📚 Further Reading

- [GAP_ANALYSIS_SERVICES.md](GAP_ANALYSIS_SERVICES.md) - Detailed analysis
- [SERVICE_REFACTORING_SUMMARY.md](SERVICE_REFACTORING_SUMMARY.md) - Full changelog
- [StorageAdapter.ts](src/services/infrastructure/adapters/StorageAdapter.ts) - Adapter implementation
- [WindowAdapter.ts](src/services/infrastructure/adapters/WindowAdapter.ts) - Window adapter
- [errors.ts](src/services/core/errors.ts) - All domain errors

---

## 🆘 Common Issues

### Issue: "Can't access localStorage in test"
**Solution:** Inject `MemoryStorageAdapter` in test setup

### Issue: "window is not defined in SSR"
**Solution:** Use `defaultWindowAdapter` instead of direct window access

### Issue: "Generic error doesn't show context"
**Solution:** Use domain error with context parameter

### Issue: "Can't mock dependency in test"
**Solution:** Accept interface via constructor instead of hardcoding

---

**Questions?** Ask in #frontend-architecture channel
