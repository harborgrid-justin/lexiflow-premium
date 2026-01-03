# Enterprise API Module

Production-grade HTTP client with advanced error handling, retry logic, rate limiting, and request/response interceptors for LexiFlow Premium.

## Features

### 🔄 Automatic Retry with Exponential Backoff
- Configurable retry attempts (default: 3)
- Exponential backoff with jitter to prevent thundering herd
- Smart retry logic based on error type
- Circuit breaker pattern for degraded services

### 🚦 Client-Side Rate Limiting
- Token bucket algorithm
- Per-endpoint rate limits
- Request queuing for throttled requests
- Automatic retry after rate limit reset

### 🎯 Request/Response Interceptors
- Request ID generation for tracing
- Performance monitoring
- Authentication token injection
- Request/response logging
- Error transformation
- Case conversion (snake_case ↔ camelCase)

### ❌ Comprehensive Error Handling
- Structured error types
- User-friendly error messages
- Network error detection
- Timeout handling
- Authentication/authorization errors
- Validation errors with field-level details

### 📦 Request Caching
- Configurable TTL
- Per-request cache control
- Cache invalidation
- Stale-while-revalidate pattern

## Installation

```typescript
import { enterpriseApi } from '@/api/enterprise';
```

## Basic Usage

### Simple GET Request

```typescript
import { enterpriseApi } from '@/api/enterprise';

// Fetch all cases
const cases = await enterpriseApi.get<Case[]>('/cases');

// Fetch with query parameters
const filteredCases = await enterpriseApi.get<Case[]>('/cases', {
  status: 'active',
  assignedTo: userId
});
```

### POST Request

```typescript
// Create new case
const newCase = await enterpriseApi.post<Case>('/cases', {
  title: 'New Case',
  status: 'active',
  clientId: '123'
});
```

### PUT/PATCH Requests

```typescript
// Full update
const updatedCase = await enterpriseApi.put<Case>(`/cases/${id}`, {
  title: 'Updated Title',
  status: 'closed'
});

// Partial update
const patchedCase = await enterpriseApi.patch<Case>(`/cases/${id}`, {
  status: 'in_progress'
});
```

### DELETE Request

```typescript
await enterpriseApi.delete(`/cases/${id}`);
```

### File Upload

```typescript
const uploadedDoc = await enterpriseApi.upload<Document>(
  '/documents/upload',
  file,
  { caseId: '123', category: 'evidence' }
);
```

## Advanced Usage

### Custom Configuration

```typescript
import { createEnterpriseApi } from '@/api/enterprise';

const customApi = createEnterpriseApi({
  baseUrl: 'https://api.example.com',
  apiPrefix: '/v2',
  timeout: 60000,
  enableLogging: true,
  enablePerformance: true,
  retry: {
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 60000
  },
  rateLimit: {
    maxRequests: 200,
    windowMs: 60000
  },
  enableCache: true,
  cacheTTL: 600000
});
```

### Request Options

```typescript
// Disable retry for specific request
const data = await enterpriseApi.get('/critical-endpoint', undefined, {
  noRetry: true
});

// Custom timeout
const data = await enterpriseApi.get('/slow-endpoint', undefined, {
  timeout: 120000
});

// Disable rate limiting
const data = await enterpriseApi.get('/unlimited-endpoint', undefined, {
  noRateLimit: true
});

// Enable caching
const data = await enterpriseApi.get('/cacheable-endpoint', undefined, {
  cache: true,
  cacheKey: 'custom-key'
});

// Request cancellation
const controller = new AbortController();
const data = await enterpriseApi.get('/endpoint', undefined, {
  signal: controller.signal
});

// Later...
controller.abort();
```

### Custom Interceptors

```typescript
import { createAuthInterceptor } from '@/api/enterprise';

const api = createEnterpriseApi();

// Add custom request interceptor
api.getInterceptors().addRequestInterceptor((config) => {
  config.headers['X-Custom-Header'] = 'value';
  return config;
});

// Add custom response interceptor
api.getInterceptors().addResponseInterceptor(async (response, data) => {
  console.log('Response received:', data);
  return data;
});

// Add custom error interceptor
api.getInterceptors().addErrorInterceptor(async (error) => {
  console.error('Request failed:', error);
  return error;
});
```

### Rate Limiter Control

```typescript
// Get rate limit status
const status = enterpriseApi.getRateLimiter().getStatus('/cases');
console.log(`Remaining: ${status.remaining}/${status.limit}`);
console.log(`Resets at: ${status.resetAt}`);

// Clear rate limiter
enterpriseApi.getRateLimiter().reset();
```

### Circuit Breaker

```typescript
// Get circuit breaker state
const state = enterpriseApi.getRetryHandler().getCircuitBreakerState();
console.log(`Circuit breaker: ${state}`); // 'closed', 'open', or 'half-open'

// Manually reset circuit breaker
enterpriseApi.getRetryHandler().manualReset();
```

### Cache Management

```typescript
// Clear all cache
enterpriseApi.clearCache();

// Invalidate specific cache entry
enterpriseApi.invalidateCache('/cases');
```

## Error Handling

### Error Types

```typescript
import {
  ApiErrorBase,
  NetworkError,
  RateLimitError,
  AuthError,
  AuthorizationError,
  ValidationError,
  NotFoundError,
  TimeoutError,
  ServerError
} from '@/api/enterprise';

try {
  const data = await enterpriseApi.get('/endpoint');
} catch (error) {
  if (error instanceof NetworkError) {
    console.error('Network issue:', error.getUserMessage());
  } else if (error instanceof RateLimitError) {
    console.error(`Rate limited. Retry after ${error.retryAfter}s`);
  } else if (error instanceof ValidationError) {
    console.error('Validation errors:', error.fieldErrors);
  } else if (error instanceof AuthError) {
    // Redirect to login
    window.location.href = '/login';
  }
}
```

### User-Friendly Messages

```typescript
try {
  const data = await enterpriseApi.get('/endpoint');
} catch (error) {
  if (error instanceof ApiErrorBase) {
    // Show user-friendly message
    toast.error(error.getUserMessage());

    // Log detailed error for debugging
    console.error('API Error:', error.toJSON());
  }
}
```

## React Hooks Integration

Use the enterprise data hooks for seamless React integration:

```typescript
import {
  useCasesQuery,
  useCreateCaseMutation,
  useUpdateCaseMutation
} from '@/hooks/useEnterpriseData';

function CasesList() {
  const { data: cases, isLoading, error } = useCasesQuery();
  const createCase = useCreateCaseMutation();
  const updateCase = useUpdateCaseMutation();

  const handleCreate = async () => {
    await createCase.mutate({
      title: 'New Case',
      status: 'active'
    });
  };

  const handleUpdate = async (id: string) => {
    await updateCase.mutate({
      id,
      data: { status: 'closed' }
    });
  };

  if (isLoading) return <Spinner />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <div>
      <button onClick={handleCreate}>Create Case</button>
      {cases?.map(c => (
        <CaseCard
          key={c.id}
          case={c}
          onUpdate={() => handleUpdate(c.id)}
        />
      ))}
    </div>
  );
}
```

## Best Practices

### 1. Use Query Keys for Caching

```typescript
import { enterpriseQueryKeys } from '@/hooks/useEnterpriseData';

// Consistent cache keys
const { data } = useCasesQuery();

// Invalidate related queries
queryClient.invalidate(enterpriseQueryKeys.cases.all());
```

### 2. Implement Optimistic Updates

```typescript
const updateCase = useUpdateCaseMutation({
  onMutate: async ({ id, data }) => {
    // Cancel in-flight queries
    await queryClient.cancelQueries(enterpriseQueryKeys.cases.byId(id));

    // Save snapshot
    const previous = queryClient.getQueryState(
      enterpriseQueryKeys.cases.byId(id)
    );

    // Optimistically update
    queryClient.setQueryData(
      enterpriseQueryKeys.cases.byId(id),
      (old) => ({ ...old, ...data })
    );

    return { previous };
  },
  onError: (_error, { id }, context) => {
    // Rollback on error
    queryClient.setQueryData(
      enterpriseQueryKeys.cases.byId(id),
      context?.previous
    );
  }
});
```

### 3. Handle Loading States

```typescript
function DataComponent() {
  const { data, isLoading, error } = useCasesQuery();

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorBoundary error={error} />;
  if (!data || data.length === 0) return <EmptyState />;

  return <DataDisplay data={data} />;
}
```

### 4. Prefetch for Better UX

```typescript
function CaseCard({ caseId }: { caseId: string }) {
  const prefetch = usePrefetchCase(caseId);

  return (
    <Link
      to={`/cases/${caseId}`}
      onMouseEnter={prefetch}
    >
      Case Details
    </Link>
  );
}
```

## Configuration Reference

### RetryConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxRetries` | number | 3 | Maximum retry attempts |
| `baseDelay` | number | 1000 | Base delay in ms |
| `maxDelay` | number | 30000 | Maximum delay in ms |
| `backoffFactor` | number | 2 | Exponential backoff multiplier |
| `useJitter` | boolean | true | Add random jitter |
| `timeout` | number | 30000 | Request timeout in ms |

### RateLimitConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxRequests` | number | 100 | Max requests per window |
| `windowMs` | number | 60000 | Time window in ms |
| `maxQueueSize` | number | 50 | Max queued requests |
| `enableQueuing` | boolean | true | Queue throttled requests |
| `endpointLimits` | object | {} | Per-endpoint overrides |

### EnterpriseApiConfig

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | string | - | API base URL |
| `apiPrefix` | string | '/api' | API prefix |
| `timeout` | number | 30000 | Default timeout |
| `retry` | RetryConfig | - | Retry configuration |
| `rateLimit` | RateLimitConfig | - | Rate limit config |
| `enableLogging` | boolean | false | Enable logging |
| `enablePerformance` | boolean | true | Track performance |
| `enableCache` | boolean | false | Enable caching |
| `cacheTTL` | number | 300000 | Cache TTL in ms |

## Troubleshooting

### Rate Limit Errors

If you're hitting rate limits frequently:

```typescript
// Increase rate limit
const api = createEnterpriseApi({
  rateLimit: {
    maxRequests: 200,
    windowMs: 60000
  }
});

// Or disable for development
const api = createEnterpriseApi({
  rateLimit: {
    maxRequests: 99999,
    enableQueuing: false
  }
});
```

### Timeout Errors

For slow endpoints:

```typescript
// Increase global timeout
const api = createEnterpriseApi({
  timeout: 120000
});

// Or per-request
const data = await api.get('/slow-endpoint', undefined, {
  timeout: 180000
});
```

### Debug Logging

Enable logging to troubleshoot issues:

```typescript
const api = createEnterpriseApi({
  enableLogging: true,
  enablePerformance: true
});
```

## License

MIT © LexiFlow Premium
