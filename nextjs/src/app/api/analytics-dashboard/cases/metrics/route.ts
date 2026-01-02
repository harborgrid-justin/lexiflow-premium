import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/analytics-dashboard/cases/metrics
 * Get case metrics
 * Migrated from: backend/src/analytics-dashboard/analytics-dashboard.controller.ts
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/analytics-dashboard/cases/metrics`);
}
