import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/ocr/health - Health check endpoint
 */
export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/ocr/health");
}
