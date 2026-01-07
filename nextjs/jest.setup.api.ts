/**
 * Jest Setup File for API Route Testing
 *
 * This file runs before each API test suite and sets up:
 * - Mock implementations for Next.js server components
 * - Global fetch mock
 * - Environment variables for testing
 * - Custom matchers for API response assertions
 * - Request/Response utilities
 */

import { TextEncoder, TextDecoder } from "util";

// Polyfill TextEncoder/TextDecoder for Node environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as typeof global.TextDecoder;

// ============================================================================
// Environment Variables for Testing
// ============================================================================
process.env.NODE_ENV = "test";
process.env.BACKEND_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000";
process.env.ALLOWED_ORIGINS = "http://localhost:3400";

// ============================================================================
// Global Fetch Mock Setup
// ============================================================================
const originalFetch = global.fetch;

// Mock fetch implementation that can be customized per test
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Reset fetch mock before each test
beforeEach(() => {
  mockFetch.mockReset();
  // Default successful response
  mockFetch.mockResolvedValue(
    new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );
});

// Restore original fetch after all tests
afterAll(() => {
  global.fetch = originalFetch;
});

// Export mock fetch for test customization
export { mockFetch };

// ============================================================================
// Console Mocking (suppress expected errors in tests)
// ============================================================================
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console.log in tests (keeps output clean)
  console.log = jest.fn();

  // Filter out expected errors
  console.error = (...args: unknown[]) => {
    const message = args[0];
    if (
      typeof message === "string" &&
      (message.includes("[API]") ||
        message.includes("[Backend Proxy Error]") ||
        message.includes("Expected test error"))
    ) {
      return; // Suppress expected API logs
    }
    originalConsoleError.call(console, ...args);
  };

  // Suppress specific warnings
  console.warn = (...args: unknown[]) => {
    const message = args[0];
    if (typeof message === "string" && message.includes("experimental")) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

// ============================================================================
// Custom Jest Matchers for API Testing
// ============================================================================
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeSuccessResponse(): R;
      toBeErrorResponse(expectedStatus?: number): R;
      toHaveJsonBody(): R;
      toHaveStatus(status: number): R;
      toHaveCorsHeaders(): R;
      toHaveSecurityHeaders(): R;
      toHaveHeader(headerName: string, expectedValue?: string): R;
    }
  }
}

expect.extend({
  /**
   * Assert response is a success (2xx status)
   */
  toBeSuccessResponse(received: Response) {
    const pass = received.status >= 200 && received.status < 300;
    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to be successful, but got status ${received.status}`
          : `Expected response to be successful (2xx), but got status ${received.status}`,
    };
  },

  /**
   * Assert response is an error response
   */
  toBeErrorResponse(received: Response, expectedStatus?: number) {
    const isError = received.status >= 400;
    const statusMatch = expectedStatus
      ? received.status === expectedStatus
      : true;
    const pass = isError && statusMatch;
    return {
      pass,
      message: () => {
        if (!isError) {
          return `Expected error response (4xx/5xx), but got status ${received.status}`;
        }
        if (!statusMatch) {
          return `Expected error status ${expectedStatus}, but got ${received.status}`;
        }
        return `Expected response not to be an error, but got status ${received.status}`;
      },
    };
  },

  /**
   * Assert response has JSON content type
   */
  toHaveJsonBody(received: Response) {
    const contentType = received.headers.get("content-type") || "";
    const pass = contentType.includes("application/json");
    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to have JSON body, but Content-Type is ${contentType}`
          : `Expected response to have JSON body, but Content-Type is ${contentType}`,
    };
  },

  /**
   * Assert response has specific status code
   */
  toHaveStatus(received: Response, status: number) {
    const pass = received.status === status;
    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to have status ${status}`
          : `Expected response to have status ${status}, but got ${received.status}`,
    };
  },

  /**
   * Assert response has CORS headers
   */
  toHaveCorsHeaders(received: Response) {
    const hasOrigin = received.headers.has("Access-Control-Allow-Origin");
    const hasMethods = received.headers.has("Access-Control-Allow-Methods");
    const hasHeaders = received.headers.has("Access-Control-Allow-Headers");
    const pass = hasOrigin && hasMethods && hasHeaders;
    return {
      pass,
      message: () => {
        const missing = [];
        if (!hasOrigin) missing.push("Access-Control-Allow-Origin");
        if (!hasMethods) missing.push("Access-Control-Allow-Methods");
        if (!hasHeaders) missing.push("Access-Control-Allow-Headers");
        return pass
          ? `Expected response not to have CORS headers`
          : `Expected response to have CORS headers. Missing: ${missing.join(", ")}`;
      },
    };
  },

  /**
   * Assert response has security headers
   */
  toHaveSecurityHeaders(received: Response) {
    const hasXCTO = received.headers.has("X-Content-Type-Options");
    const hasXFO = received.headers.has("X-Frame-Options");
    const hasXXSS = received.headers.has("X-XSS-Protection");
    const pass = hasXCTO && hasXFO && hasXXSS;
    return {
      pass,
      message: () => {
        const missing = [];
        if (!hasXCTO) missing.push("X-Content-Type-Options");
        if (!hasXFO) missing.push("X-Frame-Options");
        if (!hasXXSS) missing.push("X-XSS-Protection");
        return pass
          ? `Expected response not to have security headers`
          : `Expected response to have security headers. Missing: ${missing.join(", ")}`;
      },
    };
  },

  /**
   * Assert response has specific header
   */
  toHaveHeader(
    received: Response,
    headerName: string,
    expectedValue?: string
  ) {
    const actualValue = received.headers.get(headerName);
    const hasHeader = actualValue !== null;
    const valueMatches = expectedValue ? actualValue === expectedValue : true;
    const pass = hasHeader && valueMatches;
    return {
      pass,
      message: () => {
        if (!hasHeader) {
          return `Expected response to have header "${headerName}", but it was not present`;
        }
        if (!valueMatches) {
          return `Expected header "${headerName}" to equal "${expectedValue}", but got "${actualValue}"`;
        }
        return `Expected response not to have header "${headerName}"`;
      },
    };
  },
});

// ============================================================================
// Mock crypto.randomUUID (for correlation IDs)
// ============================================================================
if (!global.crypto) {
  global.crypto = {
    randomUUID: () => "test-uuid-1234-5678-90ab-cdef12345678",
    getRandomValues: (array: Uint8Array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
  } as Crypto;
}

// ============================================================================
// Mock AbortSignal.timeout (for request timeouts)
// ============================================================================
if (!AbortSignal.timeout) {
  AbortSignal.timeout = (ms: number) => {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  };
}

// ============================================================================
// Request/Response Helpers (attached to global for convenience)
// ============================================================================
declare global {
  var createMockRequest: typeof createMockRequestFn;
  var createMockResponse: typeof createMockResponseFn;
  var parseResponseJson: typeof parseResponseJsonFn;
}

/**
 * Create a mock NextRequest for testing
 */
function createMockRequestFn(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: unknown;
    searchParams?: Record<string, string>;
  } = {}
): Request {
  const { method = "GET", headers = {}, body, searchParams = {} } = options;

  // Build URL with search params
  const urlObj = new URL(url, "http://localhost:3400");
  Object.entries(searchParams).forEach(([key, value]) => {
    urlObj.searchParams.set(key, value);
  });

  // Build headers
  const requestHeaders = new Headers(headers);
  if (body && !requestHeaders.has("content-type")) {
    requestHeaders.set("content-type", "application/json");
  }

  // Build request init
  const init: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  return new Request(urlObj.toString(), init);
}

/**
 * Create a mock Response for testing
 */
function createMockResponseFn(
  body: unknown,
  options: {
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
  } = {}
): Response {
  const { status = 200, statusText = "OK", headers = {} } = options;

  const responseHeaders = new Headers(headers);
  if (!responseHeaders.has("content-type")) {
    responseHeaders.set("content-type", "application/json");
  }

  return new Response(
    typeof body === "string" ? body : JSON.stringify(body),
    {
      status,
      statusText,
      headers: responseHeaders,
    }
  );
}

/**
 * Parse JSON from Response
 */
async function parseResponseJsonFn<T = unknown>(
  response: Response
): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Failed to parse response as JSON: ${text}`);
  }
}

// Attach to global
global.createMockRequest = createMockRequestFn;
global.createMockResponse = createMockResponseFn;
global.parseResponseJson = parseResponseJsonFn;

// ============================================================================
// Test Lifecycle Hooks
// ============================================================================
beforeEach(() => {
  // Reset any test-specific state
  jest.clearAllMocks();
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

// ============================================================================
// Export utilities for direct import in tests
// ============================================================================
export {
  createMockRequestFn as createMockRequest,
  createMockResponseFn as createMockResponse,
  parseResponseJsonFn as parseResponseJson,
};
