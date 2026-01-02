import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backend-proxy";

/**
 * Data Sources Integration API Routes
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations/data-sources`);
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/integrations/data-sources`);
}
