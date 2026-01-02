import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/matters/:id - Get matter by ID
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/matters/${params.id}`);
}

/**
 * PATCH /api/matters/:id - Update matter
 * @headers Authorization: Bearer <token>
 * @body { title?: string, status?: string, priority?: string, description?: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/matters/${params.id}`);
}

/**
 * DELETE /api/matters/:id - Delete matter
 * @headers Authorization: Bearer <token>
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/matters/${params.id}`);
}
