# Enterprise Service Layer Standard

## Overview

This document defines the **Enterprise Service Layer Architecture** for LexiFlow Premium. The service layer sits between contexts and frontend APIs, providing domain-specific capabilities and side effects.

---

## What is a Service?

```
A SERVICE IS:
A DOMAIN-LEVEL CAPABILITY MODULE THAT
• OWNS SIDE EFFECTS
• ENCAPSULATES BROWSER APIS
• PROVIDES REUSABLE OPERATIONS
• COORDINATES EXTERNAL DEPENDENCIES

IT IS NOT:
✗ a state container
✗ a context provider
✗ a component helper
✗ a direct HTTP wrapper (that's Frontend API)
✗ a business logic holder (that's in loaders/actions)
```

---

## System Position in Architecture

```
SERVER
│
▼
FRONTEND API        (truth, contracts, validation)
│
▼
LOADERS / ACTIONS   (orchestration, business logic)
│
▼
CONTEXT             (domain state, derivations)
│
├── calls Services  ← SERVICE LAYER (side effects, capabilities)
│
▼
VIEWS / UI          (presentation only)
```

---

## Non-Negotiable Rules

### ✅ SERVICES MAY:

- Call Frontend APIs
- Use browser APIs (localStorage, crypto, etc.)
- Coordinate async operations
- Emit events
- Cache data
- Transform data for specific use cases
- Be called by Contexts
- Be called by Loaders/Actions

### ❌ SERVICES MAY NOT:

- Import or use Contexts
- Import React hooks
- Render JSX
- Navigate routes directly
- Store state (except caching)
- Call other services in circular patterns

---

## Service Types & Responsibilities

### 1. **Domain Services** (`services/domain/`)

**Purpose**: Domain-specific business operations

**Responsibilities**:

- Derive domain logic (e.g., entitlements from user role)
- Coordinate multi-step domain operations
- Fetch/transform domain data
- Manage domain-specific caching

**Examples**:

- `auth.service.ts` - Authentication workflows (login, logout, token management)
- `entitlements.service.ts` - Derives user permissions from org/role
- `feature-flags.service.ts` - Fetches and caches feature flags
- `CaseDomain.ts` - Case management operations
- `BillingDomain/` - Billing operations (invoices, time entries, rates)

**Pattern**:

```typescript
// ================================================================================
// [DOMAIN NAME] SERVICE - DOMAIN SERVICE LAYER
// ================================================================================
//
// POSITION IN ARCHITECTURE:
//   Context (state) → Service (effects) → Frontend API (HTTP)
//
// PURPOSE:
//   - [Specific domain operations]
//   - [Side effects owned]
//   - Never called by views directly (only by Context/Loaders)
//
// ================================================================================

export class DomainService {
  static async operation(): Promise<Result> {
    // Call Frontend API
    // Transform data
    // Return domain-ready result
  }
}
```

---

### 2. **Infrastructure Services** (`services/infrastructure/`)

**Purpose**: Core platform capabilities

**Responsibilities**:

- HTTP client management
- WebSocket connections
- Query caching
- API interceptors
- Blob/file handling
- Token refresh
- Health checks

**Examples**:

- `api-client/` - HTTP client architecture (12 files)
- `queryClient.ts` - React Query-like caching
- `socketService.ts` - WebSocket management
- `cryptoService.ts` - Encryption/decryption
- `blobManager.ts` - File upload/download

**Pattern**: Singleton or factory pattern with lifecycle management

---

### 3. **Feature Services** (`services/features/`)

**Purpose**: Heavy, feature-specific implementations

**Responsibilities**:

- Complex algorithms (legal calculations, AI)
- External SDK wrappers (Gemini, OpenAI)
- Document parsing (XML, PDF)
- Search indexing
- Calendar conflict detection

**Examples**:

- `research/geminiService/` - Google Gemini AI integration
- `documents/xmlDocketParser.ts` - XML parsing
- `legal/deadlineEngine.ts` - Legal deadline calculations
- `analysis/analysisEngine.ts` - Case analysis

**Pattern**: Lazy-loaded, dependency-heavy modules

---

### 4. **Capability Services** (`services/[capability]/`)

**Purpose**: Browser API wrappers

**Responsibilities**:

- Abstract browser APIs
- Provide consistent interfaces
- Handle cross-browser differences
- Manage capability lifecycle

**Examples**:

- `clipboard/ClipboardService.ts` - Clipboard API wrapper
- `notification/NotificationService.ts` - Browser notifications
- `storage/StorageService.ts` - localStorage/sessionStorage
- `session/SessionService.ts` - Session management
- `crypto/CryptoService.ts` - Web Crypto API

**Pattern**: Interface + Browser implementation

```typescript
export interface ClipboardService {
  copy(text: string): Promise<void>;
  paste(): Promise<string>;
}

export class BrowserClipboardService implements ClipboardService {
  async copy(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
  }
}
```

---

## Data Flow Patterns

### Pattern 1: Context → Service → Frontend API

**When**: Context needs domain data

```typescript
// Context
const login = useCallback(async (email: string, password: string) => {
  dispatch({ type: "auth/loginStart" });
  try {
    const user = await AuthService.login(email, password); // ← Service
    dispatch({ type: "auth/loginSuccess", payload: { user } });
  } catch (err) {
    dispatch({ type: "auth/loginFailure", payload: { error: err.message } });
  }
}, []);

// Service
export class AuthService {
  static async login(email: string, password: string): Promise<User> {
    const response = await authApi.auth.login(email, password); // ← Frontend API
    localStorage.setItem("token", response.accessToken);
    setAuthTokens(response.accessToken, response.refreshToken);
    return response.user;
  }
}
```

### Pattern 2: Loader → Frontend API (Direct)

**When**: Loader needs simple data fetch

```typescript
// Loader
export async function caseLoader({ params }: LoaderArgs) {
  const result = await api.cases.getById(params.id); // ← Direct Frontend API
  if (!result.ok) throw new Response(null, { status: 404 });
  return { case: result.data };
}
```

### Pattern 3: Action → Service → Frontend API

**When**: Action needs side effects + orchestration

```typescript
// Action
export async function loginAction({ request }: ActionArgs) {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const user = await AuthService.login(email, password); // ← Service
  return redirect("/dashboard");
}
```

---

## Service Dependency Rules

### ✅ ALLOWED DEPENDENCIES

```
Service → Frontend API       (always ok)
Service → Other Service      (if no circular dep)
Service → Infrastructure     (always ok)
Service → Utilities          (always ok)
Context → Service            (always ok)
Loader → Service             (always ok)
Action → Service             (always ok)
```

### ❌ FORBIDDEN DEPENDENCIES

```
Service → Context            (NEVER)
Service → React Hooks        (NEVER)
Service → Components         (NEVER)
Service → Router             (NEVER - except params passed in)
Frontend API → Service       (NEVER - APIs are lower level)
View → Service              (NEVER - go through Context)
```

---

## Service Initialization Patterns

### Pattern 1: Static Class

```typescript
export class AuthService {
  private static tokenCache: string | null = null;

  static async login(email: string, password: string): Promise<User> {
    // Implementation
  }

  static clearCache(): void {
    this.tokenCache = null;
  }
}
```

### Pattern 2: Singleton Instance

```typescript
class CryptoServiceClass {
  private cache = new Map();

  async encrypt(data: string): Promise<string> {
    // Implementation
  }
}

export const CryptoService = new CryptoServiceClass();
```

### Pattern 3: Factory with Config

```typescript
export function createNotificationService(config: Config) {
  return {
    notify: async (message: string) => {
      // Implementation using config
    },
  };
}
```

---

## Service Registry & Lifecycle

For services that need initialization/cleanup, use the ServiceRegistry pattern:

```typescript
// services/core/ServiceRegistry.ts
export class BaseService implements IService {
  async initialize(): Promise<void> {}
  async shutdown(): Promise<void> {}
  getHealth(): ServiceHealth {}
}

// Usage
export class MyService extends BaseService {
  async initialize() {
    // Setup logic
  }
}

registerService("myService", new MyService());
```

---

## File Naming Conventions

### Domain Services

- **Format**: `[DomainName]Domain.ts` or `[domain].service.ts`
- **Examples**: `CaseDomain.ts`, `auth.service.ts`, `entitlements.service.ts`

### Infrastructure Services

- **Format**: `[capability]Service.ts` (lowercase first letter)
- **Examples**: `apiClient.ts`, `queryClient.ts`, `socketService.ts`

### Feature Services

- **Format**: `[featureName].ts` or `[featureName]Service.ts`
- **Examples**: `geminiService/`, `xmlDocketParser.ts`, `deadlineEngine.ts`

### Capability Services

- **Format**: `[Capability]Service.ts` (PascalCase)
- **Examples**: `ClipboardService.ts`, `CryptoService.ts`, `StorageService.ts`

---

## Service Organization

```
services/
├── domain/              ← Business domain operations
│   ├── auth.service.ts
│   ├── entitlements.service.ts
│   ├── feature-flags.service.ts
│   ├── CaseDomain.ts
│   ├── BillingDomain/
│   └── [35+ domain services]
│
├── infrastructure/      ← Core platform services
│   ├── api-client/
│   ├── queryClient.ts
│   ├── socketService.ts
│   └── [20+ infrastructure services]
│
├── features/           ← Heavy feature implementations
│   ├── research/
│   ├── documents/
│   ├── legal/
│   └── [11 feature categories]
│
├── clipboard/          ← Browser capability
├── crypto/             ← Browser capability
├── notification/       ← Browser capability
├── session/            ← Browser capability
├── storage/            ← Browser capability
├── telemetry/          ← Cross-cutting concern
└── workers/            ← Web worker implementations
```

---

## Testing Services

### Unit Testing Pattern

```typescript
describe("AuthService", () => {
  beforeEach(() => {
    // Clear storage, reset mocks
  });

  it("should store token on login", async () => {
    const user = await AuthService.login("test@example.com", "password");
    expect(localStorage.getItem("token")).toBeDefined();
  });
});
```

### Mock Frontend APIs in Tests

```typescript
vi.mock("@/lib/frontend-api", () => ({
  api: {
    auth: {
      login: vi.fn().mockResolvedValue({
        ok: true,
        data: { accessToken: "token", user: mockUser },
      }),
    },
  },
}));
```

---

## Common Patterns

### Pattern: Service with Retry Logic

```typescript
export class ResilientService {
  static async fetchWithRetry<T>(
    fn: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (retries > 0) {
        await new Promise((r) => setTimeout(r, 1000));
        return this.fetchWithRetry(fn, retries - 1);
      }
      throw err;
    }
  }
}
```

### Pattern: Service with Caching

```typescript
export class CachedService {
  private static cache = new Map<string, { data: any; expires: number }>();

  static async get(key: string): Promise<any> {
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data;
    }

    const data = await api.fetch(key);
    this.cache.set(key, { data, expires: Date.now() + 60000 });
    return data;
  }
}
```

### Pattern: Service with Events

```typescript
export class EventfulService extends EventEmitter {
  async operation() {
    this.emit("operationStart");
    try {
      const result = await api.fetch();
      this.emit("operationSuccess", result);
      return result;
    } catch (err) {
      this.emit("operationError", err);
      throw err;
    }
  }
}
```

---

## Anti-Patterns (DO NOT DO)

### ❌ Service Importing Context

```typescript
// BAD - NEVER DO THIS
import { useAuth } from "@/contexts/auth/AuthContext";

export class BadService {
  doSomething() {
    const { user } = useAuth(); // ❌ Services can't use hooks
  }
}
```

### ❌ Service with React Dependencies

```typescript
// BAD - NEVER DO THIS
import { useState, useEffect } from "react";

export class BadService {
  // ❌ Services are not React components
}
```

### ❌ Direct Backend Calls in Context

```typescript
// BAD - Context calling fetch directly
const fetchData = async () => {
  const response = await fetch("/api/data"); // ❌ Should use Service
};

// GOOD - Context calling Service
const fetchData = async () => {
  const data = await DataService.fetch(); // ✅ Service handles HTTP
};
```

---

## Migration Checklist

When creating a new service or refactoring existing code:

- [ ] Service is in correct directory (`domain/`, `infrastructure/`, `features/`)
- [ ] Service has enterprise header with position in architecture
- [ ] Service does NOT import any contexts
- [ ] Service does NOT import React or hooks
- [ ] Service calls Frontend API (not fetch directly) for HTTP
- [ ] Service has clear purpose statement
- [ ] Service uses static methods or singleton pattern
- [ ] Service is called only by Contexts/Loaders/Actions
- [ ] Service has proper error handling
- [ ] Service has tests (unit tests with mocked APIs)

---

## Related Documentation

- [Frontend API Architecture](../lib/frontend-api/README.md) - Frontend API standard
- [Context Standard](../contexts/README.md) - Context file standard
- [React Router v7 Guide](../routes/README.md) - Loader/action patterns

---

## Mental Model

```
FRONTEND API = TRUTH (contracts, validation)
SERVICE      = EFFECT (side effects, capabilities)
CONTEXT      = STATE  (derivations, optimistic updates)
LOADER       = ORCHESTRATION (business logic, coordination)
VIEW         = FUNCTION (pure presentation)
UI           = DISPLAY (primitives)
```

---

## Examples in Codebase

### ✅ GOOD Examples

1. **`auth.service.ts`** - Domain service with token management
2. **`entitlements.service.ts`** - Derives permissions from user/org
3. **`feature-flags.service.ts`** - Fetches and caches flags
4. **`ClipboardService.ts`** - Browser capability wrapper
5. **`api-client/`** - Infrastructure service with interceptors

### ❌ AVOID These Patterns

1. Services that import contexts
2. Services that use React hooks
3. Services that duplicate Frontend API responsibilities
4. Services with circular dependencies
5. Services called directly from views (bypass context)

---

## Key Takeaways

1. **Services = Side Effects** - If it touches browser APIs, external services, or async operations, it's a service
2. **Contexts Use Services** - Never the other way around
3. **Services Call Frontend APIs** - Not fetch directly
4. **No React in Services** - Services are framework-agnostic
5. **Clear Boundaries** - Domain vs Infrastructure vs Features vs Capabilities
