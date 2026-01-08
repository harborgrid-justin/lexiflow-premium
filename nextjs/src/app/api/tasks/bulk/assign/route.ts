import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, SECURITY_HEADERS } from "@/lib/api-headers";

// Cache policy: API routes are dynamic and should not be cached
export const dynamic = 'force-dynamic';

/**
 * API Route Handler
 * Handles /api/tasks/bulk/assign operations
 *
 * POST /api/tasks/bulk/assign - Bulk assign tasks to a user
 *
 * @security Requires authentication
 *
 * Request body:
 * {
 *   "taskIds": ["task-uuid-1", "task-uuid-2", ...],
 *   "assignedTo": "user-uuid"
 * }
 *
 * Response:
 * {
 *   "success": number,    // Number of successfully assigned tasks
 *   "failed": number,     // Number of failed assignments
 *   "total": number,      // Total tasks processed
 *   "errors"?: Array<{    // Optional array of errors
 *     "taskId": string,
 *     "error": string
 *   }>
 * }
 */

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: { ...CORS_HEADERS, ...SECURITY_HEADERS },
  });
}

// POST /api/tasks/bulk/assign - Bulk assign tasks to user
export async function POST(request: NextRequest) {
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
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_JSON', message: 'Invalid JSON in request body' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Validate required fields - taskIds array
    if (!body.taskIds || !Array.isArray(body.taskIds) || body.taskIds.length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'MISSING_TASK_IDS', message: 'taskIds is required and must be a non-empty array of task IDs' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Validate all taskIds are strings
    const invalidTaskIds = body.taskIds.filter((id: unknown) => typeof id !== 'string' || !id.trim());
    if (invalidTaskIds.length > 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_TASK_IDS', message: 'All taskIds must be non-empty strings' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Validate required fields - assignedTo
    if (!body.assignedTo || typeof body.assignedTo !== 'string' || body.assignedTo.trim().length === 0) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'MISSING_ASSIGNEE', message: 'assignedTo is required and must be a non-empty string (user ID)' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Validate reasonable batch size (prevent abuse)
    const MAX_BATCH_SIZE = 100;
    if (body.taskIds.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'BATCH_SIZE_EXCEEDED', message: `Maximum batch size is ${MAX_BATCH_SIZE} tasks. Please split into smaller batches.` },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Log request
    console.log(`[API] POST /api/tasks/bulk/assign - ${body.taskIds.length} tasks - ${request.headers.get('x-forwarded-for') || 'unknown'}`);

    const response = await proxyToBackend(request, `/api/tasks/bulk/assign`);

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
    console.error(`[API] POST /api/tasks/bulk/assign error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      {
        status: 500,
        headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
      }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'GET method not supported on this endpoint' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'POST, OPTIONS'
      }
    }
  );
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'PUT method not supported on this endpoint' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'POST, OPTIONS'
      }
    }
  );
}

export async function PATCH(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'PATCH method not supported on this endpoint' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'POST, OPTIONS'
      }
    }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'DELETE method not supported on this endpoint' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'POST, OPTIONS'
      }
    }
  );
}

export async function HEAD(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'HEAD method not supported on this endpoint' },
    {
      status: 405,
      headers: {
        ...CORS_HEADERS,
        ...SECURITY_HEADERS,
        'Allow': 'POST, OPTIONS'
      }
    }
  );
}
