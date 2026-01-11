# Architecture Notes - Discovery Repository Refactoring

## High-Level Design Decisions

### Pattern Selection: Facade + Service Layer
**Decision**: Use Facade pattern for main repository with delegated service layer

**Rationale**:
- Maintains backward compatibility (critical requirement)
- Enables focused, single-responsibility services
- Improves testability and maintainability
- Allows for incremental refactoring
- Clear separation of concerns

**Trade-offs**:
- Slightly more files (17 services vs 1 monolith)
- Additional indirection layer (minimal performance impact)
- ✅ Better: Code organization, testability, maintainability

### Service Granularity
**Decision**: Create 17 domain-specific services averaging 90 LOC each

**Rationale**:
- Each service represents a distinct discovery domain (custodians, depositions, etc.)
- 90 LOC is readable in single screen/context
- Natural boundaries align with API endpoints
- Easy to locate and modify specific functionality

**Alternatives Considered**:
1. Fewer, larger services (150-200 LOC) - Rejected: Still too large
2. More, smaller services (50-60 LOC) - Rejected: Too granular, overhead
3. ✅ Selected: 17 services @ ~90 LOC - Optimal balance

### Type Safety Strategy
**Decision**: Maintain strict type safety with proper generic constraints

**Approach**:
- All service methods have explicit return types
- Input parameters use discriminated unions where applicable
- Avoid `any` and `unknown` without proper type guards
- Leverage TypeScript's type inference for API responses
- Use type assertions only when necessary with clear documentation

**Example**:
```typescript
async getCustodians(caseId?: string): Promise<Custodian[]> {
  // Explicit return type, optional parameter with proper type
}
```

### Error Handling Architecture
**Decision**: Centralized error handling with custom error classes

**Approach**:
- Use existing `OperationError`, `ValidationError`, `EntityNotFoundError`
- Consistent error logging pattern across all services
- Try-catch at service boundaries
- Meaningful error messages with context

**Pattern**:
```typescript
try {
  return await discoveryApi.method();
} catch (error) {
  console.error('[ServiceName.method] Error:', error);
  throw new OperationError('method', 'Failed to...');
}
```

### Validation Strategy
**Decision**: Shared validation utilities in `discovery/shared/validation.ts`

**Approach**:
- Extract validation from main repository
- Reusable validators: `validateId`, `validateCaseId`
- Input sanitization at service entry points
- Fail-fast validation before API calls

## Integration Patterns

### API Client Integration
**Pattern**: Backend-first with discoveryApi

**Current Implementation**:
- Primary: Backend API via `discoveryApi`
- No IndexedDB fallback (removed from original)
- Direct API client usage for some endpoints

**Service Integration**:
```typescript
import { discoveryApi } from "@/api/domains/discovery.api";
import { apiClient } from "@/services/infrastructure/apiClient";

// Prefer discoveryApi when available
await discoveryApi.custodians.getAll();

// Use apiClient for endpoints not yet in discoveryApi
await apiClient.get<Type>('/discovery/endpoint');
```

### Dependency Injection
**Pattern**: Singleton services with functional exports

**Approach**:
```typescript
export class ServiceName {
  async method(): Promise<Type> { ... }
}

export const serviceName = new ServiceName();
```

**Rationale**:
- Simple, lightweight
- Easy to mock in tests
- No complex DI framework needed
- Matches existing repository patterns

### Component Interaction
**Pattern**: Main repository delegates to services

**Flow**:
```
Component → DiscoveryRepository (Facade)
              ↓
              Service Layer (Domain-specific)
              ↓
              API Client / Backend
```

**Benefits**:
- Components unchanged (backward compatible)
- Internal refactoring isolated
- Service layer independently testable

## Type System Strategies

### Generic Constraints
**Strategy**: Use proper generic bounds for type safety

**Examples**:
```typescript
// API responses with unknown structure
const result = await discoveryApi.method<T>();
return result as T; // Type assertion with clear documentation

// Filters with flexible structure
async method(filters?: Record<string, unknown>): Promise<T[]>
```

### Type Guards
**Strategy**: Implement type guards for runtime validation

**Pattern**:
```typescript
function isCustodian(obj: unknown): obj is Custodian {
  return (obj as Custodian).id !== undefined;
}
```

### Discriminated Unions
**Strategy**: Use for status fields and enum-like values

**Example**:
```typescript
type ESIStatus = 'identified' | 'reviewed' | 'preserved' | 'collected' | 'processed';

async updateStatus(id: string, status: ESIStatus): Promise<ESISource> {
  // Type-safe status parameter
}
```

## Performance Considerations

### Algorithmic Complexity
**Analysis**:
- All service methods: O(1) complexity (direct API calls)
- No in-memory filtering or sorting (delegated to backend)
- Linear complexity for array operations (minimal, backend-side)

### Memory Management
**Strategy**:
- No caching in services (handled by React Query at component level)
- Immediate garbage collection of API responses
- No long-lived references

**Optimization Opportunities**:
- Future: Implement service-level caching if needed
- Future: Batch operations for bulk updates
- Current: Keep services stateless and lightweight

### Network Optimization
**Current**:
- Direct API calls (no batching)
- Rely on HTTP/2 multiplexing
- React Query handles caching/deduplication

**Future Enhancements**:
- Implement GraphQL for complex queries
- Add optimistic updates in services
- Batch mutations where applicable

## Security Requirements

### Input Validation
**Requirements**:
- Validate all parameters at service entry points
- Sanitize string inputs (trim, type check)
- Reject malformed IDs before API calls

**Implementation**:
```typescript
validateId(id, 'methodName'); // Throws on invalid input
```

### XSS Prevention
**Strategy**:
- Type enforcement prevents code injection
- No direct DOM manipulation in services
- Backend API handles sanitization
- Services only pass typed data structures

### Error Information Disclosure
**Strategy**:
- Generic error messages to clients
- Detailed logging server-side only
- No sensitive data in error messages

**Pattern**:
```typescript
catch (error) {
  console.error('[Service.method] Error:', error); // Detailed
  throw new OperationError('method', 'Failed to...'); // Generic
}
```

## SOLID Principles Application

### Single Responsibility Principle (SRP)
**Applied**: Each service handles one discovery domain
- CustodianService: Only custodian operations
- DepositionService: Only deposition operations
- No cross-domain logic mixing

### Open/Closed Principle (OCP)
**Applied**: Services open for extension, closed for modification
- New methods can be added to services
- Existing methods maintain contracts
- Facade pattern enables service replacement

### Liskov Substitution Principle (LSP)
**Applied**: Service interfaces are substitutable
- All services follow same error handling pattern
- Consistent method signatures
- Predictable behavior across services

### Interface Segregation Principle (ISP)
**Applied**: Clients depend only on methods they use
- Services expose focused APIs
- No "god service" with everything
- Component imports only needed services (future optimization)

### Dependency Inversion Principle (DIP)
**Applied**: Depend on abstractions (API client), not concretions
- Services depend on API client interface
- Not coupled to specific backend implementation
- Mockable dependencies for testing

## Module Boundaries

### Service Module Structure
```typescript
/**
 * Module-level documentation
 */

// Imports (external dependencies first)
import { discoveryApi } from "@/api/domains/discovery.api";
import type { Types } from "@/types";

// Service class
export class ServiceName {
  async method(): Promise<Type> { }
}

// Singleton export
export const serviceName = new ServiceName();
```

### Shared Module Structure
```typescript
/**
 * Validation utilities
 */

export const validateId = (id: string, methodName: string): void => {
  // Implementation
};
```

### Facade Module Structure
```typescript
/**
 * Main repository - delegates to services
 */

import { custodianService } from './discovery/services/CustodianService';
// ... other imports

export class DiscoveryRepository {
  getCustodians = custodianService.getCustodians;
  // ... other delegations
}
```

## Migration Strategy

### Backward Compatibility
**Guarantee**: 100% API compatibility

**Verification**:
- All public methods preserved
- Same method signatures
- Same return types
- Same error patterns

### Incremental Rollout
**Approach**:
1. Create all services
2. Update facade
3. Test thoroughly
4. Replace original file

**Rollback Plan**:
- Keep original file backed up
- Git history preserves all versions
- Can revert commit if issues found

## Testing Strategy

### Unit Testing Services
**Approach**:
- Mock API client
- Test each service method independently
- Verify error handling
- Test validation logic

### Integration Testing Facade
**Approach**:
- Verify method delegation works
- Test end-to-end flow
- Confirm no breaking changes

### Type Testing
**Approach**:
- TypeScript compilation as test
- Verify no type errors
- Check strict mode compliance

## Documentation Standards

### JSDoc Requirements
All service methods must include:
```typescript
/**
 * Brief description
 *
 * @param paramName - Parameter description
 * @returns Promise with result description
 * @throws Error conditions and when they occur
 *
 * @example
 * const result = await service.method(param);
 */
```

### Module Documentation
All service modules must include:
```typescript
/**
 * [Service Name] Service
 * Handles [domain] operations for discovery management
 *
 * @module [ServiceName]Service
 * @description Detailed description of responsibilities
 */
```

## Deployment Considerations

### Build Impact
- Expected: No build size increase
- Services tree-shaken if not used
- Facade pattern minimal overhead

### Runtime Impact
- Negligible performance impact
- Method delegation is O(1)
- No additional async overhead

### Developer Experience
- Improved code navigation
- Easier to locate specific functionality
- Better IDE autocomplete
- Clearer separation of concerns
