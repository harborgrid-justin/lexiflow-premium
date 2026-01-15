# Frontend API Architecture

## Overview

This directory implements the **Enterprise Frontend API Architecture Standard** - a stable, domain-level contract between the UI and application core.

## What is a Frontend API?

```
A FRONTEND API IS:
A STABLE, DOMAIN-LEVEL CONTRACT BETWEEN
THE UI AND THE APPLICATION CORE

IT IS NOT:
✗ a fetch wrapper
✗ a thin backend proxy
✗ a component helper
✗ a hook with side effects
```

## System Position

```
SERVER
│
│  HTTP / RPC / GraphQL
▼
BACKEND API
│
▼
FRONTEND API  ←────────────── OWNERSHIP BOUNDARY
│
├── Validation
├── Normalization
├── Error Semantics
├── Caching Strategy
├── Versioning
│
▼
LOADERS / ACTIONS
│
▼
CONTEXT (DOMAIN STATE)
│
▼
VIEWS
```

## Non-Negotiable Rule

```
UI COMPONENTS NEVER TALK TO THE BACKEND
THEY ONLY TALK TO FRONTEND APIS
```

## Responsibilities

| Responsibility     | Owned by Frontend API |
| ------------------ | --------------------- |
| Transport          | fetch / client        |
| Validation         | schema-based          |
| Error typing       | domain errors         |
| Normalization      | UI-ready shapes       |
| Caching semantics  | explicit              |
| Version adaptation | backend drift         |
| Retry / backoff    | deterministic         |

## Data Flow (Canonical)

```
Route Loader
│
▼
Frontend API Call
│
▼
Normalized Domain Data
│
▼
Context Provider
│
▼
View
```

**NO COMPONENT MAY SKIP THIS PIPELINE**

## Core Concepts

### 1. Result<T> Type

All frontend APIs return `Result<T>` - never throw exceptions:

```typescript
type Result<T> = { ok: true; data: T } | { ok: false; error: DomainError };
```

**Benefits:**

- Explicit error handling required
- Type-safe at compile time
- No try/catch needed
- Forces caller to handle errors

### 2. Domain Errors

```typescript
interface DomainError {
  type: ErrorType;
  message: string;
  recoverable: boolean;
  status?: number;
  details?: Record<string, unknown>;
  fieldErrors?: FieldError[];
  toResponse(): Response;
}
```

**Error Types:**

- `NETWORK` - Connectivity issues
- `SERVER` - 5xx errors
- `AUTH` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION` - Input validation failed
- `BUSINESS_LOGIC` - Domain rule violation
- `RATE_LIMIT` - Too many requests
- `TIMEOUT` - Request timeout
- `CONFLICT` - State conflict
- `UNKNOWN` - Unhandled error

**RULE: Components never switch on HTTP codes**

### 3. Client Layer

Pure HTTP transport with no side effects:

```typescript
const result = await client.get<Report>("/reports/123");
if (!result.ok) {
  return result; // Propagate error
}
return success(normalizeReport(result.data));
```

**Features:**

- Automatic retry with exponential backoff
- Request timeout
- Auth token injection
- Domain error mapping
- No React/UI dependencies

### 4. Validation Layer

Schema-based input validation:

```typescript
const validation = validate(input, {
  title: {
    type: "string",
    required: true,
    min: 1,
    max: 500,
  },
  email: {
    type: "string",
    validator: validators.email,
  },
});

if (!validation.ok) {
  return validation; // Return ValidationError with field details
}
```

### 5. Normalization Layer

Transform backend shapes to UI-ready formats:

```typescript
// Backend shape
const backend = {
  case_number: "2025-CV-123",
  created_at: "2025-01-14T10:00:00Z",
  case_status: "active",
};

// Frontend shape
const frontend = normalizeCase(backend);
// {
//   caseNumber: '2025-CV-123',
//   createdAt: Date,
//   status: 'Active'
// }
```

**Responsibilities:**

- Map snake_case to camelCase
- Coerce types (string dates → Date objects)
- Flatten nested structures
- Add computed fields
- Provide sensible defaults

## File Structure

```
lib/
├── frontend-api/
│   ├── types.ts           # Result<T>, DomainError interfaces
│   ├── errors.ts          # Domain error classes
│   ├── client.ts          # HTTP client (pure transport)
│   ├── schemas.ts         # Validation schemas
│   ├── cases.ts           # Cases domain API
│   ├── governance.ts      # Architecture enforcement
│   └── index.ts           # Barrel exports
│
└── normalization/
    ├── index.ts           # Normalization utilities
    └── case.ts            # Case-specific normalizers
```

## Example Implementation

### 1. Define Frontend API

```typescript
// lib/frontend-api/reports.ts
import { client, type Result, success } from "./index";
import { normalizeReport } from "../normalization/report";

export async function getReport(id: string): Promise<Result<Report>> {
  // Validate input
  if (!id) {
    return failure(new ValidationError("Report ID is required"));
  }

  // Call backend
  const result = await client.get<BackendReport>(`/reports/${id}`);

  if (!result.ok) {
    return result; // Propagate error
  }

  // Normalize and return
  return success(normalizeReport(result.data));
}

export const reportsApi = { getReport };
```

### 2. Consume in Loader

```typescript
// routes/reports/loader.ts
import { reportsApi } from "@/lib/frontend-api/reports";

export async function reportLoader({ params }) {
  const result = await reportsApi.getReport(params.id);

  if (!result.ok) {
    throw result.error.toResponse(); // Convert to HTTP response for error boundary
  }

  return result.data; // Return normalized data
}
```

### 3. Use in Component

```typescript
// components/ReportView.tsx
import { useLoaderData } from 'react-router-dom';

export function ReportView() {
  const report = useLoaderData<Report>(); // Typed, normalized data

  return (
    <div>
      <h1>{report.title}</h1>
      <p>Created: {report.createdAt.toLocaleDateString()}</p>
    </div>
  );
}
```

## Optimistic Updates

Optimism lives **outside** the API:

```typescript
// ❌ WRONG - optimism in API
async function updateCase(id, data) {
  setState(optimistic); // NO!
  return client.patch(`/cases/${id}`, data);
}

// ✅ CORRECT - optimism in action
async function updateAction({ id, data }) {
  // 1. Optimistic update
  setState(optimistic);

  // 2. Call API (pure)
  const result = await casesApi.update(id, data);

  // 3. Confirm or rollback
  if (result.ok) {
    setState(result.data);
  } else {
    setState(rollback);
  }
}
```

## Transitions

Transitions wrap **callers**, not APIs:

```typescript
// ✅ CORRECT
startTransition(() => {
  navigate("/reports"); // Triggers loader
  // └─> reportLoader()
  //     └─> reportsApi.getAll() (pure)
});
```

## Governance Rules

1. ✅ **No UI imports allowed** - No React, components, hooks
2. ✅ **Typed inputs only** - Validate at boundary
3. ✅ **Typed outputs only** - Return Result<T>
4. ✅ **Errors are data** - Not exceptions
5. ✅ **Pure and deterministic** - No side effects
6. ✅ **No optimism** - Handled outside
7. ✅ **No caching logic** - Handled by loaders/context

### ESLint Enforcement

```json
{
  "overrides": [
    {
      "files": ["src/lib/frontend-api/**/*.ts"],
      "rules": {
        "no-restricted-imports": [
          "error",
          {
            "patterns": [
              "react",
              "react-dom",
              "@/components/*",
              "@/contexts/*",
              "@/hooks/*"
            ]
          }
        ]
      }
    }
  ]
}
```

## Review Checklist

Before merging any API code:

- [ ] Does this code bypass the frontend API?
- [ ] Are backend errors mapped to domain errors?
- [ ] Is normalization centralized?
- [ ] Are return types stable (Result<T>)?
- [ ] Is optimism handled outside the API?
- [ ] Is validation at API boundary?
- [ ] No React/UI imports?
- [ ] Function is pure and deterministic?

## Testing

```typescript
import { casesApi } from "@/lib/frontend-api/cases";
import {
  assertReturnsResult,
  validateApiModule,
} from "@/lib/frontend-api/governance";

describe("Cases API", () => {
  it("should be a valid API module", async () => {
    await validateApiModule(casesApi, "casesApi");
  });

  it("should return Result<T>", async () => {
    const result = await casesApi.getAll();
    assertReturnsResult(result);
  });

  it("should handle errors as data", async () => {
    const result = await casesApi.getById("invalid");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.type).toBeDefined();
    }
  });
});
```

## Migration Guide

### From Old Pattern

```typescript
// OLD - Direct fetch in component
function CaseList() {
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetch('/api/cases')
      .then(r => r.json())
      .then(setCases)
      .catch(console.error); // ❌ Error swallowed
  }, []);

  return <div>{cases.map(...)}</div>;
}
```

### To New Pattern

```typescript
// NEW - Loader + Frontend API
// 1. Frontend API
export async function getAll(): Promise<Result<Case[]>> {
  const result = await client.get<BackendCase[]>('/cases');
  if (!result.ok) return result;
  return success(normalizeCases(result.data));
}

// 2. Loader
export async function casesLoader() {
  const result = await casesApi.getAll();
  if (!result.ok) throw result.error.toResponse();
  return result.data;
}

// 3. Component
function CaseList() {
  const cases = useLoaderData<Case[]>();
  return <div>{cases.map(...)}</div>;
}
```

## Benefits

1. **Stability** - Backend changes isolated to normalizers
2. **Type Safety** - Compile-time error detection
3. **Testability** - Pure functions, no mocks needed
4. **Maintainability** - Clear separation of concerns
5. **Error Handling** - Explicit, no silent failures
6. **Performance** - Optimizations in loaders, not APIs
7. **Developer Experience** - Consistent patterns

## Mental Model

```
BACKEND API   = TRANSPORT
FRONTEND API  = DOMAIN FIREWALL
CONTEXT       = STATE
ROUTER        = ORCHESTRATION
VIEW          = PRESENTATION
```

## Failure Modes (Anti-Patterns)

❌ **fetch() in components** - Bypass architecture
❌ **HTTP codes in UI** - Leak transport concerns
❌ **API calls inside context render** - Side effects
❌ **Optimistic logic in API** - State mutation
❌ **Backend response shapes leaking upward** - No normalization

## References

- Architecture spec: `ENTERPRISE_FRONTEND_API_ARCHITECTURE_STANDARD`
- Example implementation: `lib/frontend-api/cases.ts`
- Governance tooling: `lib/frontend-api/governance.ts`
- Test patterns: `lib/frontend-api/__tests__/`
