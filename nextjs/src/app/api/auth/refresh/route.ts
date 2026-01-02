import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/refresh - Refresh access token using refresh token
 * @body { refreshToken: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/auth/refresh");
}
