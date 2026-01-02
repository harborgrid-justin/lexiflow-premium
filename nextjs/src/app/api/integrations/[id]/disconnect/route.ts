import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/integrations/[id]/disconnect
 * Disconnect an integration
 * Migrated from: backend/src/integrations/integrations.controller.ts
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/integrations/${params.id}/disconnect`);
}
