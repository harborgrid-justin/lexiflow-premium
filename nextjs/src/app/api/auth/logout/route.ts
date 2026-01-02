import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/logout - Logout and invalidate tokens
 * @headers Authorization: Bearer <token>
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/auth/logout");
}
