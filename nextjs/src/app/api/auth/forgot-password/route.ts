import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/forgot-password - Request password reset email
 * @body { email: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/auth/forgot-password");
}
