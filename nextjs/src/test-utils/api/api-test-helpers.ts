/**
 * API Test Helpers
 *
 * Utility functions for testing Next.js API routes.
 * Provides mock request/response builders, backend mock utilities,
 * and common assertion helpers.
 */

import { NextRequest, NextResponse } from "next/server";

// ============================================================================
// Types
// ============================================================================

export interface MockRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
  headers?: Record<string, string>;
  body?: unknown;
  searchParams?: Record<string, string>;
  cookies?: Record<string, string>;
}

export interface MockBackendResponse {
  status?: number;
  statusText?: string;
  body?: unknown;
  headers?: Record<string, string>;
  delay?: number;
}

export interface ApiErrorResponse {
  error: string;
  code: string;
  message: string;
}

export interface TestUser {
  id: string;
  email: string;
  token: string;
  role?: string;
}

// ============================================================================
// Mock Request Builders
// ============================================================================

/**
 * Create a NextRequest for testing API routes
 *
 * @example
 * const request = createNextRequest('/api/cases', {
 *   method: 'POST',
 *   headers: { Authorization: 'Bearer token123' },
 *   body: { title: 'New Case' }
 * });
 */
export function createNextRequest(
  path: string,
  options: MockRequestOptions = {}
): NextRequest {
  const {
    method = "GET",
    headers = {},
    body,
    searchParams = {},
    cookies = {},
  } = options;

  // Build URL
  const url = new URL(path, "http://localhost:3400");
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  // Build headers
  const requestHeaders = new Headers();
  Object.entries(headers).forEach(([key, value]) => {
    requestHeaders.set(key, value);
  });

  // Add cookies as header
  if (Object.keys(cookies).length > 0) {
    const cookieString = Object.entries(cookies)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
    requestHeaders.set("cookie", cookieString);
  }

  // Add content-type for body requests
  if (body && !requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }

  // Build request init
  const init: RequestInit = {
    method,
    headers: requestHeaders,
  };

  // Add body for applicable methods
  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  return new NextRequest(url.toString(), init);
}

/**
 * Create an authenticated request with Bearer token
 */
export function createAuthenticatedRequest(
  path: string,
  token: string,
  options: Omit<MockRequestOptions, "headers"> & {
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  return createNextRequest(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Create a request with JSON body
 */
export function createJsonRequest(
  path: string,
  body: unknown,
  options: Omit<MockRequestOptions, "body"> = {}
): NextRequest {
  return createNextRequest(path, {
    ...options,
    method: options.method || "POST",
    body,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
    },
  });
}

// ============================================================================
// Mock Backend Utilities
// ============================================================================

/**
 * Setup mock fetch to simulate backend responses
 *
 * @example
 * const mockFetch = setupBackendMock({
 *   '/api/cases': { body: { cases: [] }, status: 200 },
 *   '/api/users': { body: { users: [] }, status: 200 },
 * });
 */
export function setupBackendMock(
  responses: Record<string, MockBackendResponse>
): jest.Mock {
  const mockFn = jest.fn().mockImplementation(async (url: string) => {
    // Extract path from URL
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Find matching response
    const response = responses[path];
    if (!response) {
      return new Response(JSON.stringify({ error: "Not Found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Apply delay if specified
    if (response.delay) {
      await new Promise((resolve) => setTimeout(resolve, response.delay));
    }

    // Build response
    const responseHeaders = new Headers(response.headers);
    if (!responseHeaders.has("Content-Type")) {
      responseHeaders.set("Content-Type", "application/json");
    }

    return new Response(
      typeof response.body === "string"
        ? response.body
        : JSON.stringify(response.body ?? {}),
      {
        status: response.status ?? 200,
        statusText: response.statusText ?? "OK",
        headers: responseHeaders,
      }
    );
  });

  global.fetch = mockFn;
  return mockFn;
}

/**
 * Setup mock fetch to return a single response
 */
export function mockBackendResponse(response: MockBackendResponse): jest.Mock {
  const mockFn = jest.fn().mockResolvedValue(
    new Response(
      typeof response.body === "string"
        ? response.body
        : JSON.stringify(response.body ?? {}),
      {
        status: response.status ?? 200,
        statusText: response.statusText ?? "OK",
        headers: new Headers({
          "Content-Type": "application/json",
          ...response.headers,
        }),
      }
    )
  );

  global.fetch = mockFn;
  return mockFn;
}

/**
 * Setup mock fetch to reject with an error
 */
export function mockBackendError(error: Error | string): jest.Mock {
  const mockFn = jest
    .fn()
    .mockRejectedValue(typeof error === "string" ? new Error(error) : error);

  global.fetch = mockFn;
  return mockFn;
}

/**
 * Setup mock fetch to simulate timeout
 */
export function mockBackendTimeout(timeoutMs: number = 35000): jest.Mock {
  const mockFn = jest.fn().mockImplementation(
    () =>
      new Promise((_, reject) => {
        setTimeout(() => {
          const error = new Error("Timeout");
          error.name = "AbortError";
          reject(error);
        }, timeoutMs);
      })
  );

  global.fetch = mockFn;
  return mockFn;
}

/**
 * Setup mock fetch to simulate connection refused
 */
export function mockBackendUnavailable(): jest.Mock {
  const error = new Error("fetch failed");
  (error as NodeJS.ErrnoException).code = "ECONNREFUSED";

  const mockFn = jest.fn().mockRejectedValue(error);
  global.fetch = mockFn;
  return mockFn;
}

// ============================================================================
// Response Assertion Helpers
// ============================================================================

/**
 * Parse and assert JSON response
 */
export async function expectJsonResponse<T = unknown>(
  response: Response | NextResponse
): Promise<T> {
  expect(response.headers.get("content-type")).toContain("application/json");
  const data = await response.json();
  return data as T;
}

/**
 * Assert response is a successful JSON response
 */
export async function expectSuccess<T = unknown>(
  response: Response | NextResponse,
  expectedStatus: number = 200
): Promise<T> {
  expect(response.status).toBe(expectedStatus);
  return expectJsonResponse<T>(response);
}

/**
 * Assert response is an error response
 */
export async function expectError(
  response: Response | NextResponse,
  expectedStatus: number,
  expectedCode?: string
): Promise<ApiErrorResponse> {
  expect(response.status).toBe(expectedStatus);
  const data = await expectJsonResponse<ApiErrorResponse>(response);
  expect(data).toHaveProperty("error");
  expect(data).toHaveProperty("code");
  expect(data).toHaveProperty("message");
  if (expectedCode) {
    expect(data.code).toBe(expectedCode);
  }
  return data;
}

/**
 * Assert response has required headers
 */
export function expectHeaders(
  response: Response | NextResponse,
  headers: Record<string, string>
): void {
  Object.entries(headers).forEach(([key, value]) => {
    expect(response.headers.get(key)).toBe(value);
  });
}

/**
 * Assert response has CORS headers
 */
export function expectCorsHeaders(response: Response | NextResponse): void {
  expect(response.headers.has("Access-Control-Allow-Origin")).toBe(true);
  expect(response.headers.has("Access-Control-Allow-Methods")).toBe(true);
  expect(response.headers.has("Access-Control-Allow-Headers")).toBe(true);
}

/**
 * Assert response has security headers
 */
export function expectSecurityHeaders(response: Response | NextResponse): void {
  expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  expect(response.headers.get("X-Frame-Options")).toBe("DENY");
  expect(response.headers.get("X-XSS-Protection")).toBe("1; mode=block");
}

// ============================================================================
// Test Data Factories
// ============================================================================

/**
 * Create a test user with token
 */
export function createTestUser(overrides: Partial<TestUser> = {}): TestUser {
  return {
    id: "test-user-id-123",
    email: "test@example.com",
    token: "test-jwt-token-abc123",
    role: "user",
    ...overrides,
  };
}

/**
 * Create a test admin user
 */
export function createTestAdmin(overrides: Partial<TestUser> = {}): TestUser {
  return createTestUser({
    id: "admin-user-id-456",
    email: "admin@example.com",
    token: "admin-jwt-token-xyz789",
    role: "admin",
    ...overrides,
  });
}

/**
 * Generate random test data
 */
export const testData = {
  string: (prefix: string = "test") => `${prefix}-${Date.now()}`,
  email: () => `test-${Date.now()}@example.com`,
  uuid: () => `test-uuid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  number: (min: number = 1, max: number = 1000) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
  date: (daysFromNow: number = 0) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString();
  },
};

// ============================================================================
// Route Handler Test Wrapper
// ============================================================================

/**
 * Wrapper for testing route handlers with proper context
 *
 * @example
 * const { GET, POST } = await import('@/app/api/cases/route');
 *
 * it('should return cases', async () => {
 *   const response = await testRouteHandler(GET, {
 *     path: '/api/cases',
 *     method: 'GET',
 *     headers: { Authorization: 'Bearer token' },
 *   });
 *   expect(response.status).toBe(200);
 * });
 */
export async function testRouteHandler(
  handler: (request: NextRequest, context?: unknown) => Promise<Response>,
  options: MockRequestOptions & {
    path: string;
    params?: Record<string, string>;
  }
): Promise<Response> {
  const request = createNextRequest(options.path, options);

  // Create context with params if provided
  const context = options.params ? { params: options.params } : undefined;

  return handler(request, context);
}

/**
 * Test multiple HTTP methods on a route
 */
export async function testRouteMethods(
  handlers: Record<string, (request: NextRequest) => Promise<Response>>,
  path: string,
  options: {
    allowedMethods: string[];
    authRequired?: boolean;
    token?: string;
  }
): Promise<void> {
  const allMethods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
  const { allowedMethods, authRequired = false, token } = options;

  for (const method of allMethods) {
    const handler = handlers[method];
    const isAllowed = allowedMethods.includes(method);

    if (handler) {
      const requestOptions: MockRequestOptions = {
        method: method as MockRequestOptions["method"],
      };

      if (authRequired && token) {
        requestOptions.headers = { Authorization: `Bearer ${token}` };
      }

      const request = createNextRequest(path, requestOptions);
      const response = await handler(request);

      if (isAllowed) {
        // Should not return 405 for allowed methods
        expect(response.status).not.toBe(405);
      }
    }
  }
}

// ============================================================================
// Mock Data for Common API Resources
// ============================================================================

export const mockData = {
  case: {
    id: "case-123",
    title: "Test Case",
    status: "open",
    clientId: "client-456",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  client: {
    id: "client-456",
    name: "Test Client",
    email: "client@example.com",
    phone: "+1234567890",
    createdAt: new Date().toISOString(),
  },

  document: {
    id: "doc-789",
    name: "Test Document.pdf",
    type: "application/pdf",
    size: 1024000,
    caseId: "case-123",
    uploadedAt: new Date().toISOString(),
  },

  user: {
    id: "user-101",
    email: "user@example.com",
    name: "Test User",
    role: "attorney",
    createdAt: new Date().toISOString(),
  },

  task: {
    id: "task-202",
    title: "Test Task",
    description: "A test task description",
    status: "pending",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    assigneeId: "user-101",
    caseId: "case-123",
  },
};

// ============================================================================
// Cleanup Utilities
// ============================================================================

/**
 * Reset all mocks between tests
 */
export function resetMocks(): void {
  jest.clearAllMocks();
  jest.restoreAllMocks();
}

/**
 * Restore original fetch
 */
export function restoreFetch(): void {
  // This should be called in afterAll if you modified global.fetch
  jest.restoreAllMocks();
}
