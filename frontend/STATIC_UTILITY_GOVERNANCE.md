# Static Utility Services - Governance Exception

## Overview
This document explains why certain services use static methods instead of following the standard ServiceRegistry pattern, and defines criteria for when static utilities are appropriate.

---

## Current Static Services

### 1. AuditService
**Location**: `src/services/core/AuditService.ts`

**Pattern**: Static class with static methods
```typescript
export class AuditService {
  static async log(entry: AuditEntry): Promise<void> { ... }
  static async logOperation(...): Promise<void> { ... }
  static async logFailure(...): Promise<void> { ... }
}
```

**Rationale**:
- ✅ **Pure utility** - No instance state required
- ✅ **Fail-safe design** - Must work even if ServiceRegistry fails
- ✅ **Universal access** - Called from services, components, middleware, error handlers
- ✅ **Lightweight** - No lifecycle overhead
- ✅ **Similar to console.log** - Should always be available
- ✅ **Compliance requirement** - Audit logging cannot fail due to service lifecycle

**Usage Pattern**:
```typescript
// Called from anywhere
await AuditService.log({
  userId: user.id,
  action: 'DELETE',
  resource: 'case',
  resourceId: caseId,
  success: true
});
```

### 2. ValidationService
**Location**: `src/services/core/ValidationService.ts`

**Pattern**: Static class with static methods
```typescript
export class ValidationService {
  static validateEmail(email: string): boolean { ... }
  static validatePhoneNumber(phone: string): boolean { ... }
  static sanitizeString(input: string): string { ... }
}
```

**Rationale**:
- ✅ **Pure functions** - No side effects or state
- ✅ **Simple validators** - Email, phone, currency validation
- ✅ **Used everywhere** - Forms, API layer, data layer
- ✅ **No dependencies** - Self-contained logic
- ✅ **Similar to Math.* / Date.*** - Pure computation utilities

**Usage Pattern**:
```typescript
// Simple validation checks
if (!ValidationService.validateEmail(email)) {
  throw new ValidationError('Invalid email format');
}

const safe = ValidationService.sanitizeString(userInput);
```

---

## Exception Criteria

### When Static Utilities Are Appropriate

A service MAY use static methods if it meets ALL of the following criteria:

#### 1. No Instance State
```typescript
// ✅ GOOD - No state
export class MathUtils {
  static add(a: number, b: number): number {
    return a + b;
  }
}

// ❌ BAD - Has state
export class CounterService {
  private static count = 0; // ← State!
  static increment() {
    return ++CounterService.count;
  }
}
```

#### 2. No Lifecycle Requirements
```typescript
// ✅ GOOD - No initialization needed
export class DateUtils {
  static format(date: Date): string {
    return date.toISOString();
  }
}

// ❌ BAD - Requires initialization
export class CacheService {
  private static cache: Map<string, any>;
  
  static init() { // ← Lifecycle!
    CacheService.cache = new Map();
  }
}
```

#### 3. No Dependencies on Other Services
```typescript
// ✅ GOOD - Self-contained
export class StringUtils {
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// ❌ BAD - Depends on other services
export class NotificationHelper {
  static show(message: string) {
    ServiceRegistry.get('NotificationService').show(message); // ← Dependency!
  }
}
```

#### 4. Pure Functions or Fail-Safe Operations
```typescript
// ✅ GOOD - Pure function
export class ValidationUtils {
  static isEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// ✅ GOOD - Fail-safe (audit logging)
export class AuditService {
  static async log(entry: AuditEntry): Promise<void> {
    try {
      await api.post('/audit', entry);
    } catch (error) {
      // Fail-safe: must not throw
      console.error('[AUDIT_FAILURE]', error, entry);
    }
  }
}
```

#### 5. Universal Access Pattern
```typescript
// ✅ GOOD - Called from anywhere
export class FormatUtils {
  static currency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
```

---

## When to Use ServiceRegistry Instead

A service MUST use ServiceRegistry if it has ANY of:

### 1. Instance State
```typescript
// Must use ServiceRegistry
export class NotificationService extends BaseService {
  private notifications: Notification[] = []; // State!
}
```

### 2. Lifecycle Management
```typescript
// Must use ServiceRegistry
export class WebSocketService extends BaseService {
  protected override onStart() { /* Connect */ }
  protected override onStop() { /* Disconnect */ }
}
```

### 3. Dependencies
```typescript
// Must use ServiceRegistry
export class CaseService extends BaseService {
  constructor(
    private apiClient: ApiClient,      // Dependency
    private validation: ValidationService // Dependency
  ) {}
}
```

### 4. Configuration
```typescript
// Must use ServiceRegistry
export class StorageService extends BaseService<StorageConfig> {
  private maxSize: number;
  
  protected override onConfigure(config: StorageConfig) {
    this.maxSize = config.maxSize ?? 1000;
  }
}
```

### 5. Testing Requirements
```typescript
// Must use ServiceRegistry (for mocking)
export class ApiClient extends BaseService {
  async get(url: string) { /* ... */ }
}

// In tests:
ServiceRegistry.register({
  service: new MockApiClient(), // Easy to mock
  lifecycle: 'singleton'
});
```

---

## Decision Tree

```
Is it a utility service?
├─ NO → Use ServiceRegistry
└─ YES → Does it have state?
    ├─ YES → Use ServiceRegistry
    └─ NO → Does it have lifecycle?
        ├─ YES → Use ServiceRegistry
        └─ NO → Does it have dependencies?
            ├─ YES → Use ServiceRegistry
            └─ NO → Can it fail?
                ├─ YES (and critical) → Static OK
                └─ NO (pure function) → Static OK
```

---

## Examples

### ✅ Appropriate Static Services

```typescript
// Math utilities
export class MathUtils {
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

// String utilities
export class StringUtils {
  static truncate(str: string, length: number): string {
    return str.length > length ? str.slice(0, length) + '...' : str;
  }
}

// Date utilities
export class DateUtils {
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

// Validation utilities (pure checks)
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Fail-safe audit logging
export class AuditService {
  static async log(entry: AuditEntry): Promise<void> {
    try {
      await api.post('/audit', entry);
    } catch (error) {
      console.error('[AUDIT]', error);
    }
  }
}
```

### ❌ Inappropriate Static Services

```typescript
// BAD - Has state
export class CacheService {
  private static cache = new Map(); // State!
  
  static set(key: string, value: any) {
    CacheService.cache.set(key, value);
  }
}
// → Should use ServiceRegistry

// BAD - Has lifecycle
export class WebSocketService {
  private static ws: WebSocket;
  
  static connect() { /* ... */ } // Lifecycle!
  static disconnect() { /* ... */ }
}
// → Should use ServiceRegistry

// BAD - Has dependencies
export class NotificationHelper {
  static show(message: string) {
    // Depends on ServiceRegistry!
    ServiceRegistry.get('NotificationService').show(message);
  }
}
// → Should be a hook or use ServiceRegistry

// BAD - Needs configuration
export class ConfigService {
  private static apiUrl: string;
  
  static init(config: Config) { // Requires config!
    ConfigService.apiUrl = config.apiUrl;
  }
}
// → Should use ServiceRegistry
```

---

## Governance Rules

### Rule 1: Default to ServiceRegistry
Unless a service meets ALL exception criteria, it MUST use ServiceRegistry.

### Rule 2: Document Static Services
All static services MUST document why they don't use ServiceRegistry.

### Rule 3: Prefer Pure Functions
Static services SHOULD be pure functions when possible.

### Rule 4: Fail-Safe Pattern
Static services that CAN'T be pure (like AuditService) MUST use fail-safe patterns.

### Rule 5: No Static State
Static services MUST NOT maintain static state (except constants).

---

## Code Review Checklist

When reviewing static services:

- [ ] Does it meet ALL exception criteria?
- [ ] Is it documented why it's static?
- [ ] Does it have no instance state?
- [ ] Does it have no lifecycle requirements?
- [ ] Does it have no dependencies on other services?
- [ ] Is it a pure function OR fail-safe operation?
- [ ] Is it called from multiple contexts?
- [ ] Would ServiceRegistry add unnecessary complexity?

If any answer is "NO", the service should use ServiceRegistry.

---

## Migration Path

If a static service needs to become a regular service:

### Before (Static)
```typescript
export class MyService {
  static doSomething() { /* ... */ }
}

// Usage
MyService.doSomething();
```

### After (ServiceRegistry)
```typescript
export class MyService extends BaseService {
  doSomething() { /* ... */ }
}

// Register
ServiceRegistry.register({
  service: new MyService(),
  lifecycle: 'singleton'
});

// Usage
const service = ServiceRegistry.get<MyService>('MyService');
service.doSomething();
```

---

## References

- [ServiceRegistry](./src/services/core/ServiceRegistry.ts)
- [BaseService](./src/services/core/ServiceLifecycle.ts)
- [AuditService](./src/services/core/AuditService.ts)
- [ValidationService](./src/services/core/ValidationService.ts)

---

**Last Updated**: 2025-01-XX  
**Phase**: 2 - Governance Documentation  
**Status**: Complete ✅
