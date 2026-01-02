import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/auth/sessions - Get all active sessions for current user
 * @headers Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/auth/sessions");
}

/**
 * DELETE /api/auth/sessions - Revoke all sessions except the current one
 * @headers Authorization: Bearer <token>
 */
export async function DELETE(request: NextRequest) {
  return proxyToBackend(request, "/auth/sessions");
}
