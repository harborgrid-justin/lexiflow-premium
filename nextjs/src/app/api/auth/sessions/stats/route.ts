import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/auth/sessions/stats - Get session statistics for current user
 * @headers Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/auth/sessions/stats");
}
