# Implementation Templates - Gap Remediation

**Template ID**: ORCH01
**Agent**: typescript-orchestrator
**Created**: 2026-01-08

These templates ensure consistent implementation across all gap remediation work.

---

## Template 1: API Route with Dynamic Params (Next.js 16)

**Use for**: Any API route with `[id]`, `[slug]`, or other dynamic segments

```typescript
import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, SECURITY_HEADERS } from "@/lib/api-headers";

// Cache policy: API routes are dynamic
export const dynamic = 'force-dynamic';

/**
 * API Route Handler for /api/{resource}/[id]
 *
 * GET - Get specific resource
 * PUT - Update specific resource
 * DELETE - Delete specific resource
 *
 * @security Requires authentication
 */
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

    // 2. Await and validate params (Next.js 16 requirement)
    const { id } = await params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_ID', message: 'Valid ID is required' },
        { status: 400, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
      );
    }

    // 3. Log request
    console.log(`[API] GET /api/{resource}/${id}`);

    // 4. Proxy to backend
    const response = await proxyToBackend(request, `/api/{resource}/${id}`);

    // 5. Add security headers
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
    console.error(`[API] GET /api/{resource}/[id] error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED', message: 'Authentication required' },
        { status: 401, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_ID', message: 'Valid ID is required' },
        { status: 400, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
      );
    }

    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_CONTENT_TYPE', message: 'Content-Type must be application/json' },
        { status: 400, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
      );
    }

    // Parse body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_JSON', message: 'Invalid JSON in request body' },
        { status: 400, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
      );
    }

    console.log(`[API] PUT /api/{resource}/${id}`);

    const response = await proxyToBackend(request, `/api/{resource}/${id}`);

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
    console.error(`[API] PUT /api/{resource}/[id] error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED', message: 'Authentication required' },
        { status: 401, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
      );
    }

    const { id } = await params;
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_ID', message: 'Valid ID is required' },
        { status: 400, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
      );
    }

    console.log(`[API] DELETE /api/{resource}/${id}`);

    const response = await proxyToBackend(request, `/api/{resource}/${id}`);

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
    console.error(`[API] DELETE /api/{resource}/[id] error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
    );
  }
}

// Method not allowed handlers
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'POST not supported' },
    { status: 405, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS, 'Allow': 'GET, PUT, DELETE, OPTIONS' } }
  );
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'PATCH not supported' },
    { status: 405, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS, 'Allow': 'GET, PUT, DELETE, OPTIONS' } }
  );
}
```

---

## Template 2: Dynamic Page Component

**Use for**: Pages with dynamic routes like `/[id]/page.tsx`

```typescript
/**
 * Resource Detail Page - Server Component
 * Dynamic route for individual resource view
 */
import React from 'react';
import { API_ENDPOINTS, apiFetch } from '@/lib/api-config';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

// Type definition for the resource
interface Resource {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

// SSG Configuration
export const dynamic = 'force-dynamic';
export const revalidate = 600; // Revalidate every 10 minutes

/**
 * Generate static params for pre-rendering
 */
export async function generateStaticParams(): Promise<{ id: string }[]> {
  try {
    const response = await apiFetch<{ id: string | number }[]>(
      API_ENDPOINTS.RESOURCE.LIST + '?limit=100&fields=id'
    );
    return (response || []).map((item) => ({
      id: String(item.id),
    }));
  } catch (error) {
    console.warn(`[generateStaticParams] Failed to fetch list:`, error);
    return [];
  }
}

/**
 * Generate dynamic metadata
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const resource = (await apiFetch(API_ENDPOINTS.RESOURCE.DETAIL(id))) as Resource;
    return {
      title: `${resource.title} | LexiFlow`,
      description: resource.description || 'Resource details',
    };
  } catch (error) {
    return { title: 'Resource Not Found' };
  }
}

/**
 * Page Component
 */
export default async function ResourceDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  let resource: Resource;
  try {
    resource = (await apiFetch(API_ENDPOINTS.RESOURCE.DETAIL(id))) as Resource;
  } catch {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<ResourceDetailSkeleton />}>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">{resource.title}</h1>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div>
                <span className="text-sm text-slate-600 dark:text-slate-400">Status:</span>
                <span className="ml-2 font-medium">{resource.status}</span>
              </div>
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-slate-700 dark:text-slate-300">{resource.description}</p>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}

// Loading skeleton component
function ResourceDetailSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 animate-pulse">
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
      <div className="space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
      </div>
    </div>
  );
}
```

---

## Template 3: Loading State

**Use for**: `loading.tsx` files in route groups

```typescript
/**
 * Route Group Loading UI
 * Displays while pages in this route group are loading
 */

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-900">
      <div className="text-center space-y-6 max-w-md">
        {/* Loading Spinner */}
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-4 border-slate-200 dark:border-slate-700 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full border-t-transparent animate-spin" />
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Loading...
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Please wait while we prepare your content
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
```

---

## Template 4: Error Boundary

**Use for**: `error.tsx` files in route groups

```typescript
'use client';

/**
 * Route Group Error Boundary
 * Catches and displays errors in this route group
 */

import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    console.error('Route Error:', {
      message: error.message,
      digest: error.digest,
      timestamp: new Date().toISOString(),
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Header */}
        <div className="bg-red-500 p-6 text-white">
          <div className="flex items-center gap-4">
            <AlertTriangle className="h-8 w-8" />
            <h1 className="text-xl font-bold">Something Went Wrong</h1>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-slate-700 dark:text-slate-300">
            An unexpected error occurred. Please try again.
          </p>

          {process.env.NODE_ENV === 'development' && (
            <pre className="p-4 bg-slate-100 dark:bg-slate-700 rounded text-sm overflow-auto">
              {error.message}
            </pre>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
            >
              <Home className="h-4 w-4" />
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Template 5: Custom Hook

**Use for**: Creating new hooks following project patterns

```typescript
/**
 * useResource Hook
 *
 * @description Custom hook for [description]
 * @example
 * ```tsx
 * const { data, isLoading, error, refetch } = useResource(id);
 * ```
 */

import { useCallback, useEffect, useState } from 'react';

interface UseResourceOptions {
  enabled?: boolean;
  onSuccess?: (data: Resource) => void;
  onError?: (error: Error) => void;
}

interface UseResourceResult {
  data: Resource | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useResource(
  id: string,
  options: UseResourceOptions = {}
): UseResourceResult {
  const { enabled = true, onSuccess, onError } = options;

  const [data, setData] = useState<Resource | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/resource/${id}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const result = await response.json();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [id, enabled, onSuccess, onError]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}
```

---

## Quick Reference: Common Fixes

### Fix: Async Params (Next.js 16)

**Before** (broken):
```typescript
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
}
```

**After** (correct):
```typescript
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
}
```

### Fix: Missing Security Headers

**Before** (incomplete):
```typescript
return NextResponse.json(data, { status: 200 });
```

**After** (complete):
```typescript
import { CORS_HEADERS, SECURITY_HEADERS } from "@/lib/api-headers";

return NextResponse.json(data, {
  status: 200,
  headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
});
```

### Fix: Missing Error Handling

**Before** (no try/catch):
```typescript
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const response = await proxyToBackend(request, `/api/resource/${id}`);
  return response;
}
```

**After** (with error handling):
```typescript
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_ID', message: 'Valid ID required' },
        { status: 400, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
      );
    }
    const response = await proxyToBackend(request, `/api/resource/${id}`);
    return response;
  } catch (error) {
    console.error('[API] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR', message: 'Unexpected error' },
      { status: 500, headers: { ...CORS_HEADERS, ...SECURITY_HEADERS } }
    );
  }
}
```
