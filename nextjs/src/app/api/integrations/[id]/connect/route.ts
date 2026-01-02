import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/integrations/[id]/connect
 * Connect an integration with credentials
 * Migrated from: backend/src/integrations/integrations.controller.ts
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(request, `/api/integrations/${params.id}/connect`);
}
