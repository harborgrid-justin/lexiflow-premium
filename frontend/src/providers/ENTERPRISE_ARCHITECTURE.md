# Data Source Provider - Enterprise Architecture

## Overview

The Data Source Provider implements a comprehensive enterprise architecture following 15 critical patterns for production-grade data layer infrastructure.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       COMPONENTS                            │
│                    (Presentation Layer)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        HOOKS                                │
│                  (Orchestration Layer)                      │
│   useCase(), useDocuments(), useBilling()                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  REPOSITORY INTERFACE                       │
│                (Stable Domain Contracts)                    │
│   CaseRepository, DocumentRepository, etc.                  │
│   ✓ No HTTP details ✓ Domain operations only               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              DATA SOURCE PROVIDER                           │
│               (Infrastructure Boundary)                     │
│   • Memoized repositories (Pattern 8)                       │
│   • Configuration management (Pattern 7)                    │
│   • Error normalization (Pattern 5)                         │
│   • Observability hooks (Pattern 11)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌────────────────────┐    ┌────────────────────┐
│  Backend API       │    │  IndexedDB         │
│  (PostgreSQL)      │    │  (Local Fallback)  │
└────────────────────┘    └────────────────────┘
```

## 15 Enterprise Patterns Applied

### 1. Treat as Infrastructure

**Principle**: Position the provider as infrastructure, not business logic.

**Implementation**:
- Provider lives in `providers/` folder (infrastructure layer)
- Business logic resides in hooks and services
- Repositories are swappable without affecting consumers

**Benefits**:
- Data sources can be replaced without refactoring
- Clear separation of concerns
- Easier testing and mocking

### 2. Expose Stable Repository Interface

**Principle**: Expose data access through explicit repository-style interfaces, not raw clients.

**Implementation**:
```typescript
interface CaseRepository {
  getAll(filters?: Record<string, unknown>): Promise<Case[]>;
  getById(id: string): Promise<Case | null>;
  create(data: Partial<Case>): Promise<Case>;
  // NO HTTP methods like fetch(), axios.get(), etc.
}
```

**Files**:
- `providers/repository/types.ts` - Repository interfaces
- `providers/DataSourceContext.tsx` - createRepositories() factory

**Benefits**:
- Prevents tight coupling to Axios, Fetch, GraphQL
- Enables backend changes without consumer impact
- Type-safe domain operations

### 3. Do Not Expose Transport Details

**Principle**: Never expose HTTP headers, query params, or response formats.

**Implementation**:
- Repository methods accept domain objects, not QueryParams
- Errors are normalized to domain errors (UnauthorizedError, not HTTP 401)
- No Headers, URLSearchParams, or Request objects in signatures

**Anti-patterns to avoid**:
```typescript
// ❌ BAD - Exposes HTTP details
getAll(headers: Headers, params: URLSearchParams)

// ✅ GOOD - Domain concepts only
getAll(filters?: { status: string, dateRange: DateRange })
```

**Benefits**:
- Enables protocol changes (REST → GraphQL) without impact
- Cleaner API surface
- Easier to test

### 4. Centralize Authentication and Authorization

**Principle**: Handle token injection, refresh, and permission checks inside the provider.

**Implementation**:
```typescript
interface AuthProvider {
  getAccessToken(): Promise<string | null>;
  refreshToken(): Promise<void>;
  checkPermission(resource: string, action: string): Promise<boolean>;
}

// Injected into config
const config = {
  authProvider: myAuthProvider
};
```

**Files**:
- `providers/repository/types.ts` - AuthProvider interface
- `providers/repository/config.ts` - Config with authProvider

**Benefits**:
- Prevents security logic duplication
- Consistent auth handling
- Single point of token refresh

### 5. Normalize Errors at Provider Boundary

**Principle**: Translate transport errors into domain-specific error types.

**Implementation**:
```typescript
// HTTP 401 → UnauthorizedError
// HTTP 403 → ForbiddenError
// HTTP 404 → NotFoundError
// Network failure → NetworkError
// Timeout → TimeoutError

class ErrorFactory {
  static fromHttpStatus(status: number): RepositoryError { ... }
}
```

**Files**:
- `providers/repository/errors.ts` - All domain error types

**Benefits**:
- Consistent error handling across app
- No HTTP status codes in business logic
- User-friendly error messages

### 6. Make Provider Stateless When Possible

**Principle**: Avoid storing fetched data in the provider unless it is truly global.

**Implementation**:
- Provider stores: Configuration, current source type
- Provider does NOT store: Cases, documents, entities
- Data caching belongs in React Query layer

**Code**:
```typescript
// DATA OWNERSHIP (Pattern 15):
// - OWNS: Configuration state, current source type
// - FETCHES: Nothing (stateless provider)
// - NEVER CACHES: Repository data (belongs in React Query)
// - CONSISTENCY: Strong (configuration is local state)
```

**Benefits**:
- Clearer data ownership
- Prevents memory leaks
- Specialized caching in React Query

### 7. Support Multiple Environments Explicitly

**Principle**: Configure base URLs, API versions, and feature toggles via typed configuration.

**Implementation**:
```typescript
interface DataSourceEnvironmentConfig {
  environment: 'development' | 'staging' | 'production' | 'test';
  apiBaseUrl: string;
  apiVersion: 'v1' | 'v2' | 'v3';
  features: {
    enableCaching: boolean;
    enableRetries: boolean;
    enableMetrics: boolean;
  };
}

const config = ENVIRONMENT_CONFIGS[process.env.NODE_ENV];
```

**Files**:
- `providers/repository/config.ts` - ENVIRONMENT_CONFIGS

**Benefits**:
- Predictable behavior across environments
- Easy environment switching
- Feature flag support

### 8. Memoize Repository Instances

**Principle**: Ensure repository instances are created once and are referentially stable.

**Implementation**:
```typescript
const repositories = useMemo<RepositoryRegistry>(() => {
  return createRepositories(config);
}, [config]);

// Consumer code - same reference every render
const { repositories } = useDataSource();
```

**Benefits**:
- Prevents unnecessary re-instantiation
- Stable references for React deps arrays
- Better performance

### 9. Avoid Cross-Domain Dependencies

**Principle**: Repositories should not depend on each other unless explicitly designed.

**Implementation**:
```typescript
// Each repository is independent
const registry = {
  cases: createCaseRepository(config),
  documents: createDocumentRepository(config),
  // NO: documents: createDocumentRepository(cases) ❌
};
```

**Benefits**:
- Prevents hidden coupling
- No circular dependencies
- Easier unit testing

### 10. Enforce Timeouts and Retries Centrally

**Principle**: Standardize retry, backoff, and timeout behavior.

**Implementation**:
```typescript
interface RetryConfig {
  maxAttempts: number;
  initialBackoffMs: number;
  backoffMultiplier: number;
  retryableErrorCodes: string[];
}

const DEFAULT_RETRY = {
  maxAttempts: 3,
  initialBackoffMs: 1000,
  backoffMultiplier: 2,
};
```

**Files**:
- `providers/repository/config.ts` - TimeoutConfig, RetryConfig

**Benefits**:
- Consistent reliability behavior
- No ad hoc retry logic in hooks
- Centralized configuration

### 11. Instrument Observability at Provider Level

**Principle**: Log, trace, and emit metrics for all outbound calls.

**Implementation**:
```typescript
interface ObservabilityConfig {
  logger?: RepositoryLogger;
  tracer?: RepositoryTracer;
  metrics?: RepositoryMetrics;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  tracingSampleRate: number;
}

// Usage
config.observability.logger?.info('Creating repositories', { env });
config.observability.tracer?.startSpan('getAll');
config.observability.metrics?.recordOperation('cases', 'getAll', 150, true);
```

**Files**:
- `providers/repository/types.ts` - Observability interfaces
- `providers/repository/config.ts` - ObservabilityConfig

**Benefits**:
- Production debugging
- Performance monitoring
- Distributed tracing

### 12. Design for Server-Side Rendering (SSR)

**Principle**: Ensure provider initialization is SSR-safe and request-scoped.

**Implementation**:
```typescript
// SSR-safe initialization
const [currentSource, setCurrentSource] = useState<DataSourceType>(
  () => typeof window !== 'undefined' 
    ? getInitialDataSource() 
    : 'postgresql' // Server default
);

// Check window before localStorage
if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
  localStorage.setItem('key', 'value');
}
```

**Benefits**:
- No hydration mismatches
- Prevents data leakage between requests
- Works with Next.js, Remix

### 13. Enable Mock and Stub Injection

**Principle**: Allow alternative implementations for tests and local development.

**Implementation**:
```typescript
// Provider props
interface DataSourceProviderProps {
  children: React.ReactNode;
  repositories?: RepositoryRegistry; // Inject mocks
  config?: DataSourceConfig;         // Override config
}

// Test usage
<DataSourceProvider repositories={mockRepositories}>
  <MyComponent />
</DataSourceProvider>
```

**Files**:
- `providers/DataSourceContext.types.ts` - Props with mock support
- `providers/repository/config.ts` - createTestConfig()

**Benefits**:
- Deterministic testing
- Offline development
- Fast test execution

### 14. Version API Access Explicitly

**Principle**: Support API versioning at the provider layer.

**Implementation**:
```typescript
interface DataSourceEnvironmentConfig {
  apiVersion: 'v1' | 'v2' | 'v3';
}

// Request includes version
fetch(`${baseUrl}/${apiVersion}/cases`)
```

**Files**:
- `providers/repository/config.ts` - apiVersion field

**Benefits**:
- Gradual backend migrations
- Support multiple API versions
- Backward compatibility

### 15. Document Data Ownership and Consistency Rules

**Principle**: Clearly state what data the provider owns, fetches, and does not cache.

**Implementation**:
```typescript
// In provider documentation
/**
 * DATA OWNERSHIP (Pattern 15):
 * - OWNS: Configuration state, current source type
 * - FETCHES: Nothing (stateless provider)
 * - NEVER CACHES: Repository data (belongs in React Query)
 * - CONSISTENCY: Strong (configuration is local state)
 */

interface DataOwnership {
  owns: string[];
  fetches: string[];
  neverCache: string[];
  consistency: 'strong' | 'eventual' | 'none';
}
```

**Benefits**:
- Prevents misuse
- Avoids duplicate caching
- Clear architectural boundaries

## Usage Examples

### Basic Usage

```typescript
import { AppProviders } from '@/providers';

function App() {
  return (
    <AppProviders>
      <YourApp />
    </AppProviders>
  );
}
```

### Access Repositories

```typescript
import { useDataSource } from '@/providers';

function CaseList() {
  const { repositories } = useDataSource();
  
  // Pattern 2: Stable repository interface (no HTTP details)
  const cases = await repositories.cases.getAll({ status: 'Active' });
  
  // Pattern 5: Normalized errors
  try {
    const case = await repositories.cases.getById(id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      toast.error('Case not found');
    } else if (error instanceof UnauthorizedError) {
      navigate('/login');
    }
  }
}
```

### Testing with Mocks

```typescript
import { DataSourceProvider } from '@/providers';
import { createTestConfig } from '@/providers/repository/config';

const mockRepositories = {
  cases: {
    getAll: jest.fn().mockResolvedValue([{ id: '1', title: 'Test' }]),
    getById: jest.fn(),
  },
};

describe('CaseList', () => {
  it('renders cases', () => {
    render(
      <DataSourceProvider 
        repositories={mockRepositories}
        config={createTestConfig()}
      >
        <CaseList />
      </DataSourceProvider>
    );
  });
});
```

### Custom Configuration

```typescript
import { DataSourceConfigBuilder } from '@/providers/repository/config';

const customConfig = new DataSourceConfigBuilder('production')
  .withApiBaseUrl('https://api.example.com')
  .withApiVersion('v2')
  .withTimeouts({ default: 60000, operations: { read: 30000 } })
  .withRetries({ maxAttempts: 5 })
  .withObservability({
    logger: myLogger,
    tracer: myTracer,
    logLevel: 'info',
  })
  .build();

<DataSourceProvider config={customConfig}>
  <App />
</DataSourceProvider>
```

### Error Handling

```typescript
import { 
  isRepositoryError, 
  isRetryableError, 
  getUserMessage 
} from '@/providers/repository/errors';

async function handleOperation() {
  try {
    await repositories.cases.create(data);
  } catch (error) {
    if (isRetryableError(error)) {
      // Retry with backoff
      await retryOperation();
    } else if (error instanceof ValidationError) {
      // Show validation errors
      setErrors(error.validationErrors);
    } else {
      // Generic error handling
      toast.error(getUserMessage(error));
    }
    
    // Log with appropriate severity
    logger[getErrorSeverity(error)](error.message);
  }
}
```

## Migration Guide

### From Direct API Calls

**Before:**
```typescript
const response = await fetch(`/api/cases/${id}`, {
  headers: { Authorization: `Bearer ${token}` }
});
const case = await response.json();
```

**After:**
```typescript
const { repositories } = useDataSource();
const case = await repositories.cases.getById(id);
// Auth is handled automatically (Pattern 4)
// Errors are normalized (Pattern 5)
```

### From DataService

**Before:**
```typescript
import { DataService } from '@/services/data/dataService';
const cases = await DataService.cases.getAll();
```

**After:**
```typescript
const { repositories } = useDataSource();
const cases = await repositories.cases.getAll();
// Same API, but with enterprise patterns applied
```

## File Structure

```
frontend/src/providers/
├── DataSourceContext.tsx          # Provider implementation
├── DataSourceContext.types.ts     # Provider type definitions
├── repository/
│   ├── types.ts                   # Repository interfaces (Pattern 2)
│   ├── config.ts                  # Configuration (Pattern 7, 10, 11, 14)
│   └── errors.ts                  # Normalized errors (Pattern 5)
└── ENTERPRISE_ARCHITECTURE.md     # This file
```

## Performance Considerations

- **Repository Memoization**: Instances created once per config (Pattern 8)
- **State Splitting**: Separate state/actions contexts for granular updates
- **Lazy Loading**: Repositories loaded on first access
- **Memory**: ~2KB per repository instance
- **SSR**: No hydration mismatches (Pattern 12)

## Security

- **Authentication**: Centralized in AuthProvider (Pattern 4)
- **Token Refresh**: Handled transparently
- **Permission Checks**: Before repository operations
- **No Credentials in URLs**: All auth via headers internally

## Observability

Configure logging, tracing, and metrics:

```typescript
const config = {
  observability: {
    logger: {
      info: (msg, ctx) => console.info(msg, ctx),
      error: (msg, err, ctx) => console.error(msg, err, ctx),
    },
    tracer: openTelemetryTracer,
    metrics: prometheusCollector,
    logLevel: 'info',
    tracingSampleRate: 0.1,
  }
};
```

## Best Practices

1. **Always use repositories** - Never bypass to raw API calls
2. **Handle errors properly** - Use normalized error types
3. **Inject mocks for tests** - Don't test against real APIs
4. **Configure per environment** - Use ENVIRONMENT_CONFIGS
5. **Document data ownership** - Be clear about caching layers
6. **Monitor observability** - Use logger/tracer/metrics in production
7. **Version your APIs** - Plan for gradual migrations
8. **Keep stateless** - Don't store entity data in provider

## Troubleshooting

### Repository not updating

- Check if you're using memoized repository reference
- Verify config hasn't changed (triggers new instances)

### Authentication errors

- Ensure authProvider is configured in config
- Check token refresh logic in AuthProvider

### Timeout errors

- Adjust timeout config per operation type
- Check retry configuration for network issues

### SSR hydration mismatch

- Verify SSR-safe initialization (Pattern 12)
- Check localStorage access is guarded by `typeof window`

## Future Enhancements

- [ ] GraphQL support via pluggable repositories
- [ ] WebSocket streaming repositories
- [ ] Offline-first with sync queue
- [ ] Request deduplication
- [ ] Cache warming strategies
- [ ] Circuit breaker pattern

## References

- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Infrastructure as Code](https://www.terraform.io/docs)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [React Context Best Practices](https://kentcdodds.com/blog/application-state-management-with-react)
