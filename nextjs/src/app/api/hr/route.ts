import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * HR Module API Routes
 * Handles employee management, time off requests, and utilization tracking
 */

// GET /api/hr - Health check
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/hr");
}
