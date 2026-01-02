import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/login - Login with email and password
 * @body { email: string, password: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/auth/login");
}
