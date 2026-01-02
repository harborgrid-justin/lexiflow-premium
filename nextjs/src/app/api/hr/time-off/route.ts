import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Time Off Management API Routes
 */

// GET /api/hr/time-off - Get time off requests
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/hr/time-off");
}

// POST /api/hr/time-off - Create time off request
export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/hr/time-off");
}
