import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * POST /api/documents/:documentId/versions/:version/restore - Restore a specific version
 * @headers Authorization: Bearer <token>
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string; version: string }> }
) {
  return proxyToBackend(
    request,
    `/api/documents/${params.documentId}/versions/${params.version}/restore`
  );
}
