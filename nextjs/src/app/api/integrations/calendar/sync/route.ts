import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * POST /api/integrations/calendar/sync - Sync calendar events
 */

export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations/calendar/sync`);
}
