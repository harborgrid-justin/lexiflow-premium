import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/analytics-dashboard/export/[jobId]
 * Get export job status
 * Migrated from: backend/src/analytics-dashboard/analytics-dashboard.controller.ts
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  return proxyToBackend(
    request,
    `/api/analytics-dashboard/export/${params.jobId}`,
    { stream: true }
  );
}
