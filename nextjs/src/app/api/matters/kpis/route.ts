import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/matters/kpis - Get matter KPIs
 * @headers Authorization: Bearer <token>
 * @query dateRange (optional)
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/matters/kpis");
}
