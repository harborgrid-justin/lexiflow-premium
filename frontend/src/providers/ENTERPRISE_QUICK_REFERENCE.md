# Data Source Provider - Quick Reference

## Import

```typescript
import { useDataSource } from '@/providers';
import { 
  UnauthorizedError, 
  NotFoundError, 
  ValidationError 
} from '@/providers/repository/errors';
```

## Access Repositories

```typescript
function MyComponent() {
  const { repositories, config } = useDataSource();
  
  // All repositories are available
  const cases = await repositories.cases.getAll();
  const documents = await repositories.documents.getById(id);
  const conflicts = await repositories.compliance.checkConflicts(clientId);
}
```

## Error Handling

```typescript
try {
  await repositories.cases.create(data);
} catch (error) {
  if (error instanceof UnauthorizedError) {
    // Redirect to login
    navigate('/login');
  } else if (error instanceof NotFoundError) {
    // Show not found message
    toast.error(`${error.entityType} not found`);
  } else if (error instanceof ValidationError) {
    // Show validation errors
    error.validationErrors.forEach(err => {
      setFieldError(err.field, err.message);
    });
  } else if (isRetryableError(error)) {
    // Retry logic
    await retry(operation);
  }
}
```

## Testing

```typescript
import { DataSourceProvider } from '@/providers';
import { createTestConfig } from '@/providers/repository/config';

const mockRepositories = {
  cases: {
    getAll: jest.fn().mockResolvedValue([]),
    getById: jest.fn().mockResolvedValue({ id: '1' }),
  },
};

<DataSourceProvider 
  repositories={mockRepositories}
  config={createTestConfig()}
>
  <MyComponent />
</DataSourceProvider>
```

## Configuration

```typescript
import { DataSourceConfigBuilder } from '@/providers/repository/config';

const config = new DataSourceConfigBuilder('production')
  .withApiBaseUrl('https://api.example.com')
  .withApiVersion('v2')
  .withTimeouts({ default: 30000 })
  .build();
```

## Available Repositories

- `cases` - Case management
- `documents` - Document storage and versioning
- `compliance` - Compliance checks and scans
- `evidence` - Evidence management
- `discovery` - Discovery operations
- `pleadings` - Pleading documents
- `depositions` - Deposition records
- `hearings` - Hearing schedules
- `billing` - Billing and invoicing
- `timeEntries` - Time tracking
- `clients` - Client management
- `analytics` - Analytics and reporting
- `reports` - Report generation

## Error Types

- `UnauthorizedError` - Authentication required (401)
- `ForbiddenError` - Insufficient permissions (403)
- `NotFoundError` - Entity not found (404)
- `ValidationError` - Data validation failed (422)
- `ConflictError` - Duplicate or conflict (409)
- `NetworkError` - Network connectivity issue (retryable)
- `TimeoutError` - Operation timeout (retryable)
- `ServerError` - Server error 5xx (retryable)
- `RateLimitError` - Rate limit exceeded (retryable)
- `BusinessRuleError` - Business rule violation
- `ConcurrencyError` - Optimistic locking failure

## Patterns Summary

| # | Pattern | Key Benefit |
|---|---------|-------------|
| 1 | Infrastructure Positioning | Swappable data sources |
| 2 | Stable Repository Interface | No HTTP coupling |
| 3 | No Transport Details | Protocol independence |
| 4 | Centralized Auth | Consistent security |
| 5 | Normalized Errors | Clean error handling |
| 6 | Stateless Provider | Clear data ownership |
| 7 | Multiple Environments | Environment parity |
| 8 | Memoized Repositories | Performance |
| 9 | No Cross-Domain Deps | Loose coupling |
| 10 | Centralized Timeouts/Retries | Reliability |
| 11 | Observability | Production monitoring |
| 12 | SSR-Safe | Next.js compatible |
| 13 | Mock Injection | Testability |
| 14 | API Versioning | Gradual migrations |
| 15 | Data Ownership Docs | Clear boundaries |

## Architecture

```
Components → Hooks → Repositories → Provider → Backend/IndexedDB
```

- **Provider** = Infrastructure boundary
- **Repositories** = Domain contracts
- **Hooks** = Orchestration
- **Components** = Presentation

## Files

```
providers/
├── DataSourceContext.tsx           # Provider
├── DataSourceContext.types.ts      # Types
├── ENTERPRISE_ARCHITECTURE.md      # Full docs
├── ENTERPRISE_QUICK_REFERENCE.md   # This file
└── repository/
    ├── types.ts                    # Repository interfaces
    ├── config.ts                   # Configuration
    ├── errors.ts                   # Error types
    └── index.ts                    # Barrel export
```
