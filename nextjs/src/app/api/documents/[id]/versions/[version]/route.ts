import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/documents/:id/versions/:version - Get a specific version
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  const { id, version } = await params;
  return proxyToBackend(request, `/api/documents/${id}/versions/${version}`);
}
