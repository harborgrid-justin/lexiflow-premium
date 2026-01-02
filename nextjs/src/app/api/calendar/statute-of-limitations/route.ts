import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Statute of Limitations Events API Route
 */

// GET /api/calendar/statute-of-limitations - Get statute of limitations events
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/calendar/statute-of-limitations");
}
