# Service Layer Gap Analysis Report
**Date:** December 28, 2025  
**Scope:** `frontend/src/services/`  
**Principles:** 15 Enterprise Architecture Patterns  

---

## Executive Summary

**Overall Compliance:** 📊 **62/100** (Moderate Violations)  

The service layer shows **mixed adherence** to enterprise patterns. While services demonstrate good domain separation and type safety, they suffer from:

1. **Framework coupling** (localStorage, window, document APIs)
2. **Generic error handling** (throw new Error instead of domain errors)
3. **CRUD-centric naming** (getAll, add, update vs. intent-based)
4. **Concrete dependencies** (no interface injection)
5. **Missing DTO mapping** (API models leak to domain)

**Positive Highlights:**
- ✅ Services are stateless (no instance state except caches)
- ✅ Strong TypeScript typing throughout
- ✅ Domain-grouped services (not one-per-endpoint)
- ✅ Comprehensive documentation
- ✅ Backend-first architecture

---

## Detailed Findings by Principle

### ✅ **1. Pure Application Layer** — PASS (85%)
**Status:** Good with minor violations

Services mostly avoid UI concerns but have some React/browser coupling:

**Violations:**
```typescript
// services/infrastructure/notificationService.ts
export interface NotificationAction {
  onClick: () => void;  // ❌ UI callback in service
}

// services/workers/workerPool.ts
window.addEventListener('beforeunload', () => {  // ❌ Browser API
  WorkerPool.terminateAll();
});
```

**Fix:** Extract UI callbacks to adapter pattern, move browser event handling to components.

---

### ❌ **2. Framework-Agnostic** — FAIL (40%)
**Status:** Critical violations

Multiple services directly use browser APIs:

**Violations Found:**
| File | Line | Issue |
|------|------|-------|
| `apiConfig.ts` | 51 | `localStorage.getItem('VITE_USE_BACKEND_API')` |
| `apiConfig.ts` | 59 | `localStorage.getItem('VITE_USE_INDEXEDDB')` |
| `notificationService.ts` | ~200 | Desktop Notifications API (`Notification.permission`) |
| `workerPool.ts` | 508 | `window.setInterval()` |
| `workerPool.ts` | 537 | `window.addEventListener('beforeunload')` |
| `handlers/InvoiceStatusChangedHandler.ts` | 76 | `localStorage.getItem('userName')` |

**Recommended Fix:**
```typescript
// Create infrastructure adapter
// services/infrastructure/StorageAdapter.ts
export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  }
  // ... etc
}

// Inject into services
export class ApiConfigService {
  constructor(private readonly storage: StorageAdapter) {}
  
  isBackendEnabled(): boolean {
    return this.storage.getItem('VITE_USE_BACKEND_API') !== 'false';
  }
}
```

---

### ❌ **3. Intent-Based Methods** — FAIL (35%)
**Status:** Extensive CRUD naming

Most repositories use generic CRUD operations instead of domain language:

**Violations:**
```typescript
// ❌ Current pattern (CRUD-centric)
CaseRepository.getAll()
CaseRepository.add(case)
CaseRepository.update(id, data)
CaseRepository.delete(id)

// ✅ Preferred pattern (intent-based)
CaseRepository.findActiveCases()
CaseRepository.openCase(caseData)
CaseRepository.archiveCase(caseId)
CaseRepository.closeCase(caseId, outcome)
```

**Files Requiring Refactoring:**
- `domain/CaseDomain.ts`
- `domain/DocketDomain.ts`
- `data/repositories/*Repository.ts` (38 files)

**Recommended Fix:**
```typescript
export class CaseRepository extends Repository<Case> {
  // Replace generic CRUD
  async findActiveCases(filters?: CaseFilters): Promise<Case[]> {
    return this.query({ status: 'Active', ...filters });
  }
  
  async openCase(intake: CaseIntakeForm): Promise<Case> {
    return this.add({ ...intake, status: 'Active', openedAt: new Date() });
  }
  
  async archiveCase(caseId: CaseId): Promise<void> {
    await this.update(caseId, { status: 'Archived', archivedAt: new Date() });
  }
}
```

---

### ❌ **4. Depend on Interfaces** — FAIL (20%)
**Status:** No interface injection

Services hardcode concrete dependencies:

**Violations:**
```typescript
// ❌ Current pattern (concrete dependency)
export class CaseRepository extends Repository<Case> {
  private readonly casesApi: CasesApiService;  // Hardcoded
  
  constructor() { 
    super(STORES.CASES);
    this.casesApi = new CasesApiService();  // Direct instantiation
  }
}

// ✅ Preferred pattern (interface injection)
export interface ICaseApiClient {
  findAll(filters: CaseFilters): Promise<Case[]>;
  findById(id: CaseId): Promise<Case>;
  create(data: CreateCaseDTO): Promise<Case>;
}

export class CaseRepository {
  constructor(
    private readonly apiClient: ICaseApiClient  // Interface dependency
  ) {}
}
```

**Impact:** Makes testing harder, prevents easy migration to different backends.

---

### ✅ **5. Stateless Services** — PASS (90%)
**Status:** Excellent

Services avoid instance state except for intentional caches:

**Compliant Examples:**
```typescript
// CacheManager.ts - explicit cache design
export class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();  // ✅ Intentional state
}

// Repository.ts - LRU cache for performance
export class Repository<T> {
  private cache = new LRU<string, T>(50);  // ✅ Performance optimization
}
```

**No violations found** - services correctly separate state management to React Query/hooks.

---

### ✅ **6. Centralize Cross-Cutting Policies** — PASS (80%)
**Status:** Good implementation

Services handle retries, validation centrally:

**Compliant Examples:**
```typescript
// apiClient.ts - centralized retry logic
private async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      await delay(Math.pow(2, i) * 1000);
    }
  }
}

// validation/ - centralized schemas
export const caseSchema = z.object({ ... });
export const docketSchema = z.object({ ... });
```

**Minor Gap:** Some validation still scattered in components - should move to services.

---

### ❌ **7. Normalize Errors** — FAIL (25%)
**Status:** Generic errors everywhere

Services throw generic `Error` instead of domain errors:

**Violations (20+ occurrences):**
```typescript
// ❌ Current pattern
throw new Error(`[ApiClient.${methodName}] Invalid endpoint parameter`);
throw new Error('[WorkerPool] Failed to create any workers');
throw new Error('No start node found in workflow');

// ✅ Preferred pattern
throw new InvalidEndpointError(endpoint);
throw new WorkerPoolInitializationError(workerCount);
throw new WorkflowConfigurationError('Start node missing');
```

**Recommended Fix:**
```typescript
// services/core/errors.ts
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User not found: ${userId}`, 'USER_NOT_FOUND', 404);
  }
}

export class CaseNotFoundError extends DomainError {
  constructor(caseId: string) {
    super(`Case not found: ${caseId}`, 'CASE_NOT_FOUND', 404);
  }
}

// Usage in services
async getCase(id: CaseId): Promise<Case> {
  const case = await this.findById(id);
  if (!case) throw new CaseNotFoundError(id);
  return case;
}
```

---

### ✅ **8. Group by Domain, Not Endpoint** — PASS (90%)
**Status:** Excellent

Services are domain-grouped correctly:

**Good Examples:**
```
services/domain/
├── CaseDomain.ts          # All case operations
├── DocketDomain.ts        # All docket operations
├── ComplianceDomain.ts    # All compliance operations
└── BillingDomain.ts       # All billing operations
```

**Not:**
```
❌ services/
   ├── getCasesService.ts
   ├── postCaseService.ts
   └── deleteCaseService.ts
```

---

### ✅ **9. Small and Focused** — PASS (75%)
**Status:** Mostly good, some large services

Most services are focused on single responsibility:

**Compliant:**
- `CaseRepository.ts` - 527 lines (case management only)
- `DocketRepository.ts` - ~300 lines (docket only)
- `ComplianceService.ts` - focused on compliance checks

**Needs Splitting:**
- `dataService.ts` - 1371 lines (facade, but should extract sub-services)
- `notificationService.ts` - 751 lines (should split toast/desktop/in-app)
- `apiClient.ts` - 734 lines (should extract health monitoring)

**Recommended:**
```typescript
// Split notificationService.ts into:
services/infrastructure/
├── notifications/
│   ├── ToastNotificationService.ts
│   ├── DesktopNotificationService.ts
│   ├── InAppNotificationService.ts
│   └── NotificationOrchestrator.ts  // Coordinates all 3
```

---

### ✅ **10. Explicit Types** — PASS (95%)
**Status:** Excellent

All services use strict TypeScript:

**Compliant Examples:**
```typescript
// ✅ Explicit input/output types
async getCase(id: CaseId): Promise<Case> { ... }
async findByStatus(status: CaseStatus): Promise<Case[]> { ... }
async updateParties(caseId: CaseId, parties: Party[]): Promise<void> { ... }

// ✅ No 'any' types found (strict mode enforced)
// ✅ Generic constraints used properly: Repository<T extends BaseEntity>
```

---

### ⚠️ **11. Don't Leak DTOs** — PARTIAL (60%)
**Status:** Some leakage occurs

API models sometimes leak to domain:

**Violations:**
```typescript
// apiClient.ts returns raw API response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ❌ This pagination format leaks to hooks/components
const { data } = await apiClient.get<PaginatedResponse<Case>>('/cases');

// ✅ Should map to domain model
export interface CaseCollection {
  cases: Case[];
  totalCount: number;
  hasNextPage: boolean;
}

// Mapper in service layer
private mapPaginatedResponse(response: PaginatedResponse<CaseDTO>): CaseCollection {
  return {
    cases: response.data.map(this.mapToCase),
    totalCount: response.total,
    hasNextPage: response.page < response.totalPages
  };
}
```

**Recommended:** Add `mappers/` directory under each domain service.

---

### ❌ **12. Test-First** — FAIL (10%)
**Status:** No frontend service tests

**Findings:**
- ✅ Backend has comprehensive test suite (`backend/test/`, `backend/src/**/*.spec.ts`)
- ❌ Frontend services have **zero test files**
- ❌ No `*.spec.ts` or `*.test.ts` files in `frontend/src/services/`

**Recommended Fix:**
```typescript
// services/domain/__tests__/CaseDomain.spec.ts
describe('CaseRepository', () => {
  let repo: CaseRepository;
  let mockApiClient: jest.Mocked<ICaseApiClient>;

  beforeEach(() => {
    mockApiClient = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    repo = new CaseRepository(mockApiClient);
  });

  describe('openCase', () => {
    it('should create case with Active status', async () => {
      const intake = { title: 'New Case' };
      mockApiClient.create.mockResolvedValue({ id: '123', ...intake });
      
      const result = await repo.openCase(intake);
      
      expect(result.status).toBe('Active');
      expect(mockApiClient.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Active' })
      );
    });
  });
});
```

---

### ✅ **13. No Side Effects at Import** — PASS (85%)
**Status:** Mostly clean

Most services avoid import-time execution:

**Compliant:**
```typescript
// ✅ Lazy initialization
export class CacheManager {
  private static instance?: CacheManager;
  
  static getInstance(): CacheManager {
    if (!this.instance) {
      this.instance = new CacheManager();
    }
    return this.instance;
  }
}
```

**Minor Violations:**
```typescript
// ⚠️ db.ts - IndexedDB opened at import (acceptable for legacy layer)
const dbPromise = openDB(DB_NAME, DB_VERSION, { ... });
```

---

### ⚠️ **14. Version Services for Breaking Changes** — PARTIAL (50%)
**Status:** No versioning strategy

**Gap:** No service versioning pattern when APIs change.

**Recommended:**
```typescript
// When breaking CaseRepository contract
export class CaseRepositoryV2 {
  // New interface
  async findActiveCases(filters: CaseFiltersV2): Promise<CaseV2[]> { ... }
}

// Maintain V1 for gradual migration
export class CaseRepository {
  async getByStatus(status: string): Promise<Case[]> {
    console.warn('Deprecated: Use CaseRepositoryV2.findActiveCases()');
    // Adapter to V2
  }
}
```

---

### ⚠️ **15. Document Responsibilities** — PARTIAL (70%)
**Status:** Good JSDoc, missing boundaries

Services have excellent documentation but lack explicit responsibility statements:

**Current (good but incomplete):**
```typescript
/**
 * CaseRepository - Enterprise Case Management
 * 
 * Provides comprehensive case lifecycle management including:
 * • CRUD operations with validation
 * • Party relationship management
 * • Status-based workflows
 */
```

**Recommended (explicit boundaries):**
```typescript
/**
 * CaseRepository - Enterprise Case Management
 * 
 * RESPONSIBILITIES:
 * ✅ Case lifecycle management (create, archive, close)
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
 */
```

---

## Priority Fixes

### 🔴 **Critical (P0) - Next Sprint**

1. **Remove Browser API Dependencies**
   - Extract localStorage → StorageAdapter interface
   - Extract window → WindowAdapter interface
   - Inject adapters into services
   - **Files:** `apiConfig.ts`, `notificationService.ts`, `workerPool.ts`, integration handlers
   - **Effort:** 8 hours

2. **Add Domain Error Classes**
   - Create `services/core/errors.ts` with DomainError base class
   - Define 20+ domain errors (UserNotFoundError, CaseNotFoundError, etc.)
   - Replace all `throw new Error()` calls
   - **Files:** All services (100+ call sites)
   - **Effort:** 12 hours

3. **Create DTO Mappers**
   - Add `mappers/` directory under each domain
   - Map API DTOs → Domain models in service methods
   - Hide PaginatedResponse from consumers
   - **Files:** All API-consuming services
   - **Effort:** 10 hours

---

### 🟡 **High (P1) - Within Month**

4. **Refactor to Intent-Based Methods**
   - Rename CaseRepository.getAll() → findActiveCases()
   - Rename CaseRepository.add() → openCase()
   - Rename CaseRepository.delete() → archiveCase()
   - **Files:** 38 repository files
   - **Effort:** 16 hours

5. **Add Interface Injection**
   - Define ICaseApiClient, IDocketApiClient interfaces
   - Inject via constructors instead of direct instantiation
   - Enable mockability for testing
   - **Files:** All repositories
   - **Effort:** 12 hours

6. **Write Service Tests**
   - Create `__tests__/` directories
   - Write unit tests for business logic
   - Mock API clients with Jest
   - Target: 80% coverage
   - **Effort:** 40 hours

---

### 🟢 **Medium (P2) - Next Quarter**

7. **Split Large Services**
   - `notificationService.ts` → 3 services + orchestrator
   - `apiClient.ts` → extract health monitoring
   - `dataService.ts` → extract sub-facades
   - **Effort:** 8 hours

8. **Add Service Versioning Strategy**
   - Document versioning patterns
   - Create V2 services for breaking changes
   - Maintain backward compatibility adapters
   - **Effort:** 6 hours

9. **Document Service Boundaries**
   - Add RESPONSIBILITIES section to JSDoc
   - Add NOT RESPONSIBLE FOR section
   - Add BOUNDARIES section
   - **Files:** All services
   - **Effort:** 10 hours

---

## Compliance Scorecard

| Principle | Score | Status | Priority |
|-----------|-------|--------|----------|
| 1. Pure Application Layer | 85% | ✅ Pass | P1 (minor fixes) |
| 2. Framework-Agnostic | 40% | ❌ Fail | **P0 Critical** |
| 3. Intent-Based Methods | 35% | ❌ Fail | P1 High |
| 4. Interface Injection | 20% | ❌ Fail | P1 High |
| 5. Stateless Services | 90% | ✅ Pass | - |
| 6. Cross-Cutting Policies | 80% | ✅ Pass | P2 (minor) |
| 7. Normalized Errors | 25% | ❌ Fail | **P0 Critical** |
| 8. Domain Grouping | 90% | ✅ Pass | - |
| 9. Small & Focused | 75% | ✅ Pass | P2 (split large) |
| 10. Explicit Types | 95% | ✅ Pass | - |
| 11. Don't Leak DTOs | 60% | ⚠️ Partial | **P0 Critical** |
| 12. Test-First | 10% | ❌ Fail | P1 High |
| 13. No Import Side Effects | 85% | ✅ Pass | - |
| 14. Service Versioning | 50% | ⚠️ Partial | P2 Medium |
| 15. Document Responsibilities | 70% | ⚠️ Partial | P2 Medium |
| **OVERALL AVERAGE** | **62%** | ⚠️ **Moderate** | - |

---

## Architecture Alignment

**Target:** Components → Hooks → Services → Repositories → Data Source Provider

**Current State:**
```
✅ Components → Hooks (clean separation)
✅ Hooks → Services (via DataService facade)
⚠️ Services → Repositories (hardcoded, should use interfaces)
⚠️ Repositories → API/DB (leaks DTOs, should map)
```

**Recommended State:**
```
Components
  ↓ (use hooks only)
Hooks (useQuery, useMutation)
  ↓ (call services)
Services (business logic, error normalization)
  ↓ (inject interfaces)
Repositories (data access, DTO mapping)
  ↓ (implement interfaces)
Data Sources (API client, IndexedDB)
```

---

## Migration Strategy

### Phase 1: Critical Fixes (Sprint 1-2)
1. Extract browser APIs → adapters
2. Add domain error classes
3. Create DTO mappers
4. **Result:** Services become portable and testable

### Phase 2: Contract Improvements (Sprint 3-4)
5. Refactor to intent-based methods
6. Add interface injection
7. Write comprehensive test suite
8. **Result:** Services align with domain language

### Phase 3: Polish (Sprint 5-6)
9. Split large services
10. Add versioning strategy
11. Document boundaries
12. **Result:** Production-ready enterprise architecture

---

## Conclusion

The service layer demonstrates **strong fundamentals** (typing, domain grouping, statelessness) but requires **critical fixes** in:

1. **Framework coupling** (localStorage, window) → Extract adapters
2. **Error handling** (generic errors) → Domain-specific errors
3. **DTO leakage** (API models in domain) → Mapper layer
4. **Testing** (no tests) → Add test suite
5. **Intent clarity** (CRUD methods) → Domain language

**Estimated Effort:** 
- **P0 Critical:** 30 hours
- **P1 High:** 68 hours
- **P2 Medium:** 24 hours
- **Total:** ~122 hours (~3 weeks for 1 developer)

**ROI:**
- ✅ Portable services (SSR, workers, tests)
- ✅ Better error debugging
- ✅ Shield from backend changes
- ✅ Easier onboarding
- ✅ Test coverage → fewer bugs
