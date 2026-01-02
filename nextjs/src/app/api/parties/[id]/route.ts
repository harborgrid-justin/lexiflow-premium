import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/parties/:id - Get party by ID
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/parties/${params.id}`);
}

/**
 * PUT /api/parties/:id - Update party
 * @headers Authorization: Bearer <token>
 * @body { name?: string, type?: string, role?: string }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/parties/${params.id}`);
}

/**
 * DELETE /api/parties/:id - Delete party
 * @headers Authorization: Bearer <token>
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/parties/${params.id}`);
}
