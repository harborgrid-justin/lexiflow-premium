/**
 * Backend Proxy Utility for Next.js API Routes
 *
 * This utility handles proxying requests from Next.js API routes
 * to the NestJS backend, ensuring:
 * - Proper auth header forwarding
 * - Error handling and status code propagation
 * - Request/response streaming for files
 * - Query parameter and body forwarding
 */

import { NextRequest, NextResponse } from "next/server";

// Backend API configuration
const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";
const BACKEND_API_PREFIX = "/api";

/**
 * Proxy configuration options
 */
export interface ProxyOptions {
  /** Override the backend endpoint path (default: uses the request path) */
  backendPath?: string;
  /** Custom headers to add to the backend request */
  headers?: Record<string, string>;
  /** Whether to forward cookies (default: true) */
  forwardCookies?: boolean;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Whether to stream the response (useful for files) */
  stream?: boolean;
}

/**
 * Main proxy function - forwards Next.js API route requests to NestJS backend
 *
 * @example
 * // In /api/users/route.ts:
 * export async function GET(request: NextRequest) {
 *   return proxyToBackend(request, '/users');
 * }
 *
 * @example
 * // In /api/documents/[id]/download/route.ts:
 * export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
 *   return proxyToBackend(request, `/documents/${params.id}/download`, { stream: true });
 * }
 */
export async function proxyToBackend(
  request: NextRequest,
  backendPath: string,
  options: ProxyOptions = {}
): Promise<NextResponse> {
  const {
    headers: customHeaders = {},
    forwardCookies = true,
    timeout = 30000,
    stream = false,
  } = options;

  try {
    // Build the full backend URL
    const url = new URL(backendPath, BACKEND_URL);

    // Forward query parameters
    const searchParams = request.nextUrl.searchParams;
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });

    // Prepare headers
    const headers = new Headers();

    // Forward authorization header
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers.set("Authorization", authHeader);
    }

    // Forward content-type for POST/PUT/PATCH requests
    const contentType = request.headers.get("content-type");
    if (contentType && ["POST", "PUT", "PATCH"].includes(request.method)) {
      headers.set("Content-Type", contentType);
    }

    // Forward cookies if enabled
    if (forwardCookies) {
      const cookies = request.headers.get("cookie");
      if (cookies) {
        headers.set("Cookie", cookies);
      }
    }

    // Add custom headers
    Object.entries(customHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    // Add correlation ID for tracing
    const correlationId =
      request.headers.get("x-correlation-id") || crypto.randomUUID();
    headers.set("X-Correlation-ID", correlationId);

    // Prepare request body
    let body: BodyInit | undefined;
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      // Check if it's multipart/form-data (file upload)
      if (contentType?.includes("multipart/form-data")) {
        body = await request.formData();
      } else if (contentType?.includes("application/json")) {
        const jsonBody = await request.json();
        body = JSON.stringify(jsonBody);
      } else {
        body = await request.text();
      }
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // Make the backend request
    const backendResponse = await fetch(url.toString(), {
      method: request.method,
      headers,
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle streaming responses (e.g., file downloads)
    if (stream && backendResponse.body) {
      const responseHeaders = new Headers();

      // Forward important headers
      const headersToForward = [
        "content-type",
        "content-disposition",
        "content-length",
        "cache-control",
        "etag",
        "last-modified",
      ];

      headersToForward.forEach((header) => {
        const value = backendResponse.headers.get(header);
        if (value) {
          responseHeaders.set(header, value);
        }
      });

      return new NextResponse(backendResponse.body, {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        headers: responseHeaders,
      });
    }

    // Handle JSON/text responses
    const responseBody = await backendResponse.text();

    // Try to parse as JSON
    let parsedBody;
    try {
      parsedBody = JSON.parse(responseBody);
    } catch {
      parsedBody = responseBody;
    }

    // Return the response
    return NextResponse.json(parsedBody, {
      status: backendResponse.status,
      statusText: backendResponse.statusText,
      headers: {
        "X-Correlation-ID": correlationId,
      },
    });
  } catch (error: any) {
    console.error("[Backend Proxy Error]", {
      path: backendPath,
      method: request.method,
      error: error.message,
    });

    // Handle timeout
    if (error.name === "AbortError") {
      return NextResponse.json(
        { error: "Backend request timeout" },
        { status: 504 }
      );
    }

    // Handle connection errors
    if (
      error.code === "ECONNREFUSED" ||
      error.message.includes("fetch failed")
    ) {
      return NextResponse.json(
        {
          error: "Backend service unavailable",
          message:
            "Unable to connect to the backend service. Please ensure it is running.",
          backendUrl: BACKEND_URL,
        },
        { status: 503 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function for GET requests
 */
export async function proxyGet(
  request: NextRequest,
  backendPath: string,
  options?: ProxyOptions
): Promise<NextResponse> {
  return proxyToBackend(request, backendPath, options);
}

/**
 * Helper function for POST requests
 */
export async function proxyPost(
  request: NextRequest,
  backendPath: string,
  options?: ProxyOptions
): Promise<NextResponse> {
  return proxyToBackend(request, backendPath, options);
}

/**
 * Helper function for PUT requests
 */
export async function proxyPut(
  request: NextRequest,
  backendPath: string,
  options?: ProxyOptions
): Promise<NextResponse> {
  return proxyToBackend(request, backendPath, options);
}

/**
 * Helper function for PATCH requests
 */
export async function proxyPatch(
  request: NextRequest,
  backendPath: string,
  options?: ProxyOptions
): Promise<NextResponse> {
  return proxyToBackend(request, backendPath, options);
}

/**
 * Helper function for DELETE requests
 */
export async function proxyDelete(
  request: NextRequest,
  backendPath: string,
  options?: ProxyOptions
): Promise<NextResponse> {
  return proxyToBackend(request, backendPath, options);
}

/**
 * Utility to extract params from Next.js dynamic routes
 */
export function getParams<T extends Record<string, string>>(context: {
  params: T;
}): T {
  return context.params;
}

/**
 * Health check for backend connectivity
 */
export async function checkBackendHealth(): Promise<{
  healthy: boolean;
  url: string;
  responseTime?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });

    return {
      healthy: response.ok,
      url: BACKEND_URL,
      responseTime: Date.now() - start,
    };
  } catch (error: any) {
    return {
      healthy: false,
      url: BACKEND_URL,
      responseTime: Date.now() - start,
      error: error.message,
    };
  }
}
