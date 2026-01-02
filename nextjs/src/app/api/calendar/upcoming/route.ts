import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Upcoming Calendar Events API Route
 */

// GET /api/calendar/upcoming - Get upcoming events
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/calendar/upcoming");
}
