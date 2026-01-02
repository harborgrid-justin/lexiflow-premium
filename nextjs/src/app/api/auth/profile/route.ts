import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/auth/profile - Get current user profile
 * @headers Authorization: Bearer <token>
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/auth/profile");
}

/**
 * PUT /api/auth/profile - Update current user profile
 * @headers Authorization: Bearer <token>
 * @body { name?: string, email?: string, ... }
 */
export async function PUT(request: NextRequest) {
  return proxyToBackend(request, "/auth/profile");
}
