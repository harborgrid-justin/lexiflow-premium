import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * PUT /api/case-teams/:id - Update case team member
 * @headers Authorization: Bearer <token>
 * @body { role?: string, permissions?: string[] }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/api/case-teams/${params.id}`);
}

/**
 * DELETE /api/case-teams/:id - Remove team member from case
 * @headers Authorization: Bearer <token>
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return proxyToBackend(request, `/api/case-teams/${params.id}`);
}
