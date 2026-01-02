import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/matters/pipeline - Get intake pipeline stages
 * @headers Authorization: Bearer <token>
 * @query dateRange (optional)
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/matters/pipeline");
}
