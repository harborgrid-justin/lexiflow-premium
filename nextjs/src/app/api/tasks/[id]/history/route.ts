import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, SECURITY_HEADERS } from "@/lib/api-headers";

// Cache policy: API routes are dynamic and should not be cached
export const dynamic = 'force-dynamic';

/**
 * API Route Handler for Task History/Audit Trail
 * Handles /api/tasks/[id]/history operations
 *
 * GET /api/tasks/[id]/history - Get audit trail for a task
 *
 * @security Requires authentication
 * @see Frontend: frontend/src/api/workflow/tasks-api.ts - getHistory()
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
 * GET /api/tasks/[id]/history - Get task audit history
 *
 * Returns a chronological list of all changes made to the task including:
 * - Status changes
 * - Assignment changes
 * - Field updates
 * - Comments added
 * - Attachments uploaded
 *
 * @returns TaskHistory[] - Array of history entries with user info and change details
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
    console.log(`[API] GET /api/tasks/${id}/history - ${request.headers.get('x-forwarded-for') || 'unknown'}`);

    const response = await proxyToBackend(request, `/api/tasks/${id}/history`);

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
    console.error(`[API] GET /api/tasks/[id]/history error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      {
        status: 500,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      }
    );
  }
}

// Disallowed methods - History is read-only
export async function POST() {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'POST method not supported. History entries are created automatically.' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'GET, OPTIONS'
      }
    }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'PUT method not supported. History is immutable.' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'GET, OPTIONS'
      }
    }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'DELETE method not supported. History is immutable.' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'GET, OPTIONS'
      }
    }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'PATCH method not supported. History is immutable.' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'GET, OPTIONS'
      }
    }
  );
}
