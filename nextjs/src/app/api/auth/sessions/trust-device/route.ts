import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/sessions/trust-device - Mark a device/session as trusted
 * @headers Authorization: Bearer <token>
 * @body { sessionId: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/auth/sessions/trust-device");
}
