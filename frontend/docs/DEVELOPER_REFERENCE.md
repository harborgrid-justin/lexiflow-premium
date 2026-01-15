# Enterprise Frontend API - Developer Quick Reference

## 🚀 Quick Start

### Pattern: CRUD Operation

```typescript
// 1. Define input/output types
export interface CreateItemInput {
  name: string;
  description?: string;
  caseId: string;
}

// 2. Implement with Result<T> return
export async function createItem(
  input: CreateItemInput
): Promise<Result<Item>> {
  // Validate input
  if (!input.caseId) return failure(new ValidationError("..."));

  // Call backend
  const result = await client.post<unknown>("/items", input);
  if (!result.ok) return result;

  // Normalize response
  return success(normalizeItem(result.data));
}

// 3. Export as module
export const itemApi = { createItem /* ... */ } as const;
```

## ✅ Rules (Non-Negotiable)

```typescript
// ❌ FORBIDDEN
import React from "react"; // NO React
import { useState } from "react"; // NO hooks
import { Button } from "@/components"; // NO components
import { useContext } from "react"; // NO context
throw new Error("message"); // NO exceptions

// ✅ REQUIRED
export async function method(input: TypedInput): Promise<Result<TypedOutput>>;
return failure(new ValidationError("...")); // Errors as data
return success(data); // Always wrapped
```

## 🎯 API Function Template

````typescript
/**
 * Purpose: [What this does]
 *
 * @param {InputType} input - [Input description]
 * @returns {Promise<Result<OutputType>>} Success with data or failure with error
 *
 * @example
 * ```typescript
 * const result = await domainApi.method(input);
 * if (!result.ok) {
 *   console.error(result.error.message);
 *   return;
 * }
 * // Use result.data safely
 * ```
 */
export async function method(input: InputType): Promise<Result<OutputType>> {
  // 1. VALIDATE INPUT
  if (!input) return failure(new ValidationError("Input required"));

  // 2. CALL CLIENT
  const result = await client.post<unknown>("/endpoint", input);
  if (!result.ok) return result;

  // 3. NORMALIZE
  return success(normalizeOutput(result.data));
}
````

## 📋 Validation Pattern

```typescript
// Simple validation
if (!id || typeof id !== "string" || id.trim() === "") {
  return failure(new ValidationError("Valid ID is required"));
}

// Complex validation
if (!input || typeof input !== "object" || Object.keys(input).length === 0) {
  return failure(new ValidationError("At least one field must be updated"));
}

// Type-specific validation
if (typeof hours !== "number" || hours <= 0) {
  return failure(new ValidationError("Hours must be a positive number"));
}
```

## 🔄 Filter Pattern (Common)

```typescript
export interface ItemFilters {
  caseId?: string;
  status?: "active" | "inactive";
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "title";
  sortOrder?: "asc" | "desc";
}

export async function getAll(
  filters?: ItemFilters
): Promise<Result<PaginatedResult<Item>>> {
  const params: Record<string, string | number> = {};

  if (filters?.caseId) params.caseId = filters.caseId;
  if (filters?.status) params.status = filters.status;
  // ... build params

  const result = await client.get<unknown>("/items", { params });
  if (!result.ok) return result;

  const response = result.data as Record<string, unknown>;
  return success({
    data: normalizeItems(response.data),
    total: response.total || 0,
    page: response.page || 1,
    pageSize: response.pageSize || 10,
    hasMore:
      (response.page || 1) * (response.pageSize || 10) < (response.total || 0),
  });
}
```

## 🔐 Error Handling Pattern

```typescript
// Always return Result<T>
export async function getById(id: string): Promise<Result<Item>> {
  if (!id) return failure(new ValidationError("ID required"));

  const result = await client.get<unknown>(`/items/${id}`);
  if (!result.ok) return result; // Propagate error

  if (!result.data) return failure(new NotFoundError(`Item ${id} not found`));

  return success(normalizeItem(result.data));
}
```

## 📝 Normalization Pattern

```typescript
// Import normalizer
import { normalizeItem, normalizeItems } from "../normalization/domain";

// Use before returning
export async function getAll(): Promise<Result<Item[]>> {
  const result = await client.get<unknown>("/items");
  if (!result.ok) return result;

  const items = Array.isArray(result.data) ? result.data : [];
  return success(normalizeItems(items)); // ← Normalize here
}
```

## 🧪 Testing Pattern

```typescript
// ✅ Valid test
test("should return Result with data on success", async () => {
  const result = await itemApi.getById("123");
  expect(result.ok).toBe(true);
  expect(result.data.id).toBe("123");
});

// ✅ Valid test
test("should return Result with error on validation failure", async () => {
  const result = await itemApi.getById("");
  expect(result.ok).toBe(false);
  expect(result.error.type).toBe("Validation");
});
```

## 🏗️ Module Organization

```
frontend/src/lib/frontend-api/
├── cases.ts              ← Case management
├── discovery.ts          ← Evidence & discovery
├── documents.ts          ← Document operations
├── workflow.ts           ← Task management
├── billing.ts            ← Time entries + invoices
├── compliance.ts         ← Conflict checking
├── hr.ts                 ← Employee management
├── communications.ts     ← Clients + messages
├── client.ts             ← HTTP transport
├── errors.ts             ← Error classes
├── types.ts              ← Result<T> type
├── schemas.ts            ← Validation
└── index.ts              ← Exports

frontend/src/lib/normalization/
├── case.ts
├── discovery.ts
├── documents.ts
├── workflow.ts
├── billing.ts
├── hr.ts
├── communications.ts
└── index.ts
```

## 💡 Common Operations

### List with Filtering

```typescript
const result = await casesApi.getAll({
  status: "Active",
  page: 1,
  limit: 20,
  sortBy: "createdAt",
  sortOrder: "desc",
});

if (result.ok) {
  const { data, total, page, hasMore } = result.data;
  console.log(`Showing ${data.length} of ${total} items`);
}
```

### Search

```typescript
const result = await casesApi.search("contract dispute", { limit: 10 });
if (result.ok) {
  const matches = result.data; // Case[]
}
```

### Create with Validation

```typescript
const result = await casesApi.create({
  title: "Smith vs. Corp",
  caseNumber: "2026-001",
  matterType: "Civil Litigation",
});

if (!result.ok) {
  console.error(`Error: ${result.error.message}`);
  return;
}

const newCase = result.data; // Typed!
```

### Update with Partial Input

```typescript
const result = await casesApi.update("case-123", {
  status: "Settled",
  closeDate: new Date(),
});

if (result.ok) {
  console.log("Case updated:", result.data);
}
```

### Delete

```typescript
const result = await casesApi.remove("case-123");
if (!result.ok) {
  console.error("Delete failed:", result.error.message);
}
```

## 🔍 Error Types

```typescript
// ValidationError - Input validation failed
return failure(new ValidationError("Title is required"));

// NotFoundError - Resource not found
return failure(new NotFoundError("Case 123 not found"));

// ConflictError - Conflict/duplicate
return failure(new ConflictError("Case number already exists"));

// ServerError - Backend error
return failure(new ServerError("Failed to process"));
```

## 📦 Using in Components

```typescript
// ❌ NO - Direct API calls from components
const result = await casesApi.getAll();

// ✅ YES - Via loaders
export async function casesLoader() {
  const result = await casesApi.getAll();
  if (!result.ok) throw result.error.toResponse();
  return result.data;
}

// ✅ YES - Via actions
export async function createCaseAction(data) {
  const result = await casesApi.create(data);
  if (!result.ok) return { error: result.error };
  return { data: result.data };
}

// ✅ YES - Component receives typed data
export function CaseList() {
  const cases = useLoaderData<Case[]>();
  return <div>{/* Render cases */}</div>;
}
```

## 📚 Reference

| Component     | Purpose                                    | Location         |
| ------------- | ------------------------------------------ | ---------------- |
| `Result<T>`   | Discriminated union for success/failure    | `types.ts`       |
| `DomainError` | Error with type, message, recoverable flag | `errors.ts`      |
| `client`      | HTTP transport layer                       | `client.ts`      |
| `normalizers` | Backend → Frontend data transformation     | `normalization/` |
| `schemas`     | Input validation helpers                   | `schemas.ts`     |

---

**Last Updated**: 2026-01-14
**Version**: 1.0
**Standard**: Enterprise Frontend API v2025-Q1
