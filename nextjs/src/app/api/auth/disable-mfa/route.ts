import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/disable-mfa - Disable MFA for current user
 * @headers Authorization: Bearer <token>
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/auth/disable-mfa");
}
