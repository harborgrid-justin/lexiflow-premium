import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/reset-password - Reset password using token from email
 * @body { token: string, newPassword: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/auth/reset-password");
}
