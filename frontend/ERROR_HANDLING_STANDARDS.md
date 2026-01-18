# Error Handling Standards

## Overview
This document defines error handling patterns and standards for the LexiFlow Premium frontend codebase.

---

## Error Handling Patterns

### 1. BaseService-Derived Classes

**Pattern**: Use BaseService error handling methods

```typescript
class MyService extends BaseService<MyConfig> {
  async performOperation(): Promise<void> {
    try {
      await riskyOperation();
    } catch (error) {
      // Use BaseService error method (includes service name)
      this.error('Operation failed:', error);
      
      // Throw ServiceError for user-facing failures
      throw new ServiceError(
        this.name,
        'User-friendly error message',
        error
      );
    }
  }
  
  async performNonCritical(): Promise<void> {
    try {
      await operation();
    } catch (error) {
      // Log but don't throw for non-critical failures
      this.warn('Non-critical operation failed:', error);
    }
  }
}
```

**Key Methods**:
- `this.error()` - For errors (logs with [ServiceName] prefix)
- `this.warn()` - For warnings
- `this.info()` - For info logging
- `this.debug()` - For debug logging

### 2. Static Utility Services

**Pattern**: Use console.error with service prefix

```typescript
export class UtilityService {
  static async operation(): Promise<void> {
    try {
      await riskyOperation();
    } catch (error) {
      // Prefix with service name for traceability
      console.error('[UtilityService] Operation failed:', error);
      
      // Re-throw or handle gracefully based on criticality
      throw error;
    }
  }
  
  static safeParse(data: string): unknown | null {
    try {
      return JSON.parse(data);
    } catch (error) {
      // Log and return fallback for non-critical
      console.warn('[UtilityService] Parse failed:', error);
      return null;
    }
  }
}
```

### 3. Domain Services (API Facades)

**Pattern**: Transform and enrich errors

```typescript
export const DomainService = {
  async fetchData(id: string): Promise<Data> {
    try {
      return await apiClient.get(`/data/${id}`);
    } catch (error) {
      // Enrich with context
      console.error('[DomainService] Fetch failed:', { id, error });
      
      // Transform to domain error
      throw new DomainError(
        'Failed to load data',
        { cause: error, resourceId: id }
      );
    }
  }
};
```

### 4. React Components

**Pattern**: Use error boundaries and toast notifications

```typescript
function MyComponent() {
  const { notify } = useNotification();
  
  const handleAction = async () => {
    try {
      await service.operation();
      notify.success('Operation completed');
    } catch (error) {
      // User-facing error notification
      notify.error(
        'Operation failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      // Log for debugging
      console.error('[MyComponent] Action failed:', error);
    }
  };
  
  return <button onClick={handleAction}>Action</button>;
}
```

### 5. Async Operations with Retry

**Pattern**: Use retryWithBackoff utility

```typescript
import { retryWithBackoff } from '@/services/core/factories/Utilities';

async function reliableOperation() {
  return retryWithBackoff(
    async () => await unstableOperation(),
    { 
      maxRetries: 3,
      baseDelay: 1000,
      onRetry: (attempt, error) => {
        console.warn(`[Operation] Retry ${attempt}/3:`, error);
      }
    }
  );
}
```

---

## Error Types

### 1. ServiceError
**Use**: Service-level failures
```typescript
throw new ServiceError(
  'ServiceName',
  'User-friendly message',
  originalError
);
```

### 2. ValidationError
**Use**: Data validation failures
```typescript
throw new ValidationError('Email format is invalid');
```

### 3. DomainError
**Use**: Business logic violations
```typescript
throw new DomainError('Cannot delete active case', {
  cause: error,
  caseId: id
});
```

### 4. NetworkError
**Use**: API/Network failures
```typescript
throw new NetworkError('API request failed', {
  endpoint: '/api/data',
  status: 500
});
```

---

## Best Practices

### ✅ DO

1. **Always prefix with service/component name**
   ```typescript
   console.error('[MyService] Operation failed:', error);
   ```

2. **Include context in error logs**
   ```typescript
   console.error('[DataService] Fetch failed:', { id, filters, error });
   ```

3. **Use appropriate log levels**
   - `error` - Critical failures that need attention
   - `warn` - Non-critical issues or fallback behavior
   - `info` - Important state changes
   - `debug` - Detailed debugging info

4. **Throw user-friendly errors**
   ```typescript
   throw new ServiceError(
     'CaseService',
     'Failed to save case. Please try again.',
     error
   );
   ```

5. **Clean up resources in finally blocks**
   ```typescript
   try {
     await operation();
   } catch (error) {
     this.error('Operation failed:', error);
     throw error;
   } finally {
     this.cleanup();
   }
   ```

### ❌ DON'T

1. **Don't swallow errors silently**
   ```typescript
   // BAD
   try {
     await operation();
   } catch (error) {
     // Silent failure - no one knows it failed
   }
   
   // GOOD
   try {
     await operation();
   } catch (error) {
     console.warn('[Service] Operation failed (non-critical):', error);
   }
   ```

2. **Don't log the same error multiple times**
   ```typescript
   // BAD
   try {
     await operation();
   } catch (error) {
     console.error('[Service] Failed:', error); // Logged here
     throw error; // Caller will log again
   }
   
   // GOOD - Log OR throw, not both
   try {
     await operation();
   } catch (error) {
     throw new ServiceError('Service', 'Operation failed', error);
   }
   ```

3. **Don't use generic error messages**
   ```typescript
   // BAD
   throw new Error('Error');
   
   // GOOD
   throw new ServiceError(
     'CaseService',
     'Failed to load case data',
     error
   );
   ```

4. **Don't lose error context**
   ```typescript
   // BAD
   try {
     await operation();
   } catch (error) {
     throw new Error('Failed'); // Lost original error
   }
   
   // GOOD
   try {
     await operation();
   } catch (error) {
     throw new ServiceError('Service', 'Failed', error); // Preserved
   }
   ```

---

## Code Review Checklist

When reviewing error handling:

- [ ] Errors are logged with service/component prefix
- [ ] Appropriate log level used (error/warn/info/debug)
- [ ] User-facing errors have friendly messages
- [ ] Context is included in error logs
- [ ] Resources are cleaned up in finally blocks
- [ ] Errors are not silently swallowed
- [ ] Errors are not logged multiple times
- [ ] Error types match the failure scenario
- [ ] Retry logic is used for transient failures
- [ ] Error boundaries handle React errors

---

## Monitoring & Alerting

### Production Error Monitoring
All console.error calls are automatically captured by:
- Sentry (error tracking)
- Datadog (logging & APM)
- CloudWatch (AWS monitoring)

### Critical Errors
These should trigger alerts:
- ServiceError with critical flag
- Unhandled promise rejections
- React error boundary catches
- API failures > 10% error rate

### Error Metrics
Track these KPIs:
- Error rate by service
- Error rate by endpoint
- Mean time to recovery
- Error resolution time

---

## Examples

### Complete Service Example
```typescript
export class DataService extends BaseService<DataConfig> {
  constructor() {
    super('DataService');
  }
  
  async fetchData(id: string): Promise<Data> {
    this.debug('Fetching data:', { id });
    
    try {
      const data = await this.apiClient.get(`/data/${id}`);
      this.info('Data fetched successfully:', { id });
      return data;
    } catch (error) {
      this.error('Failed to fetch data:', { id, error });
      
      throw new ServiceError(
        this.name,
        'Failed to load data. Please try again.',
        error
      );
    }
  }
  
  async saveData(data: Data): Promise<void> {
    this.debug('Saving data:', { id: data.id });
    
    try {
      await this.apiClient.post('/data', data);
      this.info('Data saved successfully:', { id: data.id });
    } catch (error) {
      this.error('Failed to save data:', { id: data.id, error });
      
      throw new ServiceError(
        this.name,
        'Failed to save data. Please check your connection.',
        error
      );
    }
  }
}
```

### Complete Component Example
```typescript
function DataEditor({ id }: Props) {
  const { notify } = useNotification();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  
  const loadData = async () => {
    setLoading(true);
    try {
      const result = await dataService.fetchData(id);
      setData(result);
    } catch (error) {
      notify.error(
        'Failed to load data',
        error instanceof ServiceError 
          ? error.message 
          : 'Unknown error occurred'
      );
      console.error('[DataEditor] Load failed:', { id, error });
    } finally {
      setLoading(false);
    }
  };
  
  const saveData = async () => {
    if (!data) return;
    
    setLoading(true);
    try {
      await dataService.saveData(data);
      notify.success('Data saved successfully');
    } catch (error) {
      notify.error(
        'Failed to save data',
        'Please check your connection and try again'
      );
      console.error('[DataEditor] Save failed:', { id, error });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {/* Component UI */}
    </div>
  );
}
```

---

## References

- [BaseService Implementation](./src/services/core/ServiceLifecycle.ts)
- [Error Types](./src/services/core/errors.ts)
- [Retry Utilities](./src/services/core/factories/Utilities.ts)
- [Notification Service](./src/services/notification/NotificationService.ts)

---

**Last Updated**: 2025-01-XX  
**Phase**: 2 - Standards Documentation  
**Status**: Complete ✅
