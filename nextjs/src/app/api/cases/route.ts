import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * Cases API Route Handler
 * GET /api/cases - List all cases
 * POST /api/cases - Create a new case
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/cases");
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/cases");
}
