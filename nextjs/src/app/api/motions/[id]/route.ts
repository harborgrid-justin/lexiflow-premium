import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/motions/:id - Get motion by ID
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/motions/${params.id}`);
}

/**
 * PUT /api/motions/:id - Update motion
 * @headers Authorization: Bearer <token>
 * @body { title?: string, type?: string, status?: string, description?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/motions/${params.id}`);
}

/**
 * DELETE /api/motions/:id - Delete motion
 * @headers Authorization: Bearer <token>
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/motions/${params.id}`);
}
