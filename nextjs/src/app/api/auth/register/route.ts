import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/auth/register - Register a new user account
 * @body { email: string, password: string, name: string }
 */
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/auth/register");
}
