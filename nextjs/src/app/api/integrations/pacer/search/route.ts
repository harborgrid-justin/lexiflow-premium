import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * POST /api/integrations/pacer/search - Search PACER for cases
 */

export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations/pacer/search`);
}
