import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Risk Health Check API Route
 */

// GET /api/risks/health - Health check
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/risks/health");
}
