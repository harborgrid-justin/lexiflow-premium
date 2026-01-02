import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/legal-entities/[id]/relationships
 * Get entity relationships (parent, subsidiary, affiliated)
 * Migrated from: backend/src/legal-entities/legal-entities.controller.ts
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return proxyToBackend(
    request,
    `/api/legal-entities/${params.id}/relationships`
  );
}
