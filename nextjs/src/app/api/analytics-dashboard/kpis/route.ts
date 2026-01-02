import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/analytics-dashboard/kpis
 * Get key performance indicators
 * Migrated from: backend/src/analytics-dashboard/analytics-dashboard.controller.ts
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/analytics-dashboard/kpis`);
}
