import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/verify-mfa - Verify MFA code during login
 * @body { token: string, code: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/auth/verify-mfa");
}
