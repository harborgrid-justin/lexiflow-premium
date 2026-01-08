import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, SECURITY_HEADERS } from "@/lib/api-headers";

// Cache policy: API routes are dynamic and should not be cached
export const dynamic = 'force-dynamic';

/**
 * API Route Handler for Task Comments
 * Handles /api/tasks/[id]/comments operations
 *
 * GET /api/tasks/[id]/comments - List all comments for a task
 * POST /api/tasks/[id]/comments - Add a new comment
 *
 * @security Requires authentication
 * @see Frontend: frontend/src/api/workflow/tasks-api.ts - getComments(), addComment()
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

/**
 * GET /api/tasks/[id]/comments - List comments for a task
 *
 * @returns TaskComment[] - Array of comments with user info
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED', message: 'Authentication required' },
        {
          status: 401,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Validate and await params (Next.js v16 requirement)
    const { id } = await params;

    // Validate task ID format
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_ID', message: 'Valid task ID is required' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Log request
    console.log(`[API] GET /api/tasks/${id}/comments - ${request.headers.get('x-forwarded-for') || 'unknown'}`);

    const response = await proxyToBackend(request, `/api/tasks/${id}/comments`);

    // Add security headers to response
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
    console.error(`[API] GET /api/tasks/[id]/comments error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      {
        status: 500,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      }
    );
  }
}

/**
 * POST /api/tasks/[id]/comments - Add a new comment to a task
 *
 * @body CreateCommentDto - { content: string }
 * @returns TaskComment - Created comment with user info
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Validate request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'AUTH_REQUIRED', message: 'Authentication required' },
        {
          status: 401,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Validate and await params (Next.js v16 requirement)
    const { id } = await params;

    // Validate task ID format
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_ID', message: 'Valid task ID is required' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Validate content type
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_CONTENT_TYPE', message: 'Content-Type must be application/json' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Basic request body validation
    let body;
    try {
      body = await request.clone().json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_JSON', message: 'Invalid JSON in request body' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Validate required fields
    if (!body.content || typeof body.content !== 'string' || body.content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'VALIDATION_ERROR', message: 'Comment content is required' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Log request
    console.log(`[API] POST /api/tasks/${id}/comments - ${request.headers.get('x-forwarded-for') || 'unknown'}`);

    const response = await proxyToBackend(request, `/api/tasks/${id}/comments`);

    // Add security headers to response
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
    console.error(`[API] POST /api/tasks/[id]/comments error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      {
        status: 500,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      }
    );
  }
}

// Disallowed methods
export async function PUT() {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'PUT method not supported on this endpoint' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'GET, POST, OPTIONS'
      }
    }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'DELETE method not supported on this endpoint' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'GET, POST, OPTIONS'
      }
    }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'PATCH method not supported on this endpoint' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'GET, POST, OPTIONS'
      }
    }
  );
}
