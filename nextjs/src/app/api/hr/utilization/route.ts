import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * HR Utilization Analytics API Route
 */

// GET /api/hr/utilization - Get employee utilization metrics
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/hr/utilization");
}
