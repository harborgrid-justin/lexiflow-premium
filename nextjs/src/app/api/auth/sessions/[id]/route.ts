import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * DELETE /api/auth/sessions/:id - Revoke a specific session
 * @headers Authorization: Bearer <token>
 * @param id - Session ID to revoke
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/auth/sessions/${params.id}`);
}
