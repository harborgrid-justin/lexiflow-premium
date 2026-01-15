# Frontend API Migration Guide

This guide shows how to convert existing API services to the enterprise frontend API architecture standard.

## Migration Checklist

For each API module:

- [ ] Move from `src/api/[domain]/` to `src/lib/frontend-api/[domain].ts`
- [ ] Change return types from `Promise<T>` to `Promise<Result<T>>`
- [ ] Replace throws with `failure(error)` returns
- [ ] Add input validation using schemas
- [ ] Add data normalization using normalizers
- [ ] Remove all React/UI imports
- [ ] Remove direct state mutations
- [ ] Add domain error mapping
- [ ] Update loaders to unwrap Result<T>
- [ ] Add tests for governance compliance

## Before & After Examples

### Example 1: Simple GET Request

#### Before (Legacy)

```typescript
// src/api/litigation/cases-api.ts
export class CasesApiService {
  async getById(id: string): Promise<Case> {
    try {
      const response = await apiClient.get(`/cases/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch case");
      }

      return response.data;
    } catch (error) {
      console.error(error);
      throw error; // Re-throw for component to handle
    }
  }
}
```

#### After (Enterprise)

```typescript
// src/lib/frontend-api/cases.ts
import { client, type Result, success, failure, NotFoundError } from "./index";
import { normalizeCase } from "../normalization/case";

export async function getById(id: string): Promise<Result<Case>> {
  // Validate input
  if (!id || typeof id !== "string" || id.trim() === "") {
    return failure(new ValidationError("Valid case ID is required"));
  }

  // Call backend
  const result = await client.get<BackendCase>(`/cases/${id}`);

  if (!result.ok) {
    return result; // Propagate error
  }

  // Check existence
  if (!result.data) {
    return failure(new NotFoundError(`Case ${id} not found`));
  }

  // Normalize and return
  return success(normalizeCase(result.data));
}
```

### Example 2: POST with Validation

#### Before (Legacy)

```typescript
// src/api/litigation/cases-api.ts
export class CasesApiService {
  async create(data: CreateCaseDto): Promise<Case> {
    // Some basic validation
    if (!data.title) {
      throw new Error("Title is required");
    }

    const response = await apiClient.post("/cases", data);

    if (response.status === 400) {
      throw new Error("Validation failed");
    }

    if (!response.ok) {
      throw new Error("Server error");
    }

    return response.data;
  }
}
```

#### After (Enterprise)

```typescript
// src/lib/frontend-api/cases.ts
import { validate, validators } from "./schemas";
import { denormalizeCase } from "../normalization/case";

export async function create(input: CreateCaseInput): Promise<Result<Case>> {
  // Schema-based validation
  const validation = validate(input, {
    title: {
      type: "string",
      required: true,
      min: 1,
      max: 500,
      message: "Case title is required (max 500 characters)",
    },
    clientId: {
      type: "string",
      validator: (v) => !v || validators.uuid(v),
      message: "Invalid client ID format",
    },
    estimatedValue: {
      type: "number",
      min: 0,
      message: "Estimated value must be positive",
    },
  });

  if (!validation.ok) {
    return validation;
  }

  // Denormalize for backend
  const backendPayload = denormalizeCase(input as Partial<Case>);

  // Call backend
  const result = await client.post<BackendCase>("/cases", backendPayload);

  if (!result.ok) {
    return result; // Domain error already mapped
  }

  // Normalize response
  return success(normalizeCase(result.data));
}
```

### Example 3: Loader Integration

#### Before (Legacy)

```typescript
// routes/cases/loader.ts
import { CasesApiService } from "@/api/litigation/cases-api";

const casesApi = new CasesApiService();

export async function caseLoader({ params }) {
  try {
    const caseData = await casesApi.getById(params.id);
    return caseData;
  } catch (error) {
    // What error is this? Network? Validation? 404?
    console.error(error);
    throw new Response("Not Found", { status: 404 });
  }
}
```

#### After (Enterprise)

```typescript
// routes/cases/loader.ts
import { casesApi } from "@/lib/frontend-api/cases";

export async function caseLoader({ params }) {
  const result = await casesApi.getById(params.id);

  // Explicit error handling with type information
  if (!result.ok) {
    // Error already has proper HTTP status and message
    throw result.error.toResponse();
  }

  // Typed, normalized data
  return result.data;
}
```

### Example 4: Action with Optimistic Updates

#### Before (Legacy - Mixed Concerns)

```typescript
// actions/cases.ts
import { CasesApiService } from "@/api/litigation/cases-api";
import { useCasesContext } from "@/contexts/CasesContext";

export async function updateCase(id: string, data: Partial<Case>) {
  const { setState } = useCasesContext(); // ❌ Context in API

  // Optimistic update
  setState((prev) => ({ ...prev, updating: true })); // ❌ State mutation in API

  try {
    const updated = await casesApi.update(id, data);
    setState({ case: updated, updating: false }); // ❌ Side effect in API
    return updated;
  } catch (error) {
    setState((prev) => ({ ...prev, updating: false, error })); // ❌ Side effect in API
    throw error;
  }
}
```

#### After (Enterprise - Separated Concerns)

```typescript
// lib/frontend-api/cases.ts (Pure API)
export async function update(
  id: string,
  input: UpdateCaseInput
): Promise<Result<Case>> {
  // Validate
  if (!id || Object.keys(input).length === 0) {
    return failure(new ValidationError("Invalid update parameters"));
  }

  // Call backend
  const backendPayload = denormalizeCase(input as Partial<Case>);
  const result = await client.patch<BackendCase>(
    `/cases/${id}`,
    backendPayload
  );

  if (!result.ok) {
    return result;
  }

  return success(normalizeCase(result.data));
}

// actions/cases.ts (Orchestration layer)
import { casesApi } from "@/lib/frontend-api/cases";
import { useCasesContext } from "@/contexts/CasesContext";

export async function updateCaseAction(id: string, data: UpdateCaseInput) {
  const { setState } = useCasesContext();

  // 1. Optimistic update
  setState((prev) => ({ ...prev, updating: true }));

  // 2. Call pure API
  const result = await casesApi.update(id, data);

  // 3. Handle result
  if (result.ok) {
    setState({ case: result.data, updating: false });
    return result.data;
  } else {
    setState((prev) => ({ ...prev, updating: false }));
    throw result.error.toResponse();
  }
}
```

## Step-by-Step Migration Process

### Step 1: Create Normalizers

```typescript
// lib/normalization/[domain].ts
import { normalizeDate, normalizeEnum, normalizeId } from "./index";

interface BackendEntity {
  entity_id: string;
  created_at: string;
  entity_status: string;
}

export function normalizeEntity(backend: BackendEntity): FrontendEntity {
  return {
    id: normalizeId(backend.entity_id),
    createdAt: normalizeDate(backend.created_at),
    status: normalizeEnum(backend.entity_status, STATUS_MAP, "Active"),
  };
}

export function denormalizeEntity(
  frontend: Partial<FrontendEntity>
): Partial<BackendEntity> {
  const backend: Partial<BackendEntity> = {};

  if (frontend.id !== undefined) {
    backend.entity_id = frontend.id;
  }

  if (frontend.status !== undefined) {
    const statusEntry = Object.entries(STATUS_MAP).find(
      ([_, v]) => v === frontend.status
    );
    backend.entity_status = statusEntry?.[0] || "active";
  }

  return backend;
}
```

### Step 2: Create Frontend API Module

```typescript
// lib/frontend-api/[domain].ts
import { client, type Result, success, failure } from "./index";
import { validate, validators } from "./schemas";
import { normalizeEntity, denormalizeEntity } from "../normalization/[domain]";

export async function getAll(): Promise<Result<Entity[]>> {
  const result = await client.get<BackendEntity[]>("/entities");

  if (!result.ok) {
    return result;
  }

  return success(result.data.map(normalizeEntity));
}

export async function getById(id: string): Promise<Result<Entity>> {
  if (!id) {
    return failure(new ValidationError("ID is required"));
  }

  const result = await client.get<BackendEntity>(`/entities/${id}`);

  if (!result.ok) {
    return result;
  }

  return success(normalizeEntity(result.data));
}

export async function create(
  input: CreateEntityInput
): Promise<Result<Entity>> {
  const validation = validate(input, ENTITY_SCHEMA);

  if (!validation.ok) {
    return validation;
  }

  const backendPayload = denormalizeEntity(input as Partial<Entity>);
  const result = await client.post<BackendEntity>("/entities", backendPayload);

  if (!result.ok) {
    return result;
  }

  return success(normalizeEntity(result.data));
}

export const entityApi = {
  getAll,
  getById,
  create,
};
```

### Step 3: Update Loaders

```typescript
// routes/entities/loader.ts
import { entityApi } from "@/lib/frontend-api/entity";

export async function entitiesLoader() {
  const result = await entityApi.getAll();

  if (!result.ok) {
    throw result.error.toResponse();
  }

  return result.data;
}

export async function entityLoader({ params }) {
  const result = await entityApi.getById(params.id);

  if (!result.ok) {
    throw result.error.toResponse();
  }

  return result.data;
}
```

### Step 4: Update Actions

```typescript
// routes/entities/action.ts
import { entityApi } from "@/lib/frontend-api/entity";
import { redirect } from "react-router-dom";

export async function createEntityAction({ request }) {
  const formData = await request.formData();
  const input = Object.fromEntries(formData) as CreateEntityInput;

  const result = await entityApi.create(input);

  if (!result.ok) {
    // Return error for form to display
    return { error: result.error };
  }

  return redirect(`/entities/${result.data.id}`);
}
```

### Step 5: Update Components

```typescript
// components/EntityList.tsx
import { useLoaderData, useActionData } from 'react-router-dom';
import type { Entity } from '@/types';
import type { DomainError } from '@/lib/frontend-api';

export function EntityList() {
  // Typed, normalized data from loader
  const entities = useLoaderData<Entity[]>();

  // Typed error from action (if any)
  const actionData = useActionData<{ error?: DomainError }>();

  return (
    <div>
      {actionData?.error && (
        <ErrorAlert error={actionData.error} />
      )}

      {entities.map((entity) => (
        <EntityCard key={entity.id} entity={entity} />
      ))}
    </div>
  );
}
```

## Common Patterns

### Pattern 1: Paginated Lists

```typescript
export async function getAll(
  filters?: EntityFilters
): Promise<Result<PaginatedResult<Entity>>> {
  const params = buildQueryParams(filters);
  const result = await client.get<BackendPaginatedResponse>("/entities", {
    params,
  });

  if (!result.ok) {
    return result;
  }

  return success({
    data: result.data.items.map(normalizeEntity),
    total: result.data.total,
    page: result.data.page,
    pageSize: result.data.pageSize,
    hasMore: result.data.page * result.data.pageSize < result.data.total,
  });
}
```

### Pattern 2: Nested Resources

```typescript
export async function getEntityComments(
  entityId: string,
  options?: { page?: number }
): Promise<Result<Comment[]>> {
  if (!entityId) {
    return failure(new ValidationError("Entity ID is required"));
  }

  const params = options?.page ? { page: options.page } : {};
  const result = await client.get<BackendComment[]>(
    `/entities/${entityId}/comments`,
    { params }
  );

  if (!result.ok) {
    return result;
  }

  return success(result.data.map(normalizeComment));
}
```

### Pattern 3: Batch Operations

```typescript
export async function bulkUpdate(
  updates: Array<{ id: string; data: UpdateEntityInput }>
): Promise<Result<Entity[]>> {
  // Validate all inputs
  for (const update of updates) {
    if (!update.id) {
      return failure(new ValidationError("All items must have valid IDs"));
    }
  }

  // Call backend
  const backendPayload = updates.map((u) => ({
    id: u.id,
    ...denormalizeEntity(u.data as Partial<Entity>),
  }));

  const result = await client.post<BackendEntity[]>(
    "/entities/bulk-update",
    backendPayload
  );

  if (!result.ok) {
    return result;
  }

  return success(result.data.map(normalizeEntity));
}
```

## Testing Migration

### Before

```typescript
// __tests__/cases-api.test.ts
import { CasesApiService } from "@/api/litigation/cases-api";

describe("CasesApiService", () => {
  it("should throw on error", async () => {
    const api = new CasesApiService();
    await expect(api.getById("invalid")).rejects.toThrow();
  });
});
```

### After

```typescript
// lib/frontend-api/__tests__/cases.test.ts
import { casesApi } from "@/lib/frontend-api/cases";
import { assertReturnsResult } from "@/lib/frontend-api/governance";

describe("Cases Frontend API", () => {
  it("should return Result<T>", async () => {
    const result = await casesApi.getAll();
    assertReturnsResult(result);
  });

  it("should handle errors as data", async () => {
    const result = await casesApi.getById("invalid");
    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.type).toBeDefined();
      expect(result.error.message).toBeDefined();
    }
  });

  it("should validate inputs", async () => {
    const result = await casesApi.create({ title: "" });
    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.error.type).toBe("VALIDATION");
    }
  });
});
```

## Gradual Migration Strategy

You can migrate incrementally:

1. **Start with new features** - Use enterprise API for all new code
2. **High-traffic endpoints** - Migrate critical paths first
3. **Domain by domain** - Complete one domain at a time
4. **Parallel run** - Keep legacy APIs until migration complete

During migration, both patterns can coexist:

```typescript
// api/index.ts
export { api as legacyApi } from "./domains/legacy";
export { casesApi } from "@/lib/frontend-api/cases"; // New standard

// routes/cases/loader.ts
import { casesApi } from "@/lib/frontend-api/cases"; // ✅ Use new API
import { legacyApi } from "@/api"; // ✅ Still available
```

## Troubleshooting

### Issue: TypeScript errors with Result<T>

**Solution**: Ensure proper type guards:

```typescript
const result = await casesApi.getById(id);

if (!result.ok) {
  // TypeScript knows result.error exists here
  throw result.error.toResponse();
}

// TypeScript knows result.data exists here
return result.data;
```

### Issue: ESLint complains about imports

**Solution**: Check `.eslintrc.js` configuration and ensure API files are in correct directory.

### Issue: Need to access React context in API

**Solution**: DON'T. APIs are pure. Move context access to action/loader:

```typescript
// ❌ Wrong
export async function update(id, data, context) {
  context.setState(...); // NO!
}

// ✅ Right - in action
export async function updateAction(id, data) {
  const context = useContext(MyContext);
  const result = await api.update(id, data);
  if (result.ok) context.setState(result.data);
}
```

## Summary

The migration improves:

- ✅ **Type safety** - Explicit error handling
- ✅ **Testability** - Pure functions, no mocks
- ✅ **Maintainability** - Clear separation of concerns
- ✅ **Stability** - Backend changes isolated to normalizers
- ✅ **Developer experience** - Consistent patterns

For questions, see `lib/frontend-api/README.md` or governance documentation.
