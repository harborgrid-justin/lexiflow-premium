import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/api-keys/[id]/usage
 * Get API key usage statistics
 * Migrated from: backend/src/api-keys/api-keys.controller.ts
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/api-keys/${params.id}/usage`);
}
