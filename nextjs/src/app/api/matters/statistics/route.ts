import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/matters/statistics - Get matter statistics
 * @headers Authorization: Bearer <token>
 * @query userId (optional)
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/matters/statistics");
}
