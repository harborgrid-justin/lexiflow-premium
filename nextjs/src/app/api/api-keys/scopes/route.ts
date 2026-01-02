import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/api-keys/scopes
 * Get available API key scopes
 * Migrated from: backend/src/api-keys/api-keys.controller.ts
 */

export async function GET(request: NextRequest) {
  return proxyToBackend(request, `/api/api-keys/scopes`);
}
