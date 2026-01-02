import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/users - Retrieve all users
 * @headers Authorization: Bearer <token>
 * @permission USER_MANAGE
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/users");
}

/**
 * POST /api/users - Create a new user
 * @headers Authorization: Bearer <token>
 * @body { email: string, name: string, password: string, role?: string }
 * @permission USER_MANAGE
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/users");
}
