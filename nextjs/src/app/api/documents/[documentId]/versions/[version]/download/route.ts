import { proxyToBackend } from "@/lib/backend-proxy";
import { NextRequest } from "next/server";

/**
 * GET /api/documents/:documentId/versions/:version/download - Download a specific version
 * @headers Authorization: Bearer <token>
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { documentId: string; version: string } }
) {
  return proxyToBackend(
    request,
    `/api/documents/${params.documentId}/versions/${params.version}/download`,
    { stream: true }
  );
}
