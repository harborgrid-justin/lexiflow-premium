# Architecture Notes - Next.js Migration Gap Remediation

**Document ID**: ORCH01
**Agent**: typescript-orchestrator
**Created**: 2026-01-08

## Framework Version

- **Next.js**: 16.1.1
- **React**: 19.2.3
- **TypeScript**: 5.x (strict mode)
- **Tailwind CSS**: 4.x

---

## Key Patterns and Conventions

### 1. Next.js 16 Route Parameters (CRITICAL)

In Next.js 16, route parameters are **Promises** that must be awaited.

```typescript
// CORRECT - Next.js 16 pattern
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params; // MUST await params
  // ...
}

// Page components
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  // ...
}
```

### 2. API Route Structure

All API routes follow this pattern:

```typescript
import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, SECURITY_HEADERS } from "@/lib/api-headers";

// Cache policy
export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: { ...CORS_HEADERS, ...SECURITY_HEADERS },
  });
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // 1. Validate auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED', message: 'Authentication required' },
        { status: 401, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
      );
    }

    // 2. Await and validate params
    const { id } = await params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_ID', message: 'Valid ID is required' },
        { status: 400, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
      );
    }

    // 3. Proxy to backend
    const response = await proxyToBackend(request, `/api/resource/${id}`);

    // 4. Add security headers
    const headers = new Headers(response.headers);
    Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
      headers.set(key, value);
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error(`[API] Error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
    );
  }
}
```

### 3. Page Component Structure

```typescript
/**
 * Page Description - Server Component with Data Fetching
 * Dynamic route for specific view
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface Resource {
  id: string;
  title: string;
  // ... other fields
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// SSG Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 600; // Revalidate every 10 minutes

export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const response = await apiFetch<{ id: string | number }[]>(
      API_ENDPOINTS.RESOURCE.LIST + '?limit=100&fields=id'
    );
    return (response || []).map((item) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed:`, error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const resource = (await apiFetch(API_ENDPOINTS.RESOURCE.DETAIL(id))) as Resource;
    return {
      title: `${resource.title} | LexiFlow`,
      description: resource.description || 'Resource details',
    };
  } catch (error) {
    return { title: 'Not Found' };
  }
}

export default async function Page({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let resource: Resource;
  try {
    resource = (await apiFetch(API_ENDPOINTS.RESOURCE.DETAIL(id))) as Resource;
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading...</div>}>
        {/* Content */}
      </Suspense>
    </div>
  );
}
```

### 4. Client Components

```typescript
'use client';

/**
 * Component Description
 * Client Component for interactive functionality
 */

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Props {
  // Props definition
}

export default function ClientComponent({ prop }: Props) {
  const router = useRouter();
  // State and effects

  return (
    // JSX
  );
}
```

### 5. Loading States

```typescript
/**
 * Route Group Loading UI
 * Displays while pages are loading
 */

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      <div className="text-center space-y-6 max-w-md">
        {/* Loading spinner and content */}
      </div>
    </div>
  );
}
```

### 6. Error Boundaries

```typescript
'use client';

/**
 * Route Group Error Boundary
 * Catches errors in route group
 */

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    // Error UI with reset, back, and home buttons
  );
}
```

### 7. Custom Hooks Pattern

```typescript
/**
 * useApiQuery Hook
 * React hook for data fetching with caching
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { queryClient } from '@/services/infrastructure/queryClient';
import type { QueryKey } from '@/services/infrastructure/queryTypes';

export interface UseQueryOptions<TData = unknown> {
  enabled?: boolean;
  staleTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnMount?: boolean;
  retry?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  initialData?: TData;
  select?: (data: TData) => unknown;
}

export interface UseQueryResult<TData = unknown> {
  data: TData | undefined;
  error: Error | null;
  isLoading: boolean;
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
  status: 'idle' | 'loading' | 'success' | 'error';
}

export function useApiQuery<TData = unknown>(
  queryKey: QueryKey,
  queryFn: (signal: AbortSignal) => Promise<TData>,
  options: UseQueryOptions<TData> = {}
): UseQueryResult<TData> {
  // Implementation
}
```

### 8. Provider Pattern

```typescript
/**
 * Provider - Context Provider
 * Provides [feature] context to the application
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

interface ContextType {
  // Context interface
}

const Context = createContext<ContextType | undefined>(undefined);

interface ProviderProps {
  children: React.ReactNode;
}

export function Provider({ children }: ProviderProps) {
  // State and logic

  return (
    <Context.Provider value={/* context value */}>
      {children}
    </Context.Provider>
  );
}

export function useContextHook() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useContextHook must be used within a Provider');
  }
  return context;
}
```

### 9. Type Exports

```typescript
// types/index.ts - Barrel export pattern
// Alphabetically sorted to prevent duplicates

export * from "./analytics";
export * from "./auth";
export * from "./case";
// ... etc

// Avoid re-exporting types that conflict
// Use explicit exports for conflicting names

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 10. Import Path Aliases

Configured in `tsconfig.json`:

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/components/*": ["./src/components/*"],
    "@/lib/*": ["./src/lib/*"],
    "@/hooks/*": ["./src/hooks/*"],
    "@/services/*": ["./src/services/*"],
    "@/types/*": ["./src/types/*"],
    "@/config/*": ["./src/config/*"],
    "@/utils/*": ["./src/utils/*"],
    "@/providers/*": ["./src/providers/*"]
  }
}
```

---

## Type Safety Requirements

### Strict Mode Settings

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noUncheckedIndexedAccess": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true,
  "noImplicitReturns": true,
  "noImplicitThis": true
}
```

### Type Guards

Always use proper type guards and null checks:

```typescript
// Good
if (data && typeof data.id === 'string') {
  return data.id;
}

// Bad
return data.id; // May be undefined
```

---

## Circular Dependency Prevention

### Barrel Export Rules

1. **DO NOT** export from services that depend on `db.ts` or `DataService`
2. **DO NOT** re-export integration handlers or domain services with dependencies
3. Use **explicit exports** for conflicting type names
4. Import directly from specific modules when needed:

```typescript
// CORRECT - Direct import
import { DataService } from '@/services/data/dataService';
import { CryptoService } from '@/services/infrastructure/cryptoService';

// AVOID - Barrel import that may cause circular deps
import { DataService, CryptoService } from '@/services';
```

---

## Security Patterns

### API Route Headers

All API routes must include:

```typescript
import { CORS_HEADERS, SECURITY_HEADERS } from "@/lib/api-headers";

// Apply to all responses
return NextResponse.json(data, {
  status: 200,
  headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
});
```

### Error Responses

Standardized error response format:

```typescript
{
  error: 'Error Type',
  code: 'ERROR_CODE',
  message: 'Human readable message'
}
```

---

## Performance Considerations

1. Use `Suspense` boundaries for async components
2. Implement proper loading states
3. Use `dynamic = 'force-dynamic'` for API routes
4. Set appropriate `revalidate` times for SSG pages
5. Avoid unnecessary re-renders with proper memoization
