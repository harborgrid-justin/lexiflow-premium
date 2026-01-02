import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/users/:id - Get user by ID
 * @headers Authorization: Bearer <token>
 * @permission USER_MANAGE
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/users/${params.id}`);
}

/**
 * PUT /api/users/:id - Update user
 * @headers Authorization: Bearer <token>
 * @body { name?: string, email?: string, role?: string }
 * @permission USER_MANAGE
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/users/${params.id}`);
}

/**
 * DELETE /api/users/:id - Delete user
 * @headers Authorization: Bearer <token>
 * @permission USER_MANAGE
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/users/${params.id}`);
}
