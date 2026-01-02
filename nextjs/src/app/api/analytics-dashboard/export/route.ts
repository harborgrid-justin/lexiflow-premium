import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/analytics-dashboard/export
 * Export analytics data in various formats
 * Migrated from: backend/src/analytics-dashboard/analytics-dashboard.controller.ts
 */

export async function POST(request: NextRequest) {
  return proxyToBackend(request, `/api/analytics-dashboard/export`, {
    stream: true,
  });
}
