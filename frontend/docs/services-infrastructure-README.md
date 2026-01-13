# LexiFlow API Infrastructure

Enterprise-grade API client layer for LexiFlow Enterprise Legal Platform with comprehensive error handling, retry logic, caching, and real-time communication.

## Overview

The API infrastructure provides a robust, type-safe client layer for communicating with the NestJS backend. It includes:

- **Enhanced API Client** with retry logic and exponential backoff
- **WebSocket Client** for real-time communication
- **React Hooks** for data fetching and mutations
- **API Utilities** for pagination, filtering, and type validation
- **Interceptors** for logging, error handling, and request transformation

## Architecture

```
frontend/src/
├── services/
│   └── infrastructure/
│       ├── apiClient.ts              # Base API client (fetch-based)
│       ├── apiClientEnhanced.ts      # Enhanced with retry & interceptors
│       ├── websocketClient.ts        # WebSocket/Socket.io client
│       ├── queryClient.ts            # Custom query caching client
│       ├── interceptors.ts           # Request/response interceptors
│       └── index.ts                  # Barrel exports
├── hooks/
│   ├── useApiQuery.ts                # Query hook (like React Query)
│   ├── useApiMutation.ts             # Mutation hook
│   ├── useWebSocket.ts               # WebSocket hook (already existed)
│   └── api.ts                        # Barrel exports
└── utils/
    └── api/
        ├── pagination.ts             # Pagination helpers
        ├── filters.ts                # Filter builders
        ├── typeGuards.ts             # Type guards & validators
        └── index.ts                  # Barrel exports
```

## Quick Start

### Basic API Request

```tsx
import { apiClientEnhanced } from '@/services/infrastructure';

// GET request with retry
const cases = await apiClientEnhanced.get('/cases', { status: 'open' });

// POST request (retry disabled by default for safety)
const newCase = await apiClientEnhanced.post('/cases', {
  title: 'New Case',
  status: 'open',
});

// POST with retry enabled (for idempotent operations)
const result = await apiClientEnhanced.post('/cases/sync', data, {
  retryOnPost: true,
});
```

### Using React Hooks

```tsx
import { useApiQuery, useApiMutation } from '@/hooks/api';
import { queryKeys } from '@/utils/queryKeys';
import { api } from '@/api';

function CaseList() {
  // Query with automatic caching
  const { data, isLoading, error, refetch } = useApiQuery(
    queryKeys.cases.list({ status: 'open' }),
    () => api.cases.getAll({ status: 'open' }),
    {
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: true,
    }
  );

  // Mutation with automatic cache invalidation
  const createCase = useApiMutation(
    (data: CreateCaseDto) => api.cases.create(data),
    {
      onSuccess: () => {
        toast.success('Case created!');
        queryClient.invalidate(queryKeys.cases.all());
      },
      invalidateQueries: [queryKeys.cases.all()],
    }
  );

  return (
    <div>
      {isLoading && <Spinner />}
      {error && <Error message={error.message} />}
      {data?.map(case => <CaseCard key={case.id} case={case} />)}

      <button onClick={() => createCase.mutate({ title: 'New' })}>
        Create Case
      </button>
    </div>
  );
}
```

### WebSocket Communication

```tsx
import { useWebSocket, useWebSocketEvent } from '@/hooks/useWebSocket';

function RealtimeDashboard() {
  const { isConnected, send, joinRoom } = useWebSocket({
    autoConnect: true,
    onConnect: () => console.log('Connected!'),
  });

  // Subscribe to events
  useWebSocketEvent('case-updated', (data) => {
    console.log('Case updated:', data);
    // Invalidate queries
    queryClient.invalidate(['cases', data.caseId]);
  });

  useEffect(() => {
    if (isConnected) {
      joinRoom(`case:${caseId}`);
    }
  }, [isConnected, caseId]);

  return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
}
```

### Pagination & Filtering

```tsx
import { buildPaginationParams, buildFilters } from '@/utils/api';

function DocumentList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useApiQuery(
    queryKeys.documents.list({ page, ...filters }),
    () => api.documents.getAll({
      ...buildPaginationParams(page, 20),
      ...buildFilters({
        search: filters.search,
        status: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      }),
    })
  );

  const meta = data ? getPaginationMeta(data) : null;

  return (
    <div>
      <DocumentFilters onChange={setFilters} />
      {data?.data.map(doc => <DocumentCard key={doc.id} doc={doc} />)}
      <Pagination
        currentPage={meta?.currentPage}
        totalPages={meta?.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

## Features

### Enhanced API Client

#### Retry Logic

Automatic retry with exponential backoff and jitter:

```tsx
import { apiClientEnhanced } from '@/services/infrastructure';

// Retry with default config (3 attempts, 1s initial delay)
const data = await apiClientEnhanced.get('/cases');

// Custom retry config
const data = await apiClientEnhanced.get('/cases', undefined, {
  maxRetries: 5,
  initialDelayMs: 2000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
});

// Custom retry logic
const data = await apiClientEnhanced.get('/cases', undefined, {
  shouldRetry: (error, attempt) => {
    // Custom logic
    return attempt < 3 && error.message.includes('timeout');
  },
});
```

#### Interceptors

Add custom interceptors for requests, responses, and errors:

```tsx
import { apiClientEnhanced } from '@/services/infrastructure';

// Request interceptor
const unsubscribe = apiClientEnhanced.addRequestInterceptor((endpoint, config) => {
  // Add custom headers
  return {
    endpoint,
    config: {
      ...config,
      headers: {
        ...config?.headers,
        'X-Custom-Header': 'value',
      },
    },
  };
});

// Response interceptor
apiClientEnhanced.addResponseInterceptor((response, endpoint) => {
  // Transform response
  console.log('Response from', endpoint, response);
  return response;
});

// Error interceptor
apiClientEnhanced.addErrorInterceptor((error, endpoint) => {
  // Transform error
  if (error.message.includes('404')) {
    return new Error('Resource not found');
  }
  return error;
});

// Setup all interceptors
import { setupInterceptors } from '@/services/infrastructure/interceptors';
const cleanup = setupInterceptors(apiClientEnhanced);
```

#### Request Deduplication

Automatic deduplication of in-flight requests:

```tsx
// Both requests will share the same underlying fetch
Promise.all([
  apiClientEnhanced.get('/cases/123'),
  apiClientEnhanced.get('/cases/123'),
]).then(([result1, result2]) => {
  // result1 === result2 (same instance)
});

// Skip deduplication
apiClientEnhanced.get('/cases/123', undefined, { skipCache: true });
```

### WebSocket Client

Real-time communication with automatic reconnection:

```tsx
import { websocketClient } from '@/services/infrastructure';

// Connect
await websocketClient.connect();

// Subscribe to events
const unsubscribe = websocketClient.on('notification', (data) => {
  console.log('Notification:', data);
});

// Emit events
websocketClient.emit('mark-read', { notificationId: '123' });

// Join room
await websocketClient.joinRoom('case:123');

// Leave room
await websocketClient.leaveRoom('case:123');

// Disconnect
websocketClient.disconnect();

// Get stats
const stats = websocketClient.getStats();
```

### API Utilities

#### Pagination

```tsx
import {
  buildPaginationParams,
  pageToOffset,
  getPaginationMeta,
  getPageNumbers,
} from '@/utils/api/pagination';

// Build pagination params
const params = buildPaginationParams(2, 20); // { page: 2, limit: 20 }

// Convert to offset
const offset = pageToOffset(2, 20); // { offset: 20, limit: 20 }

// Get metadata
const meta = getPaginationMeta(response);
// {
//   currentPage: 2,
//   totalPages: 10,
//   hasNextPage: true,
//   hasPreviousPage: true,
//   ...
// }

// Get page numbers for UI
const pageNumbers = getPageNumbers(5, 10, 7);
// [1, '...', 4, 5, 6, '...', 10]
```

#### Filters

```tsx
import {
  buildFilters,
  buildSearchFilter,
  buildDateRangeFilter,
  buildStatusFilter,
  COMMON_FILTER_PRESETS,
} from '@/utils/api/filters';

// Build complete filters
const filters = buildFilters({
  search: 'contract',
  status: ['open', 'pending'],
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  sortBy: 'createdAt',
  sortOrder: 'desc',
});

// Use presets
const activeFilters = COMMON_FILTER_PRESETS.activeCases.filters;
const recentFilters = COMMON_FILTER_PRESETS.recentCases.filters;

// Build query string
const queryString = buildFilterQuery(filters);
// "search=contract&status=open,pending&dateFrom=2024-01-01..."
```

#### Type Guards

```tsx
import {
  isPaginatedResponse,
  isApiError,
  validatePaginatedResponse,
  extractData,
  assertDefined,
} from '@/utils/api/typeGuards';

// Runtime type checking
if (isPaginatedResponse(response)) {
  // TypeScript knows response is PaginatedResponse
  console.log(response.total, response.page);
}

// Validate and throw if invalid
validatePaginatedResponse(response); // throws if invalid

// Extract data safely
const data = extractData(response); // T | null

// Assertions
assertDefined(data, 'Data is required'); // throws if null/undefined
```

## Configuration

### Retry Configuration

Default retry config in `apiClientEnhanced.ts`:

```tsx
{
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
}
```

### WebSocket Configuration

Configure in `/frontend/src/config/network/websocket.config.ts`:

```tsx
export const WEBSOCKET_CONFIG = {
  enabled: true,
  reconnect: {
    attempts: 5,
    delayMs: 1000,
    backoffMultiplier: 1.5,
  },
  ping: {
    intervalMs: 25000,
    timeoutMs: 5000,
  },
  maxMessageSize: 1048576, // 1MB
};
```

## Error Handling

All API errors are transformed into user-friendly messages:

```tsx
try {
  await apiClientEnhanced.get('/cases');
} catch (error) {
  // Errors are automatically transformed:
  // 401 → "Your session has expired. Please log in again."
  // 403 → "You do not have permission to access this resource."
  // 429 → "Too many requests. Please wait a moment before trying again."
  // 500 → "An internal server error occurred. Our team has been notified."
  // Network → "Network connection failed. Please check your internet connection."

  toast.error(error.message);
}
```

## Type Safety

Full TypeScript support with generics:

```tsx
interface Case {
  id: string;
  title: string;
  status: string;
}

// Type-safe query
const { data } = useApiQuery<Case[]>(
  ['cases'],
  () => api.cases.getAll()
);

// Type-safe mutation
const createCase = useApiMutation<Case, CreateCaseDto>(
  (dto) => api.cases.create(dto)
);

// Type-safe pagination
const response = await apiClientEnhanced.get<PaginatedResponse<Case>>('/cases');
```

## Performance

### Request Deduplication

In-flight requests with the same method, endpoint, and data are automatically deduplicated:

```tsx
// Only one network request is made
const [cases1, cases2, cases3] = await Promise.all([
  apiClientEnhanced.get('/cases'),
  apiClientEnhanced.get('/cases'),
  apiClientEnhanced.get('/cases'),
]);
```

### Caching

Query results are cached with configurable stale time:

```tsx
const { data } = useApiQuery(
  ['cases'],
  () => api.cases.getAll(),
  {
    staleTime: 60000, // Cache for 60 seconds
  }
);
```

### Performance Monitoring

Automatic performance tracking in development mode:

- Logs requests taking > 2 seconds
- Logs requests taking > 5 seconds in production
- Provides request timing statistics

## Testing

```tsx
import { apiClientEnhanced } from '@/services/infrastructure';

// Mock for testing
jest.mock('@/services/infrastructure', () => ({
  apiClientEnhanced: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

test('fetches cases', async () => {
  (apiClientEnhanced.get as jest.Mock).mockResolvedValue({ data: [] });

  const result = await apiClientEnhanced.get('/cases');

  expect(result).toEqual({ data: [] });
  expect(apiClientEnhanced.get).toHaveBeenCalledWith('/cases');
});
```

## Best Practices

1. **Use hooks for data fetching**: Prefer `useApiQuery` and `useApiMutation` over direct API calls
2. **Use query keys**: Always use the `queryKeys` factory for consistent cache keys
3. **Handle errors gracefully**: Use error boundaries and toast notifications
4. **Invalidate caches**: Invalidate related queries after mutations
5. **Use pagination**: Always paginate large lists
6. **Filter server-side**: Use filter builders for server-side filtering
7. **Type everything**: Use TypeScript generics for type safety
8. **Monitor performance**: Watch for slow requests in development
9. **Handle offline**: Queue messages when WebSocket is disconnected
10. **Clean up**: Always clean up subscriptions and event listeners

## Migration Guide

### From apiClient to apiClientEnhanced

```tsx
// Before
import { apiClient } from '@/services/infrastructure/apiClient';
const data = await apiClient.get('/cases');

// After (with retry)
import { apiClientEnhanced } from '@/services/infrastructure';
const data = await apiClientEnhanced.get('/cases');
```

### Adding Retry to Existing Calls

```tsx
// Add retry config
const data = await apiClientEnhanced.get('/cases', undefined, {
  maxRetries: 5,
  initialDelayMs: 2000,
});
```

### Converting to Hooks

```tsx
// Before
useEffect(() => {
  apiClient.get('/cases').then(setCases);
}, []);

// After
const { data: cases } = useApiQuery(
  queryKeys.cases.all(),
  () => api.cases.getAll()
);
```

## Troubleshooting

### Retry not working

- Check that the error is retryable (408, 429, 5xx)
- Verify `skipRetry` is not set to `true`
- For POST requests, set `retryOnPost: true`

### WebSocket not connecting

- Verify `WEBSOCKET_CONFIG.enabled` is `true`
- Check that the WebSocket URL is correct
- Ensure JWT token is valid
- Check browser console for errors

### Cache not invalidating

- Use `queryClient.invalidate()` after mutations
- Verify query keys match exactly
- Check that `invalidateQueries` is set in mutation options

### Type errors

- Ensure generic type parameters are specified
- Verify response structure matches type definitions
- Use type guards for runtime validation

## Contributing

When adding new features to the API infrastructure:

1. Update this README
2. Add TypeScript types
3. Write tests
4. Update the AGENT_SCRATCHPAD.md
5. Create examples in this document

## License

Copyright © 2024-2026 LexiFlow. All rights reserved.
