import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Risk Heatmap API Route
 * Provides risk distribution data for visualization
 */

// GET /api/risks/heatmap - Get risk heatmap data
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/risks/heatmap");
}
