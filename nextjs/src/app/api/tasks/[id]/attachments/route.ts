import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest, NextResponse } from "next/server";
import { CORS_HEADERS, SECURITY_HEADERS } from "@/lib/api-headers";

// Cache policy: API routes are dynamic and should not be cached
export const dynamic = 'force-dynamic';

/**
 * API Route Handler for Task Attachments
 * Handles /api/tasks/[id]/attachments operations
 *
 * GET /api/tasks/[id]/attachments - List all attachments for a task
 * POST /api/tasks/[id]/attachments - Upload a new attachment (multipart/form-data)
 *
 * @security Requires authentication
 * @see Frontend: frontend/src/api/workflow/tasks-api.ts - getAttachments(), uploadAttachment()
 */
interface RouteParams {
  params: Promise<{ id: string }>;
}

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/zip',
  'application/x-zip-compressed',
];

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: { ...CORS_HEADERS, ...SECURITY_HEADERS },
  });
}

/**
 * GET /api/tasks/[id]/attachments - List attachments for a task
 *
 * @returns TaskAttachment[] - Array of attachment metadata
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
    console.log(`[API] GET /api/tasks/${id}/attachments - ${request.headers.get('x-forwarded-for') || 'unknown'}`);

    const response = await proxyToBackend(request, `/api/tasks/${id}/attachments`);

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
    console.error(`[API] GET /api/tasks/[id]/attachments error:`, error);
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
 * POST /api/tasks/[id]/attachments - Upload a new attachment
 *
 * @body FormData with 'file' field
 * @returns TaskAttachment - Created attachment metadata
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

    // Validate content type for file upload
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('multipart/form-data')) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_CONTENT_TYPE', message: 'Content-Type must be multipart/form-data for file uploads' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Parse form data and validate file
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_FORM_DATA', message: 'Invalid form data' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    const file = formData.get('file');

    // Validate file presence
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'VALIDATION_ERROR', message: 'File is required. Use form field "file" to upload.' },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'FILE_TOO_LARGE', message: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Bad Request', code: 'INVALID_FILE_TYPE', message: `File type "${file.type}" is not allowed. Allowed types: PDF, Word, Excel, PowerPoint, text, images, and ZIP files.` },
        {
          status: 400,
          headers: { ...CORS_HEADERS, ...SECURITY_HEADERS }
        }
      );
    }

    // Log request
    console.log(`[API] POST /api/tasks/${id}/attachments - ${request.headers.get('x-forwarded-for') || 'unknown'} - File: ${file.name} (${file.size} bytes)`);

    // Proxy to backend with streaming support for file uploads
    const response = await proxyToBackend(request, `/api/tasks/${id}/attachments`, {
      timeout: 60000, // Extended timeout for file uploads
    });

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
    console.error(`[API] POST /api/tasks/[id]/attachments error:`, error);
    return NextResponse.json(
      { error: 'Internal Server Error', code: 'INTERNAL_ERROR', message: 'An unexpected error occurred during file upload' },
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
    { error: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED', message: 'DELETE method not supported on this endpoint. Use DELETE /api/tasks/[id]/attachments/[attachmentId] for specific attachments.' },
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
