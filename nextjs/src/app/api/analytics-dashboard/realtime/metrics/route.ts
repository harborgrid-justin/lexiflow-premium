import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/analytics-dashboard/realtime/metrics
 * Get real-time metrics snapshot
 * Migrated from: backend/src/analytics-dashboard/analytics-dashboard.controller.ts
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/analytics-dashboard/realtime/metrics`);
}
