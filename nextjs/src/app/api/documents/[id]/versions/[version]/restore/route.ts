import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/documents/:id/versions/:version/restore - Restore a specific version
 * @headers Authorization: Bearer <token>
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; version: string }> }
) {
  const { id, version } = await params;
  return proxyToBackend(
    request,
    `/api/documents/${id}/versions/${version}/restore`
  );
}
