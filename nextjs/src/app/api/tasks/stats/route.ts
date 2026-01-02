import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Task Statistics API Route
 */

// GET /api/tasks/stats - Get task statistics
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/tasks/stats");
}
