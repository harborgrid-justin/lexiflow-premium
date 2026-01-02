import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * POST /api/integrations/pacer/sync - Sync case data from PACER
 */

export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations/pacer/sync`);
}
