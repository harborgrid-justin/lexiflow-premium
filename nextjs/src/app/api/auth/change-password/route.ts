import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/change-password - Change user password
 * @headers Authorization: Bearer <token>
 * @body { currentPassword: string, newPassword: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/auth/change-password");
}
